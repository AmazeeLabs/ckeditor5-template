/**
 * @module template/commands/templatecommandbase
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
		this.set( 'currentTemplateLabel', null );
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const currentElement = this.currentElement;
		this.isEnabled = !!currentElement;
		if ( currentElement ) {
			this.currentTemplateLabel = this.editor.templates.getElementInfo( currentElement.name ).label;
		}
	}

	/**
	 * Retrieve the currently relevant element for this command.
	 */
	currentElement() {
		// To be overridden by command implementations.
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
			const info = this.editor.templates.getElementInfo( element.name );
			if ( info && matcher( info, element ) ) {
				return element;
			}
			element = element.parent;
		}
	}
}
