/**
 * @module templates/elements/textelement
 */
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { downcastTemplateElement, getModelAttributes } from '../utils/conversion';
import { toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import { attachPlaceholder } from '@ckeditor/ckeditor5-engine/src/view/placeholder';
import TemplateEditing from '../templateediting';

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
		const textElements = this.editor.plugins.get( 'TemplateEditing' ).getElementsByType( 'text' );

		this.editor.model.schema.extend( '$text', {
			allowIn: textElements.filter( isContainerElement ).map( el => el.name ),
		} );

		this.editor.model.schema.extend( '$block', {
			allowIn: textElements.filter( el => !isContainerElement( el ) ).map( el => el.name ),
		} );

		// Text element editing downcast
		this.editor.conversion.for( 'editingDowncast' ).add( downcastTemplateElement( this.editor, {
			types: [ 'text' ],
			view: ( templateElement, modelElement, viewWriter ) => {
				if ( !templateElement.parent ) {
					throw 'Editable elements cant be at the template root.';
				}

				const el = viewWriter.createEditableElement(
					templateElement.tagName,
					getModelAttributes( templateElement, modelElement )
				);

				if ( templateElement.text ) {
					attachPlaceholder( this.editor.editing.view, el, templateElement.text );
				}

				return toWidgetEditable( el, viewWriter );
			}
		} ), { priority: 'low ' } );
	}
}
