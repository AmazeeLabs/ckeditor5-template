import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import TemplateEditing from './templateediting';
import { getModelAttributes, getViewAttributes } from './utils/conversion';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import { downcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';

/**
 * Handles merged documents, with sections assigned that are added or removed.
 */
export default class MergeEditing extends Plugin {
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
		// Allow the added and removed attributes on all template root elements.
		this.editor.templates.findElementInfo( info => info.isTemplateRoot ).forEach( info => {
			this.editor.model.schema.extend( info.name, {
				allowAttributes: [ 'added', 'removed' ],
			} );
		} );

		// Add a downcast converter for added and removed attributes.
		this.editor.conversion.attributeToAttribute( {
			model: 'added',
			view: 'added',
		} );

		this.editor.conversion.attributeToAttribute( {
			model: 'removed',
			view: 'removed',
		} );

		// TODO: This should probably be constrained to conflict elements.
		this.editor.conversion.attributeToAttribute( {
			model: 'from',
			view: 'from',
		} );

		// Register the text-conflict elements.
		const textElements = this.editor.templates.findElementInfo( info => info.type === 'text' );
		textElements.forEach( info => {
			const wrapper = `${ info.name }__conflict`;
			const option = `${ wrapper }__option`;

			this.editor.model.schema.register( wrapper, {
				allowWhere: info.name,
			} );

			this.editor.model.schema.register( option, {
				allowIn: `${ info.name }__conflict`,
				allowAttributes: 'from',
			} );

			this.editor.model.schema.extend( info.name, {
				allowIn: option,
			} );

			this.editor.conversion.for( 'downcast' ).add( downcastElementToElement( {
				model: wrapper,
				view: ( modelElement, viewWriter ) => {
					return viewWriter.createContainerElement( 'ck-conflict-text', getModelAttributes( info, modelElement ) );
				}
			} ), { priority: 'highest' } );

			this.editor.conversion.for( 'downcast' ).add( downcastElementToElement( {
				model: option,
				view: ( modelElement, viewWriter ) => {
					return viewWriter.createContainerElement( 'ck-conflict-option', {
						from: modelElement.getAttribute( 'from' ),
					} );
				}
			} ), { priority: 'highest' } );
		} );

		this.editor.conversion.for( 'upcast' ).add( upcastElementToElement( {
			view: viewElement => {
				if ( viewElement.name === 'ck-conflict-text' &&
				!!this.matchingTextElement( viewElement ) ) {
					return { name: true };
				}
			},
			model: ( viewElement, modelWriter ) => {
				const textElement = this.matchingTextElement( viewElement ).pop();
				return modelWriter.createElement(
					`${ textElement.name }__conflict`,
					getViewAttributes( textElement, viewElement )
				);
			},
		} ), { priority: 'highest' } );

		this.editor.conversion.for( 'upcast' ).add( upcastElementToElement( {
			view: viewElement =>
				viewElement.name === 'ck-conflict-option' &&
				!!this.matchingTextElement( viewElement.parent ) && { name: true },
			model: ( viewElement, modelWriter ) => {
				const textElement = this.matchingTextElement( viewElement.parent ).pop();
				return modelWriter.createElement(
					`${ textElement.name }__conflict__option`,
					getViewAttributes( textElement, viewElement )
				);
			},
		} ), { priority: 'highest' } );
	}

	matchingTextElement( viewElement ) {
		return this.editor.templates.findElementInfo( info => {
			return info.matches( viewElement );
		} );
	}
}
