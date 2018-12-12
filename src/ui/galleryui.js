import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { getOptimalPosition } from '@ckeditor/ckeditor5-utils/src/dom/position';

import GalleryControlsView from './views/gallerycontrolsview';
import SetCurrentItemCommand from '../commands/setcurrentitemcommand';
import AddItemCommand from '../commands/additemcommand';
import GalleryElement from '../elements/galleryelement';
import TemplateButtonView from './views/templatebuttonview';
import MoveTemplateLeftCommand from '../commands/movetemplateleftcommand';
import MoveTemplateRightCommand from '../commands/movetemplaterightcommand';

import LeftIcon from '../../theme/icons/arrow-left.svg';
import RightIcon from '../../theme/icons/arrow-right.svg';

/**
 * Provide the user interface to remove a template.
 */
export default class GalleryUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ GalleryElement ];
	}

	refresh() {
		this.moveLeftCommand.refresh();
		this.moveRightCommand.refresh();
		this.setCurrentItemCommand.refresh();
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this.editor.commands.add( 'gallerySetCurrentItem', new SetCurrentItemCommand( this.editor ) );
		this.editor.commands.add( 'galleryAddItem', new AddItemCommand( this.editor ) );
		this.editor.commands.add( 'galleryMoveLeft', new MoveTemplateLeftCommand( this.editor ) );
		this.editor.commands.add( 'galleryMoveRight', new MoveTemplateRightCommand( this.editor ) );

		// Store the buttons in this instance to update it later.
		this.galleryControls = new GalleryControlsView( this.editor.locale );
		this.moveLeftButton = new TemplateButtonView( this.editor.locale );
		this.moveLeftButton.set( {
			icon: LeftIcon,
		} );
		this.moveRightButton = new TemplateButtonView( this.editor.locale );
		this.moveRightButton.set( {
			icon: RightIcon,
		} );
		this.editor.ui.view.body.add( this.galleryControls );
		this.editor.ui.focusTracker.add( this.galleryControls.element );
		this.editor.ui.view.body.add( this.moveLeftButton );
		this.editor.ui.focusTracker.add( this.moveLeftButton.element );
		this.editor.ui.view.body.add( this.moveRightButton );
		this.editor.ui.focusTracker.add( this.moveRightButton.element );

		this.setCurrentItemCommand = this.editor.commands.get( 'gallerySetCurrentItem' );
		this.moveLeftCommand = this.editor.commands.get( 'galleryMoveLeft' );
		this.moveRightCommand = this.editor.commands.get( 'galleryMoveRight' );

		// Bind the label to dynamically show the current elements label.
		this.galleryControls.bind( 'currentItem' ).to( this.setCurrentItemCommand, 'currentItem' );
		this.galleryControls.bind( 'currentItemLabel' ).to( this.setCurrentItemCommand, 'currentTemplateLabel' );
		this.galleryControls.bind( 'itemCount' ).to( this.setCurrentItemCommand, 'itemCount' );

		this.moveLeftButton.bind( 'label' ).to( this.moveLeftCommand, 'currentTemplateLabel', label => {
			return this.editor.locale.t( 'Move %0 to the left', [ label ] );
		} );

		this.moveRightButton.bind( 'label' ).to( this.moveRightCommand, 'currentTemplateLabel', label => {
			return this.editor.locale.t( 'Move %0 to the right', [ label ] );
		} );

		// Hide and disable the button if the command is not enabled.
		this.galleryControls.bind( 'isVisible' ).to( this.setCurrentItemCommand, 'isApplicable' );

		this.moveLeftButton.bind( 'isVisible' ).to( this.moveLeftCommand, 'isApplicable' );
		this.moveLeftButton.bind( 'isEnabled' ).to( this.moveLeftCommand, 'isEnabled' );
		this.moveRightButton.bind( 'isVisible' ).to( this.moveRightCommand, 'isApplicable' );
		this.moveRightButton.bind( 'isEnabled' ).to( this.moveRightCommand, 'isEnabled' );

		// Update button positioning on any of the various occasions.
		this.listenTo( this.editor.ui, 'update', () => this._updateButtonDisplay() );
		this.listenTo( this.editor, 'change:isReadOnly', () => this._updateButtonDisplay() );

		this.listenTo( this.setCurrentItemCommand, 'change:isVisible', ( evt, name, isVisible ) => {
			if ( isVisible ) {
				this.listenTo( global.window, 'resize', () => this._updateButtonDisplay() );
			}
			else {
				this.stopListening( global.window, 'resize', () => this._updateButtonDisplay() );
			}
		} );

		this.listenTo( this.galleryControls, 'setCurrentItem', ( info, index ) => {
			this.editor.execute( 'gallerySetCurrentItem', { index } );
			this.refresh();
		} );

		this.listenTo( this.galleryControls, 'addItem', () => {
			this.editor.execute( 'galleryAddItem' );
			this.refresh();
		} );

		this.listenTo( this.moveLeftButton, 'execute', () => {
			this.editor.execute( 'galleryMoveLeft' );
			this.editor.execute( 'gallerySetCurrentItem', { index: this.setCurrentItemCommand.currentItem - 1 } );
			this.refresh();
		} );

		this.listenTo( this.moveRightButton, 'execute', () => {
			this.editor.execute( 'galleryMoveRight' );
			this.editor.execute( 'gallerySetCurrentItem', { index: this.setCurrentItemCommand.currentItem + 1 } );
			this.refresh();
		} );
	}

	/**
	 * @inheritDoc
	 */
	_updateButtonDisplay() {
		const modelElement = this.setCurrentItemCommand.currentElement;

		if ( !modelElement || this.editor.isReadOnly ) {
			this.galleryControls.isVisible = false;
			this.moveLeftButton.isVisible = false;
			this.moveRightButton.isVisible = false;
			return;
		}

		this.galleryControls.isVisible = true;
		this.moveLeftButton.isVisible = true;
		this.moveRightButton.isVisible = true;

		const viewElement = this.editor.editing.mapper.toViewElement( modelElement );
		const domElement = this.editor.editing.view.domConverter.mapViewToDom( viewElement );

		const galleryControlsPosition = getOptimalPosition( {
			element: this.galleryControls.element,
			target: domElement,
			positions: [
				targetRect => ( {
					top: targetRect.top,
					left: targetRect.left,
				} )
			]
		} );

		this.galleryControls.top = galleryControlsPosition.top;
		this.galleryControls.left = galleryControlsPosition.left;

		const moveLeftPosition = getOptimalPosition( {
			element: this.moveLeftButton.element,
			target: domElement,
			positions: [
				( targetRect, buttonRect ) => ( {
					top: targetRect.top,
					left: targetRect.left + targetRect.width - buttonRect.width * 2,
				} )
			]
		} );

		this.moveLeftButton.top = moveLeftPosition.top;
		this.moveLeftButton.left = moveLeftPosition.left;

		const moveRightPosition = getOptimalPosition( {
			element: this.moveRightButton.element,
			target: domElement,
			positions: [
				( targetRect, buttonRect ) => ( {
					top: targetRect.top,
					left: targetRect.left + targetRect.width - buttonRect.width,
				} )
			]
		} );

		this.moveRightButton.top = moveRightPosition.top;
		this.moveRightButton.left = moveRightPosition.left;
	}
}
