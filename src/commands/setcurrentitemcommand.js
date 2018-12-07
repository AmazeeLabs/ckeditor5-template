/**
 * @module template/commands/setcurrentitem
 */

import TemplateCommandBase from './templatecommandbase';

/**
 * Set the current gallery element to a specific position
 */
export default class SetCurrentItemCommand extends TemplateCommandBase {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );
		this.set( 'currentItem', 0 );
		this.set( 'itemCount', 1 );
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		super.refresh();
		this.isEnabled = !!( this.currentElement );
		const viewElement = this.editor.editing.mapper.toViewElement( this.currentElement );
		if ( viewElement ) {
			this.currentItem = parseInt( viewElement.getAttribute( 'ck-gallery-current-item' ) );
			this.itemCount = this.currentElement.childCount;
		}
	}

	/**
	 * @inheritDoc
	 */
	matchElement( templateElement ) {
		return templateElement.type === 'gallery';
	}

	/**
	 * @inheritDoc
	 */
	execute( options ) {
		const currentElement = this.currentElement;
		const viewElement = this.editor.editing.mapper.toViewElement( currentElement );
		const modelElement = currentElement.getChild( options.index );

		if ( viewElement ) {
			// Wait for the gallery transition to finish and set the selection afterwards.
			// Selection might not be set properly as long as the element is not actually visible.
			const domElement = this.editor.editing.view.domConverter.mapViewToDom( viewElement.getChild( 0 ) );
			const handler = domElement.addEventListener( 'transitionend', () => {
				this.editor.model.change( writer => {
					writer.setSelection( modelElement, 'on' );
				} );
				domElement.removeEventListener( 'transitionend', handler );
			} );

			this.currentItem = options.index;
			this.editor.editing.view.change( writer => {
				writer.setAttribute( 'ck-gallery-current-item', options.index, viewElement );
			} );
		}
	}
}
