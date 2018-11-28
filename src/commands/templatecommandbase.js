/**
 * @module template/commands/templatecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * Base class for template commands. Allows to find the currently selected templates, containers or placeholders.
 */
export default class TemplateCommandBase extends Command {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );
		this._templateEditing = editor.plugins.get( 'TemplateEditing' );
	}

	/**
	 * Find the first currently selected element matching given conditions.
	 *
	 * Will start from the current selection/anchor and move up in the document tree, to check if one of the parents
	 * matches the condition.
	 *
	 *     this.getCurrentlySelectedElement( ( templateElement, modelElement ) => {
	 *         return modelElement.name === 'paragraph';
	 *     } );
	 *
	 * @param {Function} matcher
	 */
	getCurrentlySelectedElement( matcher ) {
		let element = this.editor.model.document.selection.getSelectedElement() || this.editor.model.document.selection.anchor.parent;
		while ( element ) {
			const info = this._templateEditing.getElementInfo( element.name );
			if ( info && matcher( info, element ) ) {
				return element;
			}
			element = element.parent;
		}
	}
}
