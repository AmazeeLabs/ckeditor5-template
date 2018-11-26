import View from '@ckeditor/ckeditor5-ui/src/view';
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";

/**
 * Placeholder view. Renders a UI that can be replaced with an template instance of choice.
 */
export default class PlaceholderView extends View {
	constructor(modelElement, editor, allowed) {
		super();

		const elements = editor.config.get('templates');

		const buttons = allowed.map( template => {
			const view = new ButtonView();

			view.set({
				label: elements[template].label,
				withText: true
			});

			view.on('execute', () => {
				editor.execute(`fillPlaceholder`, {
					model: modelElement,
					template: template,
				});
			});

			return view;
		} );


		const removeButton = new ButtonView();
		removeButton.set({
		  label: 'Remove',
		  withText: true,
		  class: 'close-button'
		});

		removeButton.on('execute', () => {
		  editor.execute('removePlaceholder', {model: modelElement});
		});

		const template = {
			tag: 'div',
			attributes: {
				class: ['ck-placeholder-widget'],
			},
			children: [
				{
					tag: 'div',
					attributes: {
						class: ['ck-placeholder-templates']
					},
					children: buttons,
				},
				removeButton
			]
		};

		this.setTemplate(template);
	}
}
