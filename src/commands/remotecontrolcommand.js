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
		this.editor.model.change( writer => {
			this.dispatchOperation( options, writer );
		} );
	}

	dispatchOperation( options, writer ) {
		( {
			batch: () => this.batchOperations( options, writer ),
			insert: () => this.insertElement( options, writer ),
			move: () => this.moveElement( options, writer ),
			replace: () => this.replaceElement( options, writer ),
			remove: () => this.removeElement( options, writer ),
			attributes: () => this.setAttributes( options, writer ),
		} )[ options.operation ]();
	}

	toModel( domElement ) {
		const view = this.editor.editing.view.domConverter.mapDomToView( domElement );
		const viewPosition = this.editor.editing.view.createPositionAt( view, 'end' );
		return this.editor.editing.mapper.toModelPosition( viewPosition ).parent;
	}

	batchOperations( { operations }, writer ) {
		operations.map( operation => operation.detail ).forEach( operation => this.dispatchOperation( operation, writer ) );
	}

	insertElement( { element, parent, position, reference, attr }, writer ) {
		const parentElement = this.toModel( parent );
		const el = writer.createElement( `ck__${ element }` );
		writer.setAttributes( attr, el );
		if ( position === 'end' ) {
			writer.append( el, parentElement );
			writer.setSelection( el, 'on' );
		}
		else {
			const referenceElement = parentElement.getChild( reference );
			writer.insert( el, referenceElement, position );
			writer.setSelection( el, 'on' );
		}
	}

	moveElement( { parent, position, target, reference }, writer ) {
		const parentElement = this.toModel( parent );
		const targetElement = parentElement.getChild( target );
		const referenceElement = parentElement.getChild( reference );
		writer.insert( targetElement, referenceElement, position );
		writer.setSelection( targetElement, 'on' );
	}

	replaceElement( { element, target }, writer ) {
		const targetElement = this.toModel( target );
		writer.rename( targetElement, `ck__${ element }` );
		writer.setSelection( targetElement, 'on' );
	}

	removeElement( { target }, writer ) {
		const targetElement = this.toModel( target );
		writer.remove( targetElement );
	}

	setAttributes( { target, attr }, writer ) {
		const targetElement = this.toModel( target );
		writer.setAttributes( attr, targetElement );
	}
}
