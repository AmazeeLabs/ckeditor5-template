/**
 * @module template/elements/placeholder
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import {toWidget} from "@ckeditor/ckeditor5-widget/src/utils";

import {downcastTemplateElement, getModelAttributes} from '../utils/conversion';
import TemplateEditing from "../templateediting";
import PlaceholderView from '../ui/placeholderview';

/**
 * Allow to position placeholders in a document that can be filled with actual elements.
 */
export default class PlaceholderElement extends Plugin {
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
		// Placeholders should not appear in the result document, therefore they downcast to an empty string.
		// That's also the reason why they have no upcast.
		this.editor.conversion.for( 'dataDowncast' ).add( downcastTemplateElement( this.editor, {
			types: [ 'placeholder' ],
			view: ( templateElement, modelElement, viewWriter ) => {
				return viewWriter.createText('');
			},
		} ) );

		// Editing downcast creates a container element with a specialised ui element inside.
		this.editor.conversion.for( 'editingDowncast' ).add( downcastTemplateElement( this.editor, {
			types: [ 'placeholder' ],
			view: ( templateElement, modelElement, viewWriter ) => {
				const editor = this.editor;

				const element = viewWriter.createUIElement('div', getModelAttributes( templateElement, modelElement ), function (domDocument) {
					const domElement = this.toDomElement(domDocument);
					const view = new PlaceholderView(modelElement, editor, templateElement.configuration.allowed.split(' ') || []);
					view.render();
					domElement.appendChild(view.element);
					return domElement;
				});

				const cont = viewWriter.createContainerElement('div', { class: 'ck-placeholder-widget-wrapper'});
				viewWriter.insert( ViewPosition.createAt( cont , 0), element );
				return toWidget(cont, viewWriter);
			},
		} ) );

		// Get all configured placeholder elements.
		const placeholderElements = this.editor.plugins.get( 'TemplateEditing' ).getElementsByType( 'placeholder' );

		// All allowed elements need to be configured to be positionable in place of the placeholder.
		for ( const templateElement of placeholderElements ) {
			const replacements = templateElement.configuration.allowed.split(' ').map( el => `ck__${el}` );
			for ( const el of replacements ) {
				this.editor.model.schema.extend( el, {
					allowWhere: templateElement.name,
				} );
			}
		}
	}
}
