import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import TextElement from './elements/textelement';
import TextLimitTooltipView from './ui/views/textlimittooltipview';
import { getOptimalPosition } from '@ckeditor/ckeditor5-utils/src/dom/position';

/**
 * Display a tooltip with the remaining amount of characters on a textfield if it has an assigned limit.
 */
export default class TextLimit extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TextElement ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this.tooltipView = new TextLimitTooltipView();
		this.tooltipView.set();
		this.editor.ui.view.body.add( this.tooltipView );
		this.editor.ui.focusTracker.add( this.tooltipView.element );

		// Update button positioning on any of the various occasions.
		this.listenTo( this.editor.ui, 'update', () => this._updateTooltipDisplay() );
		this.listenTo( this.editor, 'change:isReadOnly', () => this._updateTooltipDisplay() );
	}

	/**
	 * @inheritDoc
	 */
	_updateTooltipDisplay() {
		const result = this.editor.templates.findSelectedTemplateElement( info => {
			return info.type === 'text' && info.configuration.limit;
		} );

		if ( !result.element || this.editor.isReadOnly ) {
			this.tooltipView.isVisible = false;
			return;
		}
		const limit = parseInt( result.info.configuration.limit );

		this.tooltipView.isVisible = true;

		const viewElement = this.editor.editing.mapper.toViewElement( result.element );
		const domElement = this.editor.editing.view.domConverter.mapViewToDom( viewElement );

		const characters = domElement.innerText.replace( /[\u200B-\u200D\uFEFF]/g, '' ).trim().length;

		if ( characters > limit ) {
			domElement.classList.add( 'ck-text-field-limit-exceeded' );
		}
		else {
			domElement.classList.remove( 'ck-text-field-limit-exceeded' );
		}

		const message = characters > limit ?
			this.editor.locale.t( 'Too long: please remove at least %0 letters.', [ characters - limit ] ) :
			this.editor.locale.t( '%0 letters remaining.', [ limit - characters ] );

		this.tooltipView.isExceeded = characters > limit;
		this.tooltipView.set( { text: message } );

		const tooltipPosition = getOptimalPosition( {
			element: this.tooltipView.element,
			target: domElement,
			positions: [
				targetRect => ( {
					top: targetRect.top + targetRect.height,
					left: targetRect.left,
				} )
			]
		} );

		this.tooltipView.top = tooltipPosition.top;
		this.tooltipView.left = tooltipPosition.left;
	}
}
