import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { getOptimalPosition } from '@ckeditor/ckeditor5-utils/src/dom/position';

import GalleryControlsView from './views/gallerycontrolsview';
import SetCurrentItemCommand from '../commands/setcurrentitemcommand';
import AddItemCommand from '../commands/additemcommand';
import GalleryElement from '../elements/galleryelement';

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

	/**
	 * @inheritDoc
	 */
	init() {
		this.editor.commands.add( 'gallerySetCurrentItem', new SetCurrentItemCommand( this.editor ) );
		this.editor.commands.add( 'galleryAddItem', new AddItemCommand( this.editor ) );

		// Store the buttons in this instance to update it later.
		this.galleryControls = new GalleryControlsView( this.editor.locale );

		this.editor.ui.view.body.add( this.galleryControls );
		this.editor.ui.focusTracker.add( this.galleryControls.element );

		this.setCurrentItemCommand = this.editor.commands.get( 'gallerySetCurrentItem' );

		// Bind the label to dynamically show the current elements label.
		this.galleryControls.bind( 'currentItem' ).to( this.setCurrentItemCommand, 'currentItem' );
		this.galleryControls.bind( 'currentItemLabel' ).to( this.setCurrentItemCommand, 'currentTemplateLabel' );
		this.galleryControls.bind( 'itemCount' ).to( this.setCurrentItemCommand, 'itemCount' );

		// Hide and disable the button if the command is not enabled.
		this.galleryControls.bind( 'isVisible' ).to( this.setCurrentItemCommand, 'isApplicable' );

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
		} );

		this.listenTo( this.galleryControls, 'addItem', () => {
			this.editor.execute( 'galleryAddItem' );
		} );
	}

	/**
	 * @inheritDoc
	 */
	_updateButtonDisplay() {
		const modelElement = this.setCurrentItemCommand.currentElement;

		if ( !modelElement || this.editor.isReadOnly ) {
			this.galleryControls.isVisible = false;
			return;
		}

		this.galleryControls.isVisible = true;

		const viewElement = this.editor.editing.mapper.toViewElement( modelElement );
		const domElement = this.editor.editing.view.domConverter.mapViewToDom( viewElement );

		const galleryControlsPosition = getOptimalPosition( {
			element: this.galleryControls.element,
			target: domElement,
			positions: [
				( targetRect, controlsRect ) => ( {
					top: targetRect.top - controlsRect.height,
					left: targetRect.left,
				} )
			]
		} );

		this.galleryControls.top = galleryControlsPosition.top;
		this.galleryControls.left = galleryControlsPosition.left;
	}
}
