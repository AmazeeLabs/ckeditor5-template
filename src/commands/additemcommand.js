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
		const templateElement = this.editor.templates.getElementInfo( currentElement.name );

		this.editor.model.change( writer => {
			const element = templateElement.contains.length === 1 ?
				writer.createElement( `ck__${ templateElement.contains[ 0 ] }` ) :
				writer.createElement( `${ currentElement.name }__placeholder` );
			writer.append( element, currentElement );
			writer.setSelection( element, 'on' );
		} );

		this.editor.editing.view.change( writer => {
			writer.setAttribute( 'ck-gallery-current-item', itemCount, viewElement );
		} );
	}
}
