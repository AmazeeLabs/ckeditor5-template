/**
 * @module template/commands/templatecommand
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
			return ( templateElement.type === 'placeholder' || templateElement.isTemplateRoot ) &&
				templateElement.conversions.length > 0;
		} );
	}

	/**
	 * @inheritDoc
	 */
	execute( options ) {
		const editor = this.editor;
		editor.model.change( writer => {
			const element = this._currentElement;
			writer.rename( element, options.template );
			writer.setSelection( element, 'on' );
		} );
	}
}
