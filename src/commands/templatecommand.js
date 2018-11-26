/**
 * @module template/commands/templatecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { findOptimalInsertionPosition } from '@ckeditor/ckeditor5-widget/src/utils';

/**
 * Command for inserting a template into the document.
 */
export default class TemplateCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		// Enable the dropdown only if there is a applicable parent.
		this.isEnabled = !!getInsertTemplateParent( selection, model );
	}

	/**
	 * @inheritDoc
	 */
	execute( options ) {
		const editor = this.editor;
		editor.model.change( writer => {
			const model = editor.model;
			const doc = model.document;
			const templateElement = writer.createElement( options.value );

			const insertAtSelection = findOptimalInsertionPosition( doc.selection, model );
			model.insertContent( templateElement, insertAtSelection );

			if ( templateElement.parent ) {
				writer.setSelection( templateElement, 'on' );
			}
		} );
	}
}

/**
 * Find the proper parent to insert the template into.
 *
 * @param {module:engine/model/selection~Selection} selection
 * @param {module:engine/model/model~Model} model
 * @returns {module:engine/model/element~Element}
 */
function getInsertTemplateParent( selection, model ) {
	const insertAt = findOptimalInsertionPosition( selection, model );

	let parent = insertAt.parent;

	if ( !parent.is( '$root' ) ) {
		parent = parent.parent;
	}

	return parent;
}
