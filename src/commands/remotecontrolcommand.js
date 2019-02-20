/**
 * @module template/commands/remotecontrolcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * Set the current gallery element to a specific position
 */
export default class RemoteControlCommand extends Command {
	/**
	 * @inheritDoc
	 */
	execute( options ) {
		( {
			insert: () => this.insertElement( options ),
			move: () => this.moveElement( options ),
			replace: () => this.replaceElement( options ),
			remove: () => this.removeElement( options ),
			attributes: () => this.setAttributes( options ),
		} )[ options.operation ]();
	}

	toModel( domElement ) {
		const view = this.editor.editing.view.domConverter.mapDomToView( domElement );
		const viewPosition = this.editor.editing.view.createPositionAt( view, 'end' );
		return this.editor.editing.mapper.toModelPosition( viewPosition ).parent;
	}

	insertElement( { element, parent, position, reference } ) {
		const parentElement = this.toModel( parent );
		this.editor.model.change( writer => {
			const el = writer.createElement( `ck__${ element }` );
			if ( position === 'end' ) {
				writer.append( el, parentElement );
				writer.setSelection( el, 'on' );
			}
			else {
				const referenceElement = parentElement.getChild( reference );
				writer.insert( el, referenceElement, position );
				writer.setSelection( el, 'on' );
			}
		} );
	}

	moveElement( { parent, position, target, reference } ) {
		const parentElement = this.toModel( parent );
		const targetElement = parentElement.getChild( target );
		const referenceElement = parentElement.getChild( reference );
		this.editor.model.change( writer => {
			writer.insert( targetElement, referenceElement, position );
			writer.setSelection( targetElement, 'on' );
		} );
	}

	replaceElement( { element, target } ) {
		const targetElement = this.toModel( target );
		this.editor.model.change( writer => {
			writer.rename( targetElement, element );
			writer.setSelection( targetElement, 'on' );
		} );
	}

	removeElement( { target } ) {
		const targetElement = this.toModel( target );
		this.editor.model.change( writer => {
			writer.remove( targetElement );
		} );
	}

	setAttributes( { target, attributes } ) {
		const targetElement = this.toModel( target );
		this.editor.model.change( writer => {
			writer.setAttribute( targetElement, attributes );
		} );
	}
}
