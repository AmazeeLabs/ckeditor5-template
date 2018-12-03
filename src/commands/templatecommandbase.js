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
		this.set( 'isApplicable', false );
		this._currentElement = null;
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		this.updateCurrentlySelectedElement();
		this.isEnabled = !!this._currentElement;
		this.isApplicable = this.isEnabled;
		if ( this._currentElement ) {
			this.currentTemplateLabel = this.editor.templates.getElementInfo( this._currentElement.name ).label;
		}
	}

	/**
	 * Retrieve the currently relevant element for this command.
	 */
	get currentElement() {
		return this._currentElement;
	}

	/**
	 * Check if a given template and model element are applicable for this command.
	 *
	 * @param {module:template/utils/elementinfo~ElementInfo} templateElement
	 * @param {module:engine/model/element~Element} modelElement
	 */
	// eslint-disable-next-line no-unused-vars
	matchElement( templateElement, modelElement ) {
		return false;
	}

	/**
	 * Find the first currently selected element matching given conditions.
	 *
	 * Will start from the current selection/anchor and move up in the document tree, to check if one of the parents
	 * matches the condition.
	 *
	 */
	updateCurrentlySelectedElement() {
		const result = this.editor.templates.findSelectedTemplateElement( ( info, element ) => this.matchElement( info, element ) );
		this._currentElement = result.element;
		this._currentElementInfo = result.info;
	}
}
