import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import '../theme/css/hoveredwidget.css';

/**
 * Only highlight the innermost hovered widget, not all parent widgets.
 */
export default class HoveredWidget extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'HoveredWidget';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.ui.view.listenTo( global.window.document, 'mouseover', ( evt, data ) => {
			// @todo: improve this to not query the the document all the time, but
			// have maybe some statically cached list.
			for ( const node of global.window.document.querySelectorAll( '.ck-widget' ) ) {
				node.classList.remove( 'hovered' );
			}

			let element = data.target;
			while ( element && element.classList ) {
				if ( element.classList.contains( 'ck-widget' ) ) {
					element.classList.add( 'hovered' );
					break;
				}
				element = element.parentNode;
			}
		} );
	}
}
