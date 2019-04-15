/**
 * @module template/utils/integrity
 */

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
 * @returns {boolean} - The list of inserted elements.
 */
export function postfixTemplateElement( templateElement, item, writer ) {
	let changed = false;

	// Build a list of "seats" for each child.
	const childSeats = templateElement.children.map( child => ( { [ child.name ]: false } ) )
		.reduce( ( acc, val ) => Object.assign( acc, val ), {} );

	// Build the list of matching elements for each seat.
	const childOptions = templateElement.children
		.map( child => ( { [ child.name ]: child.conversions.map( name => `ck__${ name }` ) } ) )
		.reduce( ( acc, val ) => Object.assign( acc, val ), {} );

	// Iterate through existing children, check if they apply to a seat and in case seat them there.
	for ( const child of item.getChildren() ) {
		// Check for a direct name match.
		if ( childSeats.hasOwnProperty( child.name ) && !childSeats[ child.name ] ) {
			childSeats[ child.name ] = child;
		}

		// Check for a conflict match.
		const conflictSuffix = '__conflict';
		if ( child.name && child.name.substr( child.name.length - conflictSuffix.length ) === conflictSuffix ) {
			let name = child.name.substr( 0, child.name.length - conflictSuffix.length );
			// Media conflict element resolve.
			if ( name.substr( name.length - 7 ) == '__media' ) {
				name = name.substr( 0, name.length - 7 );
			}
			if ( childSeats.hasOwnProperty( name ) && !childSeats[ name ] ) {
				childSeats[ name ] = child;
			}
		}

		// Check for an indirect name match (e.g. allow placeholder in element spots).
		for ( const name of Object.keys( childSeats ) ) {
			if ( childOptions[ name ].includes( child.name ) ) {
				childSeats[ name ] = child;
			}
		}
	}

	// Re-insert in order of their seats. This fixes wrong element order, unknown elements and adds missing ones.
	for ( const name of Object.keys( childSeats ) ) {
		if ( childSeats[ name ] ) {
			writer.insert( childSeats[ name ], item, 'end' );
		}
		else {
			const el = writer.createElement( name );
			writer.insert( el, item, 'end' );
			changed = true;
		}
	}

	return changed;
}
