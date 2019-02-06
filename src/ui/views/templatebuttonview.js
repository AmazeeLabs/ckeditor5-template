import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import toUnit from '@ckeditor/ckeditor5-utils/src/dom/tounit';

const toPx = toUnit( 'px' );

/**
 * A button that can be positioned absolutely on the screen.
 */
export default class TemplateButtonView extends ButtonView {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );
		const bind = this.bindTemplate;
		this.set( 'top', 0 );
		this.set( 'left', 0 );
		this.set( 'tooltip', true );

		// By default the button is not visible.
		this.set( 'isVisible', false );

		this.extendTemplate( {
			attributes: {
				style: {
					position: 'absolute',
					top: bind.to( 'top', val => toPx( val ) ),
					left: bind.to( 'left', val => toPx( val ) ),
				},
				class: 'ck-button-ui'
			}
		} );
	}
}
