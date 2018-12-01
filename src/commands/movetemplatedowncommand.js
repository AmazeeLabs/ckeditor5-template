/**
 * @module template/commands/replacetemplatecommand
 */

import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import TemplateCommandBase from './templatecommandbase';

/**
 * Command for moving a template forwards within a container.
 *
 * Also attempts to adjust the windows scroll position so the element appears static in the viewport.
 */
export default class MoveTemplateDownCommand extends TemplateCommandBase {
	/**
	 * @inheritDoc
	 */
	refresh() {
		super.refresh();
		this.isEnabled = !!( this.currentElement &&
			this.currentElement.nextSibling &&
			this.currentElement.nextSibling.nextSibling );
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

		const nextElement = currentElement.nextSibling.nextSibling;
		const nextDomElement = converter.mapViewToDom( mapper.toViewElement( nextElement ) );

		const currentPosition = global.window.scrollY;

		// If the next element is the last element, scroll down to the bottom of the page.
		let diff = nextElement.offsetHeight;

		// Else calculate the scroll distance  by using the next and the next-next offset top value.
		if ( nextElement.nextSibling && nextElement.nextSibling.nextSibling ) {
			const nextNextElement = nextElement.nextSibling.nextSibling;
			const nextNextDomElement = converter.mapViewToDom( mapper.toViewElement( nextNextElement ) );
			diff = nextNextDomElement.offsetTop - nextDomElement.offsetTop;
		}

		model.change( writer => {
			const currentPlaceholder = currentElement.nextSibling;
			writer.insert( currentElement, nextElement.nextSibling, 'after' );
			writer.insert( currentPlaceholder, currentElement, 'after' );
			writer.setSelection( currentElement, 'on' );
		} );

		// Set the window position.
		// TODO: Find out why the delaying is necessary. It seems like another viewport adjustment is interfering.
		global.window.setTimeout( () => {
			global.window.scrollTo( 0, currentPosition + diff );
		}, 0 );
	}
}
