import View from '@ckeditor/ckeditor5-ui/src/view';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import toUnit from '@ckeditor/ckeditor5-utils/src/dom/tounit';

import LeftIcon from '../../../theme/icons/arrow-left.svg';
import RightIcon from '../../../theme/icons/arrow-right.svg';
import AddIcon from '../../../theme/icons/add.svg';

const toPx = toUnit( 'px' );

/**
 * Display a gallery dot-pagination.
 */
export default class GalleryControlsView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );
		this.set( 'currentItem', 1 );
		this.set( 'itemCount', 1 );
		this.set( 'top', 0 );
		this.set( 'left', 0 );
		this.set( 'currentItemLabel', 'item' );
		this.set( 'statusText', '1 of 1' );
		this.set( 'isVisible', false );

		const bind = this.bindTemplate;

		this.bind( 'statusText' ).to( this, 'currentItem', this, 'itemCount', ( currentItem, itemCount ) => {
			return `${ currentItem + 1 }/${ itemCount }`;
		} );

		const buttonLeft = new ButtonView();
		buttonLeft.set( {
			icon: LeftIcon,
			tooltip: true,
		} );
		buttonLeft.bind( 'label' ).to( this, 'currentItemLabel', label => locale.t( 'Swipe %0 left', [ label ] ) );
		buttonLeft.bind( 'isEnabled' ).to( this, 'currentItem', currentItem => currentItem > 0 );
		this.listenTo( buttonLeft, 'execute', () => this.fire( 'setCurrentItem', this.currentItem - 1 ) );

		const buttonRight = new ButtonView();
		buttonRight.set( {
			icon: RightIcon,
			tooltip: true,
		} );
		buttonRight.bind( 'label' ).to( this, 'currentItemLabel', label => locale.t( 'Swipe %0 right', [ label ] ) );
		buttonRight.bind( 'isEnabled' ).to( this, 'currentItem', this, 'itemCount', ( currentItem, itemCount ) => {
			return currentItem < itemCount - 1;
		} );
		this.listenTo( buttonRight, 'execute', () => this.fire( 'setCurrentItem', this.currentItem + 1 ) );

		const buttonAdd = new ButtonView();
		buttonAdd.set( {
			icon: AddIcon,
			tooltip: true,
			isEnabled: true,
		} );
		buttonAdd.bind( 'label' ).to( this, 'currentItemLabel', label => locale.t( 'Add item to %0', [ label ] ) );
		this.listenTo( buttonAdd, 'execute', () => this.fire( 'addItem' ) );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck-gallery-controls',
					bind.if( 'isVisible', 'ck-hidden', value => !value ),
				],
				style: {
					position: 'absolute',
					top: bind.to( 'top', val => toPx( val ) ),
					left: bind.to( 'left', val => toPx( val ) ),
				},
			},
			children: [
				buttonLeft,
				{
					tag: 'div',
					class: 'ck-gallery-status',
					children: [ {
						text: bind.to( 'statusText' ),
					} ]
				},
				buttonRight,
				buttonAdd,
			]
		} );
	}
}
