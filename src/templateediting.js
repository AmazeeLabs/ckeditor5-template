/**
 * @module template/templateediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import { insertElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

import ElementInfo from './utils/elementinfo';
import InsertTemplateCommand from './commands/inserttemplatecommand';
import {
	downcastTemplateElement,
	getModelAttributes,
	getViewAttributes,
	upcastTemplateElement
} from './utils/conversion';
import { postfixTemplateElement } from './utils/integrity';
import RemoveTemplateCommand from './commands/removetemplatecommand';

/**
 * The template engine feature.
 *
 * For configuration examples, refer to the {@link module:template/templateediting template documentation}.
 */
export default class TemplateEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Widget ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TemplateEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );
		editor.config.define( 'templates', {} );

		/**
		 * A map with all registered {@link module:template/utils/elementinfo~ElementInfo ElementInfo} objects.
		 * @type {Object}
		 * @private
		 */
		this._elements = {};

		/**
		 * A mapping from element names to element types.
		 *
		 * @type {Object}
		 * @private
		 */
		this._typeMap = {};

		/**
		 * Per element postfixer registry.
		 *
		 * @type {Object}
		 * @private
		 */
		this._postfixers = {};
	}

	/**
	 * Retrieve the template element info object for a given schema element.
	 *
	 * @param {String} name
	 * @returns {module:template/utils/elementinfo~ElementInfo}
	 */
	getElementInfo( name ) {
		return this._elements[ name ];
	}

	/**
	 * Find elements matching given criteria.
	 *
	 * @param {Function} matcher
	 * @return {module:template/utils/elementinfo~ElementInfo[]}
	 */
	findElementInfo( matcher = null ) {
		return matcher ? Object.values( this._elements ).filter( matcher ) : Object.values( this._elements );
	}

	/**
	 * Retrieve all tempate elements with a given type.
	 *
	 * @param {String} type
	 * @return {module:template/utils/elementinfo~ElementInfo[]}
	 */
	getElementsByType( type ) {
		return Object.values( this._elements ).filter( el => el.type === type );
	}

	/**
	 * Retrieve element and info for the first parent element matching given conditions.
	 *
	 * @param {Function} matcher
	 * @returns {{element: (module:engine/view/element~Element), info: module:template/utils/elementinfo~ElementInfo}}
	 */
	findSelectedTemplateElement( matcher ) {
		let element = this.editor.model.document.selection.getSelectedElement() || this.editor.model.document.selection.anchor.parent;
		while ( element ) {
			const info = this.editor.templates.getElementInfo( element.name );
			if ( info && matcher( info, element ) ) {
				return { element, info };
			}
			element = element.parent;
		}
		return { element: null, info: null };
	}

	/**
	 * Register a new postfixer
	 *
	 *     this.editor.templates.registerPostFixer(
	 *         [ 'element', 'placeholder' ],
	 *         ( templateElement, modelElement, modelWriter ) => {
	 *             ...
	 *         }
	 *     );
	 *
	 * @param {String[]} types
	 * @param {Function} callback
	 */
	registerPostFixer( types, callback ) {
		for ( const type of types ) {
			if ( !this._postfixers[ type ] ) {
				this._postfixers[ type ] = [];
			}
			this._postfixers[ type ].push( callback );
		}
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this.editor.templates = this;

		// Add a command for inserting a template element.
		this.editor.commands.add( 'insertTemplate', new InsertTemplateCommand( this.editor ) );

		// Add a command for removing a template element.
		this.editor.commands.add( 'removeTemplate', new RemoveTemplateCommand( this.editor ) );

		const templates = this.editor.config.get( 'templates' );

		// Parse all template snippets and register them.
		// TODO: Allow pre-parsed snippets.
		Object.keys( templates ).forEach( name => {
			// eslint-disable-next-line no-undef
			const parser = new DOMParser();
			const dom = parser.parseFromString( templates[ name ].template, 'text/xml' ).documentElement;
			dom.setAttribute( 'ck-name', name );
			dom.setAttribute( 'ck-label', templates[ name ].label );
			dom.setAttribute( 'ck-icon', templates[ name ].icon || 'configurator' );
			this.registerElement( dom );
		} );

		// Postfix elements to make sure a templates structure is always correct.
		this.registerPostFixer( [ 'element' ], postfixTemplateElement );

		// Register one global postfixer that will postfix all template elements.
		this.editor.model.document.registerPostFixer( writer => {
			for ( const entry of this.editor.model.document.differ.getChanges() ) {
				// Run the postfixer on newly inserted elements and on parents of removed elements.
				if ( [ 'insert', 'remove' ].includes( entry.type ) ) {
					const item = entry.type === 'insert' ? entry.position.nodeAfter : entry.position.getAncestors().pop();
					if ( item ) {
						if ( this._postfixElement( item, writer ) ) {
							return true;
						}
					}
				}
			}
		} );

		// Allow `$text` within all elements.
		// Required until https://github.com/ckeditor/ckeditor5-engine/issues/1593 is fixed.
		// TODO: Remove this once the issue is resolved.
		this.editor.model.schema.extend( '$text', {
			allowIn: Object.keys( this._elements ),
		} );

		// Default upcast conversion for template elements.
		this.editor.conversion.for( 'upcast' ).add( upcastTemplateElement( this.editor, {
			types: this._elementTypes,
			model: ( templateElement, viewElement, modelWriter ) => {
				return modelWriter.createElement(
					templateElement.name,
					getViewAttributes( templateElement, viewElement )
				);
			},
		} ), { priority: 'low' } );

		// Default data downcast conversions for template elements.
		this.editor.conversion.for( 'dataDowncast' ).add( downcastTemplateElement( this.editor, {
			types: this._elementTypes,
			view: ( templateElement, modelElement, viewWriter ) => {
				return viewWriter.createContainerElement(
					templateElement.tagName,
					getModelAttributes( templateElement, modelElement )
				);
			}
		} ), { priority: 'low ' } );

		const templateManager = this.editor.templates;
		// Default editing downcast conversions for template container elements without functionality.
		this.editor.conversion.for( 'editingDowncast' ).add( downcastTemplateElement( this.editor, {
			types: [ 'element' ],
			view: ( templateElement, modelElement, viewWriter ) => {
				const parentTemplate = modelElement.parent && templateManager.getElementInfo( modelElement.parent.name );
				const el = viewWriter.createContainerElement(
					(
						// TODO: Introduce a component negotiator? Or somehow enable the "is" attribute for web components.
						( parentTemplate && [ 'container', 'gallery', 'tabs' ].includes( parentTemplate.type ) ) ||
						modelElement.hasAttribute( 'added' ) || modelElement.hasAttribute( 'removed' )
					) ? 'ck-container-item' : templateElement.tagName,
					getModelAttributes( templateElement, modelElement )
				);
				return templateElement.parent ? el : toWidget( el, viewWriter );
			}
		} ), { priority: 'low ' } );
	}

	_postfixElement( item, writer ) {
		const templateElement = this.getElementInfo( item.name );
		let changed = false;
		if ( templateElement && this._postfixers.hasOwnProperty( templateElement.type ) ) {
			for ( const attr of Object.keys( templateElement.attributes ) ) {
				const value = templateElement.attributes[ attr ];

				if ( value && !item.getAttribute( attr ) ) {
					writer.setAttribute( attr, value, item );
				}
			}

			for ( const postfixer of this._postfixers[ templateElement.type ] ) {
				changed = changed || postfixer( templateElement, item, writer );
				for ( const child of item.getChildren() ) {
					this._postfixElement( child, writer );
				}
			}
		}
		return changed;
	}

	/**
	 * Collect all element types that have been registered.
	 *
	 * @return {String[]}
	 */
	get _elementTypes() {
		return [ ... new Set( Object.values( this._elements ).map( el => el.type ) ) ];
	}

	/**
	 * Generate a downcast handler for a specific element type.
	 *
	 * @see module:template/utils/conversion~downcastTemplateElement
	 *
	 * @param {Object} config
	 * @returns {Function}
	 */
	downcastTemplateElement( config ) {
		return dispatcher => {
			dispatcher.on( 'insert', insertElement( ( modelElement, viewWriter ) => {
				const templateElement = this._elements[ modelElement.name ];
				if ( templateElement && config.types.includes( templateElement.type ) ) {
					return config.view( templateElement, modelElement, viewWriter );
				}
			} ) );
		};
	}

	/**
	 * Generate a downcast handler for a specific element type.
	 *
	 * @see module:template/utils/conversion~upcastTemplateElement
	 *
	 * @param {Object} config
	 * @returns {Function}
	 */
	upcastTemplateElement( config ) {
		return upcastElementToElement( {
			view: viewElement => !!this._findMatchingTemplateElement( viewElement, config.types ) && { name: true },
			model: ( viewElement, modelWriter ) => config.model(
				this._findMatchingTemplateElement( viewElement, config.types ),
				viewElement,
				modelWriter
			)
		} );
	}

	_findMatchingTemplateElement( viewElement, types ) {
		return Object.values( this._elements ).filter( el =>
			el.matches( viewElement ) &&
			types.includes( el.type ) &&
			// TODO: Exclude text conflict elements, so its not consumed by the wrong converter.
			![ 'ck-conflict-text', 'ck-conflict-option', 'ck-conflict-media', 'ck-conflict-media-option' ].includes( viewElement.name )
		).pop();
	}

	/**
	 * Register a dom element as an editor element.
	 *
	 * @param {Element} dom
	 * @param {ElementInfo} parent
	 */
	registerElement( dom, parent = null ) {
		const element = new ElementInfo( dom, parent );
		this._elements[ element.name ] = element;
		this._typeMap[ element.type ] = element.name;

		// Register the element itself.
		this.editor.model.schema.register( element.name, {
			isObject: !parent,
			isBlock: true,
			// If this is the root element of a template, allow it in root. Else allow it only in its parent.
			allowIn: parent ? parent.name : '$root',
			// Register all know attributes.
			allowAttributes: Object.keys( element.attributes ),
		} );

		// Register all child elements.
		Array.from( dom.childNodes ).filter( node => node.nodeType === 1 )
			.map( child => this.registerElement( child, element ) );
	}
}
