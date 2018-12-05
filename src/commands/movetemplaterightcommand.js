/**
 * @module template/commands/replacetemplatecommand
 */

import TemplateCommandBase from './templatecommandbase';

/**
 * Command for moving a template forwards within a gallery.
 */
export default class MoveTemplateRightCommand extends TemplateCommandBase {
	/**
	 * @inheritDoc
	 */
	refresh() {
		super.refresh();
		this.isEnabled = !!( this.currentElement && this.currentElement.nextSibling );
	}

	/**
	 * @inheritDoc
	 */
	matchElement( templateElement, modelElement ) {
		const parent = this.editor.templates.getElementInfo( modelElement.parent.name );

		// The element has child of a container ...
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
			writer.insert( currentElement, currentElement.nextSibling, 'after' );
			writer.setSelection( currentElement, 'on' );
		} );
	}
}
