import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { getOptimalPosition } from '@ckeditor/ckeditor5-utils/src/dom/position';

import TemplateEditing from '../templateediting';
import DeleteIcon from '../../theme/icons/icon-delete.svg';
import TemplateButtonView from './views/templatebuttonview';

/**
 * Provide the user interface to remove a template.
 */
export default class RemoveTemplateUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TemplateEditing ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		// Store the remove button in this instance to update it later.
		this.removeButton = new TemplateButtonView( this.editor.locale );

		// Statically set the remove icon.
		this.removeButton.set( {
			icon: DeleteIcon,
		} );

		this.editor.ui.view.body.add( this.removeButton );
		this.editor.ui.focusTracker.add( this.removeButton.element );

		// Get the remove command.
		this.removeCommand = this.editor.commands.get( 'removeTemplate' );

		// Bind the label to dynamically show the current elements label.
		this.removeButton.bind( 'label' ).to( this.removeCommand, 'currentTemplateLabel', label =>
			this.editor.t( 'Remove %0', [ label ] ) );

		// Hide and disable the button if the command is not enabled.
		this.removeButton.bind( 'isVisible' ).to( this.removeCommand, 'isEnabled' );
		this.removeButton.bind( 'isEnabled' ).to( this.removeCommand, 'isEnabled' );

		// Update button positioning on any of the various occasions.
		this.listenTo( this.editor.ui, 'update', () => this._updateButtonDisplay() );
		this.listenTo( this.editor, 'change:isReadOnly', () => this._updateButtonDisplay() );

		this.listenTo( this.removeButton, 'change:isVisible', ( evt, name, isVisible ) => {
			if ( isVisible ) {
				this.listenTo( global.window, 'resize', () => this._updateButtonDisplay() );
			}
			else {
				this.stopListening( global.window, 'resize', () => this._updateButtonDisplay() );
			}
		} );

		this.listenTo( this.removeButton, 'execute', () => {
			this.editor.execute( 'removeTemplate' );
		} );
	}

	/**
	 * @inheritDoc
	 */
	_updateButtonDisplay() {
		const modelElement = this.removeCommand.currentElement;

		if ( !modelElement || this.editor.isReadOnly ) {
			this.removeButton.isVisible = false;
			return;
		}

		const inGallery = modelElement.parent &&
			this.editor.templates.getElementInfo( modelElement.parent.name ) &&
			this.editor.templates.getElementInfo( modelElement.parent.name ).type === 'gallery';

		this.removeButton.isVisible = true;

		const viewElement = this.editor.editing.mapper.toViewElement( inGallery ? modelElement.parent : modelElement );
		const domElement = this.editor.editing.view.domConverter.mapViewToDom( viewElement );

		const buttonPosition = getOptimalPosition( {
			element: this.removeButton.element,
			target: domElement,
			positions: inGallery ?
				[
					( targetRect, buttonRect ) => ( {
						top: targetRect.top,
						left: targetRect.left + targetRect.width - buttonRect.width * 3,
					} )
				] :
				[
					( targetRect, buttonRect ) => ( {
						top: targetRect.top,
						left: targetRect.left + targetRect.width - buttonRect.width * 2,
					} )
				]
		} );

		this.removeButton.top = buttonPosition.top;
		this.removeButton.left = buttonPosition.left;
	}
}
