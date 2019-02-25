import TooltipView from '@ckeditor/ckeditor5-ui/src/tooltip/tooltipview';
import '../../../theme/css/textlimit.css';

import toUnit from '@ckeditor/ckeditor5-utils/src/dom/tounit';
const toPx = toUnit( 'px' );

export default class TextLimitTooltipView extends TooltipView {
	constructor( locale ) {
		super( locale );
		const bind = this.bindTemplate;
		this.set( 'top', 0 );
		this.set( 'left', 0 );
		this.set( 'isVisible', false );
		this.set( 'isExceeded', false );
		this.set( 'isHelper', false );

		this.extendTemplate( {
			attributes: {
				class: [
					'ck-text-limit',
					bind.if( 'isVisible', 'ck-text-limit-show' ),
					bind.if( 'isExceeded', 'ck-text-limit-exceeded' ),
					bind.if( 'isHelper', 'ck-text-helper' ),
				],
				style: {
					position: 'absolute',
					top: bind.to( 'top', val => toPx( val ) ),
					left: bind.to( 'left', val => toPx( val ) ),
				}
			}
		} );
	}
}
