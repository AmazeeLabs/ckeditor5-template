/**
 * @module template/commands/replacetemplatecommand
 */

import TemplateCommandBase from './templatecommandbase';

/**
 * Command for moving a template left within a gallery.
 */
export default class MoveTemplateLeftCommand extends TemplateCommandBase {
	/**
	 * @inheritDoc
	 */
	refresh() {
		super.refresh();
		this.isEnabled = !!( this.currentElement && this.currentElement.previousSibling );
	}

	/**
	 * @inheritDoc
	 */
	matchElement( templateElement, modelElement ) {
		const parent = this.editor.templates.getElementInfo( modelElement.parent.name );

		// The element has child of a gallery ...
		return parent && parent.type === 'gallery' &&
			// ... and not a placeholder ...
			templateElement.type !== 'placeholder';
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const currentElement = this.currentElement;
		const model = this.editor.model;

		model.change( writer => {
			// Get the previous "actual" element, by jumping over the forced placeholder.
			writer.insert( currentElement, currentElement.previousSibling, 'before' );
			writer.setSelection( currentElement, 'on' );
		} );
	}
}
