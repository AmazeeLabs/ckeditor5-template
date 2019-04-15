/**
 * @module template/elements/containerelement
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { downcastTemplateElement, getModelAttributes } from '../utils/conversion';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import { postfixTemplateElement } from '@amazee/ckeditor5-template/src/utils/integrity';

import TemplateEditing from '../templateediting';
import PlaceholderElement from './placeholderelement';

/**
 * Allow an arbitrary list of elements of a given type.
 *
 * Automatically inserts placeholders between elements that allow injection of new children.
 */
export default class ContainerElement extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TemplateEditing, PlaceholderElement ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		// Get all configured placeholder elements.
		const containerElements = this.editor.templates.getElementsByType( 'container' );

		for ( const containerElement of containerElements ) {
			// Extend the schema so that the contained elements can be placed in the container.
			for ( const el of containerElement.contains ) {
				this.editor.model.schema.extend( `ck__${ el }`, {
					allowIn: containerElement.name,
				} );
			}
		}

		this.editor.conversion.for( 'editingDowncast' ).add( downcastTemplateElement( this.editor, {
			types: [ 'container' ],
			view: ( templateElement, modelElement, viewWriter ) => {
				const attributes = getModelAttributes( templateElement, modelElement );
				attributes.sections = templateElement.contains.join( ' ' );
				const el = viewWriter.createContainerElement(
					'ck-container',
					attributes
				);
				return templateElement.parent ? el : toWidget( el, viewWriter );
			}
		} ) );

		// Postfix elements to make sure a templates structure is always correct.
		this.editor.templates.registerPostFixer( [ 'container' ], postfixTemplateElement );
	}
}

