import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import TemplateEditing from './templateediting';

/**
 * Adds document wide unique id's to templates.
 *
 * Requires a 'templateSession' configuration parameter that should be a unique identifier for the current
 * editor instance. For example CMS-session-id + server request time + editor element id. It is used to generate a
 * on document level unique for each inserted element that is supposed to have an id attribute.
 */
export default class TemplateId extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );
		// Unique identifier for the current user session.
		editor.config.define( 'templateSession', null );
		this._tick = 0;
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TemplateEditing ];
	}

	/**
	 * A global "tick" for each element that has been added an id.
	 * In case if simultaneously added id's during
	 */
	get tick() {
		return this._tick++;
	}

	/**
	 * A unique session id.
	 */
	get session() {
		return this.editor.config.get( 'templateSession' );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		// Allow the id attribute on all template root elements.
		this.editor.templates.findElementInfo( info => info.isTemplateRoot ).forEach( info => {
			this.editor.model.schema.extend( info.name, {
				allowAttributes: [ 'id' ],
			} );
		} );

		// Add a downcast converter for id attribute.
		this.editor.conversion.attributeToAttribute( {
			model: 'id',
			view: 'id',
		} );

		// Auto add an id to each template instance.
		this.editor.model.document.registerPostFixer( writer => {
			for ( const entry of this.editor.model.document.differ.getChanges() ) {
				// If the change inserts a new element.
				if ( [ 'insert' ].includes( entry.type ) ) {
					// Get the actual element.
					const item = entry.position.nodeAfter;
					this.postfixIds( item, writer );
				}
			}
		} );
	}

	postfixIds( item, writer ) {
		if ( !item ) {
			return;
		}
		// Check if it exists and doesn't have an id attribute yet.
		if ( item && !item.getAttribute( 'id' ) ) {
			// Get the template information for this element.
			const info = this.editor.templates.getElementInfo( item.name );
			// Only add id's to template roots.
			if ( info && !info.parent ) {
				// Generate an id from the current session identifier and the increment counter
				// for added elements.
				writer.setAttribute( 'id', hash( `${ this.session }:${ this.tick }` ), item );
			}

			for ( const child of item.getChildren() ) {
				this.postfixIds( child, writer );
			}
		}
	}
}

/**
 * A string hashing function based on Daniel J. Bernstein's 'times 33' hash algorithm and serialized into a string.
 *
 * @param {string} text - String to hash
 * @return {String} Resulting number.
 */
function hash( text ) {
	let hash = 5381;
	let index = text.length;

	while ( index ) {
		hash = ( hash * 33 ) ^ text.charCodeAt( --index );
	}

	return ( hash >>> 0 ).toString( 36 );
}
