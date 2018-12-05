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
		this.set( 'itemCount', 0 );
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
			this.editor.editing.view.change( writer => {
				writer.setAttribute( 'ck-gallery-current-item', options.index, viewElement );
			} );
			this.editor.model.change( writer => {
				writer.setSelection( modelElement, 'on' );
			} );
		}
	}
}
