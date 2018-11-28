/**
 * @module template/ui/templateui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

import TemplateEditing from '../templateediting';

/**
 * Template user interface features.
 *
 * Provides a toolbar element that allows to insert templates into the document.
 *
 *     toolbar: { 'heading', 'template' '... }
 */
export default class TemplateUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TemplateEditing ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		// Build the `template` dropdown element.
		this.editor.ui.componentFactory.add( 'template', locale => {
			const itemDefinitions = new Collection();
			const templates = this.editor.config.get( 'templates' );

			// Generate a definition for each registered template.
			for ( const template of Object.keys( templates ) ) {
				itemDefinitions.add( {
					type: 'button',
					model: new Model( {
						label: templates[ template ].label,
						withText: true,
						commandName: 'insertTemplate',
						commandValue: 'ck__' + template,
					} )
				} );
			}

			const dropdownView = createDropdown( locale );
			addListToDropdown( dropdownView, itemDefinitions );

			dropdownView.buttonView.set( {
				label: this.editor.t( 'Choose template ...' ),
				isOn: false,
				withText: true,
				tooltip: this.editor.t( 'Insert a template.' ),
			} );

			// Only enable the dropdown if a template element is applicable at this point.
			dropdownView.bind( 'isEnabled' ).to( this.editor.commands.get( 'insertTemplate' ), 'isEnabled' );

			// Listen to dropdown selection, execute the element command and set focus back to the editing view.
			this.listenTo( dropdownView, 'execute', evt => {
				this.editor.execute( evt.source.commandName, { value: evt.source.commandValue } );
				this.editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}
}
