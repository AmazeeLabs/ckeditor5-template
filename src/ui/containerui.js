import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { getOptimalPosition } from '@ckeditor/ckeditor5-utils/src/dom/position';

import TemplateEditing from '../templateediting';
import UpIcon from '../../theme/icons/icon-move-up.svg';
import DownIcon from '../../theme/icons/icon-move-down.svg';
import TemplateButtonView from './views/templatebuttonview';
import ContainerElement from '../elements/containerelement';

/**
 * Provide the user interface to remove a template.
 */
export default class ContainerUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TemplateEditing, ContainerElement ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		// Store the buttons in this instance to update it later.
		this.upButton = new TemplateButtonView( this.editor.locale );
		this.downButton = new TemplateButtonView( this.editor.locale );

		// Statically set icons.
		this.upButton.set( {
			icon: UpIcon
		} );
		this.downButton.set( {
			icon: DownIcon
		} );

		this.editor.ui.view.body.add( this.upButton );
		this.editor.ui.focusTracker.add( this.upButton.element );
		this.editor.ui.view.body.add( this.downButton );
		this.editor.ui.focusTracker.add( this.downButton.element );

		// Get the remove command.
		this.upCommand = this.editor.commands.get( 'moveTemplateUp' );
		this.downCommand = this.editor.commands.get( 'moveTemplateDown' );

		// Bind the label to dynamically show the current elements label.
		this.upButton.bind( 'label' ).to( this.upCommand, 'currentTemplateLabel', label =>
			this.editor.t( 'Move %0 up', [ label ] ) );
		this.downButton.bind( 'label' ).to( this.upCommand, 'currentTemplateLabel', label =>
			this.editor.t( 'Move %0 down', [ label ] ) );

		// Hide and disable the button if the command is not enabled.
		this.upButton.bind( 'isVisible' ).to( this.upCommand, 'isEnabled' );
		this.upButton.bind( 'isEnabled' ).to( this.upCommand, 'isEnabled' );
		this.downButton.bind( 'isVisible' ).to( this.downCommand, 'isEnabled' );
		this.downButton.bind( 'isEnabled' ).to( this.downCommand, 'isEnabled' );

		// Update button positioning on any of the various occasions.
		this.listenTo( this.editor.ui, 'update', () => this._updateButtonDisplay() );
		this.listenTo( this.editor, 'change:isReadOnly', () => this._updateButtonDisplay() );

		this.listenTo( this.upButton, 'change:isVisible', ( evt, name, isVisible ) => {
			if ( isVisible ) {
				this.listenTo( global.window, 'resize', () => this._updateButtonDisplay() );
			}
			else {
				this.stopListening( global.window, 'resize', () => this._updateButtonDisplay() );
			}
		} );

		this.listenTo( this.upButton, 'execute', () => {
			this.editor.execute( 'moveTemplateUp' );
		} );

		this.listenTo( this.downButton, 'execute', () => {
			this.editor.execute( 'moveTemplateDown' );
		} );
	}

	/**
	 * @inheritDoc
	 */
	_updateButtonDisplay() {
		const modelElement = this.upCommand.currentElement;

		if ( !modelElement || this.editor.isReadOnly ) {
			this.upButton.isVisible = false;
			this.downButton.isVisible = false;
			return;
		}

		this.upButton.isVisible = true;
		this.downButton.isVisible = true;

		const viewElement = this.editor.editing.mapper.toViewElement( modelElement );
		const domElement = this.editor.editing.view.domConverter.mapViewToDom( viewElement );

		const upButtonPosition = getOptimalPosition( {
			element: this.upButton.element,
			target: domElement,
			positions: [
				( targetRect, buttonRect ) => ( {
					top: targetRect.top,
					left: targetRect.left + targetRect.width - buttonRect.width * 4,
				} )
			]
		} );

		this.upButton.top = upButtonPosition.top;
		this.upButton.left = upButtonPosition.left;

		const downButtonPosition = getOptimalPosition( {
			element: this.downButton.element,
			target: domElement,
			positions: [
				( targetRect, buttonRect ) => ( {
					top: targetRect.top,
					left: targetRect.left + targetRect.width - buttonRect.width * 3,
				} )
			]
		} );

		this.downButton.top = downButtonPosition.top;
		this.downButton.left = downButtonPosition.left;
	}
}
