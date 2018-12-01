/**
 * @module template/commands/removetemplatecommand
 */

import TemplateCommandBase from './templatecommandbase';

/**
 * Command for removing/clearing a template.
 *
 * Will remove the template from containers and remove and re-add (clear) an element in fixed positions.
 */
export default class RemoveTemplateCommand extends TemplateCommandBase {
	/**
	 * @inheritDoc
	 */
	// eslint-disable-next-line no-unused-vars
	matchElement( templateElement, modelElement ) {
		return templateElement.isTemplateRoot;
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const editor = this.editor;
		editor.model.change( writer => {
			const element = this.currentElement;
			writer.setSelection( element.previousSibling || element.nextSibling, 'on' );
			writer.remove( element );
		} );
	}
}
