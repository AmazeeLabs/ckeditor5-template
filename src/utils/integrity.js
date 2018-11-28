/**
 * @module template/utils/integrity
 */

/**
 * Prepare a postfixer callback for selected template element types.
 *
 *     const postfixer = prepareTemplateElementPostfixer( this.editor, {
 *       types: [ 'element', 'text' ],
 *       postfix: (templateElement, modelElement, modelWriter) => {
 *       	...
 *       }
 *     } );
 *
 * @param {module:core/editor/editor~Editor} editor
 * @param {Object} config
 * @returns {Function}
 */
export function prepareTemplateElementPostfixer( editor, config ) {
	return writer => {
		for ( const entry of editor.model.document.differ.getChanges() ) {
			// Run the postfixer on newly inserted elements and on parents of removed elements.
			if ( [ 'insert', 'remove' ].includes( entry.type ) ) {
				const item = entry.type === 'insert' ? entry.position.nodeAfter : entry.position.getAncestors().pop();
				if ( item ) {
					const templateElement = editor.plugins.get( 'TemplateEditing' ).getElementInfo( item.name );
					if ( templateElement && config.types.includes( templateElement.type ) ) {
						if ( config.postfix( templateElement, item, writer ) ) {
							return true;
						}
					}
				}
			}
		}
	};
}

/**
 * Recursively check and fix template element integrity.
 *
 * Will add missing, remove unregistered and reorder shuffled child elements to maintain the
 * same structure as the template definition.
 *
 * @param {module:template/utils/elementinfo~ElementInfo} templateElement
 * @param {module:engine/model/element~Element} item
 * @param {module:engine/model/writer~Writer} writer
 *
 * @returns {boolean} - True, if an actual change was made.
 */
export function postfixTemplateElement( templateElement, item, writer ) {
	let changed = false;

	// Build a list of "seats" for each child.
	const childSeats = templateElement.children.map( child => ( { [ child.name ]: false } ) )
		.reduce( ( acc, val ) => Object.assign( acc, val ), {} );

	// Build the list of matching elements for each seat.
	const childOptions = templateElement.children.map( child => ( { [ child.name ]: child.conversions } ) )
		.reduce( ( acc, val ) => Object.assign( acc, val ), {} );

	// Iterate through existing children, check if they apply to a seat and in case seat them there.
	for ( const child of item.getChildren() ) {
		// Check for a direct name match.
		if ( childSeats.hasOwnProperty( child.name ) && !childSeats[ child.name ] ) {
			childSeats[ child.name ] = child;
		}

		// Check for an indirect name match (e.g. allow placeholder in element spots).
		for ( const name of Object.keys( childSeats ) ) {
			if ( childOptions[ name ].includes( child.name ) ) {
				childSeats[ name ] = child;
			}
		}
	}

	const inserted = {};
	// Re-insert in order of their seats. This fixes wrong element order, unknown elements and adds missing ones.
	for ( const name of Object.keys( childSeats ) ) {
		if ( childSeats[ name ] ) {
			writer.insert( childSeats[ name ], item, 'end' );
		}
		else {
			const el = writer.createElement( name );
			writer.insert( el, item, 'end' );
			inserted[ name ] = el;
			changed = true;
		}
	}

	// Build a list of "seats" for each child.
	const childMap = templateElement.children.map( child => ( { [ child.name ]: child } ) )
		.reduce( ( acc, val ) => Object.assign( acc, val ), {} );

	// Postfix all child elements.
	for ( const name of Object.keys( inserted ) ) {
		changed = postfixTemplateElement( childMap[ name ], inserted[ name ], writer ) || changed;
	}

	return changed;
}
