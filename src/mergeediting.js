import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import TemplateEditing from './templateediting';
import { getModelAttributes, getViewAttributes } from './utils/conversion';

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

		this.editor.templates.findElementInfo( info => info.tagName == 'ck-button').forEach( info => {
			this.editor.model.schema.extend( info.name, {
				allowAttributes: [ 'left', 'right', 'source' ],
			} );
		}) ;

		this.editor.conversion.attributeToAttribute( {
			model: 'left',
			view: 'left',
		} );

		this.editor.conversion.attributeToAttribute( {
			model: 'right',
			view: 'right',
		} );

		this.editor.conversion.attributeToAttribute( {
			model: 'source',
			view: 'source',
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

		this.editor.conversion.attributeToAttribute( {
			model: 'label',
			view: 'label',
		} );

		this.editor.conversion.attributeToAttribute( {
			model: 'slot',
			view: 'slot',
		} );

		// Register the text-conflict elements.
		const textElements = this.editor.templates.findElementInfo( info => info.type === 'text' );
		textElements.forEach( info => {
			const wrapper = `${ info.name }__conflict`;
			const option = `${ wrapper }__option`;

			this.editor.model.schema.register( wrapper, {
				allowWhere: info.name,
				allowAttributes: [ 'from', 'label' ],
			} );

			this.editor.model.schema.register( option, {
				allowIn: `${ info.name }__conflict`,
				allowAttributes: [ 'from', 'label' ],
			} );

			this.editor.model.schema.extend( info.name, {
				allowIn: option,
			} );

			this.editor.conversion.for( 'downcast' ).elementToElement( {
				model: wrapper,
				view: ( modelElement, viewWriter ) => {
					return viewWriter.createContainerElement( 'ck-conflict-text', getModelAttributes( info, modelElement ) );
				},
				converterPriority: 'highest'
			} );

			this.editor.conversion.for( 'downcast' ).elementToElement( {
				model: option,
				view: ( modelElement, viewWriter ) => {
					const from = modelElement.getAttribute( 'from' );
					if ( typeof from !== 'undefined' ) {
						return viewWriter.createContainerElement( 'ck-conflict-option', {
							from
						} );
					}
					else {
						return viewWriter.createContainerElement( 'ck-conflict-option' );
					}
				},
				converterPriority: 'highest'
			} );
		} );

		this.editor.conversion.for( 'upcast' ).elementToElement( {
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
			converterPriority: 'highest'
		} );

		this.editor.conversion.for( 'upcast' ).elementToElement( {
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
			converterPriority: 'highest'
		} );

		// Media conflict elements register.
		const mediaElements = this.editor.templates.findElementInfo( info => info.tagName === 'ck-media' );
		mediaElements.forEach( info => {
			const wrapper = `${ info.name }__media__conflict`;
			const option = `${ wrapper }__option`;

			this.editor.model.schema.register( wrapper, {
				allowIn: info.parent.name,
				allowAttributes: [ 'slot' ]
			} );

			this.editor.model.schema.register( option, {
				allowIn: wrapper,
				allowAttributes: [ 'from', 'position' ],
			} );

			this.editor.model.schema.extend( info.name, {
				allowIn: option,
			} );

			this.editor.conversion.for( 'downcast' ).elementToElement( {
				model: wrapper,
				view: ( modelElement, viewWriter ) => {
					return viewWriter.createContainerElement( 'ck-conflict-media', getModelAttributes( info, modelElement ) );
				},
				converterPriority: 'highest'
			} );

			this.editor.conversion.for( 'downcast' ).elementToElement( {
				model: option,
				view: ( modelElement, viewWriter ) => {
					return viewWriter.createContainerElement( 'ck-conflict-media-option', {
						from: modelElement.getAttribute( 'from' ),
					} );
				},
				converterPriority: 'highest'
			} );

			this.editor.conversion.for( 'upcast' ).elementToElement( {
				view: viewElement => viewElement.name === 'ck-conflict-media' && { name: true },
				model: ( viewElement, modelWriter ) => {
					const textElement = this.editor.templates.findElementInfo( info => info.type == 'container' ).pop();
					return modelWriter.createElement(
						wrapper,
						getViewAttributes( textElement, viewElement )
					);
				},
				converterPriority: 'highest'
			} );

			this.editor.conversion.for( 'upcast' ).elementToElement( {
				view: viewElement => viewElement.name === 'ck-conflict-media-option' && { name: true },
				model: ( viewElement, modelWriter ) => {
					const textElement = this.editor.templates.findElementInfo( info => info.type == 'container' ).pop();
					return modelWriter.createElement(
						option,
						getViewAttributes( textElement, viewElement )
					);
				},
				converterPriority: 'highest'
			} );
		} );
	}

	matchingTextElement( viewElement ) {
		return this.editor.templates.findElementInfo( info => {
			return info.matches( viewElement );
		} );
	}
}
