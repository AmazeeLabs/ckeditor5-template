/**
 * @module template/commands/setcurrentitem
 */

import TemplateCommandBase from './templatecommandbase';

/**
 * Set the current gallery element to a specific position
 */
export default class AddItemCommand extends TemplateCommandBase {
	/**
	 * @inheritDoc
	 */
	matchElement( templateElement ) {
		return templateElement.type === 'gallery';
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const currentElement = this.currentElement;
		const itemCount = this.currentElement.childCount;
		const viewElement = this.editor.editing.mapper.toViewElement( currentElement );

		this.editor.model.change( writer => {
			const placeholder = writer.createElement( `${ currentElement.name }__placeholder` );
			writer.append( placeholder, currentElement );
			writer.setSelection( placeholder, 'on' );
		} );

		this.editor.editing.view.change( writer => {
			writer.setAttribute( 'ck-gallery-current-item', itemCount, viewElement );
		} );
	}
}
