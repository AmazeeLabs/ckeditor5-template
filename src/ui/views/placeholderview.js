import View from '@ckeditor/ckeditor5-ui/src/view';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

/**
 * Placeholder view. Renders a UI that can be replaced with an template instance of choice.
 */
export default class PlaceholderView extends View {
	constructor( modelElement, editor, allowed ) {
		super();

		const buttons = Object.keys( allowed ).map( template => {
			const view = new ButtonView();

			view.set( {
				label: allowed[ template ],
				withText: true
			} );

			view.render();

			view.on( 'execute', () => {
				editor.execute( 'replaceTemplate', { template } );
			} );

			return view;
		} );

		const template = {
			tag: 'div',
			attributes: {
				class: [ 'ck-placeholder-widget' ],
			},
			children: buttons,
		};

		this.setTemplate( template );
	}
}
