/**
 * @module templates/elements/textelement
 */
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import { attachPlaceholder } from '@ckeditor/ckeditor5-engine/src/view/placeholder';

import TemplateEditing from '../templateediting';
import { downcastTemplateElement, getModelAttributes } from '../utils/conversion';

/**
 * Element names that are considered multiline containers by default.
 *
 * @type {string[]}
 */
export const containerElements = [
	'div',
	'li',
	'blockquote',
	'td',
];

/**
 * Check if an element is a container and therefore allows block elements inside.
 *
 * By default html elements that allow blocks are considered containers. This can be
 * overridden with the `ck-multiline` attribute.
 *
 * @param {module:template/utils/elementinfo~ElementInfo} templateElement
 * @returns {boolean}
 */
function isContainerElement( templateElement ) {
	return templateElement.configuration.multiline !== 'false' && (
		containerElements.includes( templateElement.tagName ) ||
		templateElement.configuration.multiline === 'true'
	);
}

export default class TextElement extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TemplateEditing ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const textElements = this.editor.templates.getElementsByType( 'text' );

		// If the current element is a container, allow bock elements inside it.
		this.editor.model.schema.extend( '$block', {
			allowIn: textElements.filter( isContainerElement ).map( el => el.name ),
		} );

		// If the current element is not a container, only allow text.
		this.editor.model.schema.extend( '$text', {
			allowIn: textElements.filter( el => !isContainerElement( el ) ).map( el => el.name ),
		} );

		// All container text elements inherit everything from root.
		// This also makes sure that all elements allowed in root are as well allowed here.
		for ( const element of textElements ) {
			if ( isContainerElement( element ) ) {
				this.editor.model.schema.extend( element.name, {
					inheritAllFrom: '$root',
				} );
			}

			if ( element.configuration.plain === 'true' ) {
				this.editor.model.schema.addAttributeCheck( context => {
					if ( context.endsWith( `${ element.name } $text` ) ) {
						return false;
					}
				} );
			}
		}

		// Text element editing downcast
		this.editor.conversion.for( 'editingDowncast' ).add( downcastTemplateElement( this.editor, {
			types: [ 'text' ],
			view: ( templateElement, modelElement, viewWriter ) => {
				// TODO: Generalize this?
				if ( modelElement.parent.name === `${ modelElement.name }__conflict__option` ||
					modelElement.parent.name === `${ modelElement.name }__media__conflict__option` ) {
					return viewWriter.createContainerElement(
						templateElement.tagName,
						getModelAttributes( templateElement, modelElement )
					);
				}

				const el = viewWriter.createEditableElement(
					templateElement.tagName,
					getModelAttributes( templateElement, modelElement )
				);

				if ( templateElement.text ) {
					attachPlaceholder( this.editor.editing.view, el, templateElement.text );
				}

				const widget = templateElement.parent ? el : toWidget( el, viewWriter );

				return toWidgetEditable( widget, viewWriter );
			}
		} ), { priority: 'low ' } );

		// Add an empty paragraph if a container text element is empty.
		this.editor.templates.registerPostFixer( [ 'text' ], ( templateElement, modelElement, modelWriter ) => {
			if (
				isContainerElement( templateElement ) &&
				modelElement.childCount === 0 &&
				this.editor.model.schema.checkChild( modelElement, 'paragraph' )
			) {
				const paragraph = modelWriter.createElement( 'paragraph' );
				modelWriter.insert( paragraph, modelElement, 'end' );
				if ( templateElement.text ) {
					modelWriter.insert( modelWriter.createText( templateElement.text ), paragraph );
				}
				return true;
			}
		} );
	}
}
