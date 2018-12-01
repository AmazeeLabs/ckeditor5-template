/**
 * @module template/commands/replacetemplatecommand
 */

import TemplateCommandBase from './templatecommandbase';

/**
 * Command for replacing a template with another one.
 *
 * Only enabled if the current selection is on or within a template.
 */
export default class ReplaceTemplateCommand extends TemplateCommandBase {
	/**
	 * @inheritDoc
	 */
	// eslint-disable-next-line no-unused-vars
	matchElement( templateElement, modelElement ) {
		return ( templateElement.type === 'placeholder' || templateElement.isTemplateRoot ) &&
			templateElement.conversions.length > 0;
	}

	/**
	 * @inheritDoc
	 */
	execute( options ) {
		const editor = this.editor;
		editor.model.change( writer => {
			const element = this.currentElement;
			writer.rename( element, options.template );
			writer.setSelection( element, 'on' );
		} );
	}
}
