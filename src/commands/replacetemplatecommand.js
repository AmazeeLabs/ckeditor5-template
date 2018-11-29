/**
 * @module template/commands/templatecommand
 */

import TemplateCommandBase from './templatecommandbase';

/**
 * Command for replacing a template with another one.
 */
export default class ReplaceTemplateCommand extends TemplateCommandBase {
	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = !!this._currentElement;
	}

	/**
	 * Retrieve the currently selected template or placeholder element.
	 *
	 * @returns {module:engine/view/element~Element|*}
	 * @private
	 */
	get _currentElement() {
		return this.getCurrentlySelectedElement( templateElement => {
			return [ 'template', 'placeholder' ].includes( templateElement.type ) && templateElement.conversions.length > 0;
		} );
	}

	/**
	 * @inheritDoc
	 */
	execute( options ) {
		const editor = this.editor;
		editor.model.change( writer => {
			writer.rename( this._currentElement, options.template );
		} );
	}
}
