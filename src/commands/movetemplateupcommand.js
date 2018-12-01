/**
 * @module template/commands/replacetemplatecommand
 */

import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import TemplateCommandBase from './templatecommandbase';

/**
 * Command for moving a template upwards within a container.
 *
 * Also attempts to adjust the windows scroll position so the element appears static in the viewport.
 */
export default class MoveTemplateUpCommand extends TemplateCommandBase {
	/**
	 * @inheritDoc
	 */
	refresh() {
		super.refresh();
		this.isEnabled = !!( this.currentElement &&
			this.currentElement.previousSibling &&
			this.currentElement.previousSibling.previousSibling );
	}

	/**
	 * @inheritDoc
	 */
	matchElement( templateElement, modelElement ) {
		const parent = this.editor.templates.getElementInfo( modelElement.parent.name );

		// The element has child of a container ...
		return parent && parent.type === 'container' &&
			// ... and not a placeholder ...
			templateElement.type !== 'placeholder';
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const currentElement = this.currentElement;
		const model = this.editor.model;
		const converter = this.editor.editing.view.domConverter;
		const mapper = this.editor.editing.mapper;

		// Get the previous "actual" element, by jumping over the forced placeholder.
		const previousDomElement = converter.mapViewToDom( mapper.toViewElement( currentElement.previousSibling.previousSibling ) );
		const currentDomElement = converter.mapViewToDom( mapper.toViewElement( currentElement ) );

		// Predict the new window viewport position by calculating the difference of the two elements top offsets.
		const currentPosition = global.window.scrollY;
		const diff = previousDomElement.offsetTop - currentDomElement.offsetTop;

		model.change( writer => {
			const currentPlaceholder = currentElement.nextSibling;
			// Get the previous "actual" element, by jumping over the forced placeholder.
			const previousSibling = currentElement.previousSibling.previousSibling;
			writer.insert( currentElement, previousSibling, 'before' );
			writer.insert( currentPlaceholder, previousSibling, 'before' );
			writer.setSelection( currentElement, 'on' );
		} );

		// Set the window position.
		// TODO: Find out why the delaying is necessary. It seems like another viewport adjustment is interfering.
		global.window.setTimeout( () => {
			global.window.scrollTo( 0, currentPosition + diff );
		}, 0 );
	}
}
