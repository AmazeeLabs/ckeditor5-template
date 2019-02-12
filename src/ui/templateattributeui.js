/**
 * @module template/templateattributes
 */

import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview';
import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import { getOptimalPosition } from '@ckeditor/ckeditor5-utils/src/dom/position';
import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';

import TemplateEditing from '../templateediting';
import TemplateAttributeCommand from '../commands/templateattributecommand';
import TemplateButtonView from './views/templatebuttonview';

import ConfigureIcon from '../../theme/icons/icon-menu.svg';

/**
 * Automatically add configurable attributes widgets to templates.
 */
export default class TemplateAttributeUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TemplateEditing ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TemplateAttributeUI';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );
		editor.config.define( 'templateAttributes', {} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		// If there are no attributes configured, just bail out.
		if ( !this.editor.config.get( 'templateAttributes' ) ) {
			return;
		}

		this.templateAttributes = this.editor.config.get( 'templateAttributes' );

		for ( const attr of Object.keys( this.templateAttributes ) ) {
			const templateAttribute = this.templateAttributes[ attr ];
			const type = templateAttribute.type;
			const commandName = `setTemplateAttribute:${ attr }`;
			const componentName = `templateAttribute:${ attr }`;
			this.editor.commands.add( commandName, new TemplateAttributeCommand( this.editor, attr ) );

			// We could create the method names dynamically but this is more explicit.
			const factories = {
				dropdown: this._createDropdownView,
				textfield: this._createTextfieldView,
				multiselect: this._createMultiselectView,
			};

			if ( !factories.hasOwnProperty( type ) ) {
				throw `Unrecognized template attribute type: ${ type }`;
			}

			const factoryMethod = factories[ type ];
			const args = [ templateAttribute, commandName, this.editor ];
			const callback = factoryMethod.apply( this, args );
			this.editor.ui.componentFactory.add( componentName, callback );

			// Add a downcast converter for each configurable attribute.
			this.editor.conversion.for( 'downcast' ).attributeToAttribute( {
				model: attr,
				view: attr,
			} );
		}

		/**
		 * A map of panel instances, keyed by the set of configurable attributes.
		 *
		 * @type {Object}
		 */
		this.toolbarPanels = {};

		/**
		 * Maps element names to toolbar panels in `toolbarPanels`.
		 * @type {Object}
		 */
		this.toolbarPointers = {};

		const templates = this.editor.templates.findElementInfo( info => info.isTemplateRoot );

		for ( const template of templates ) {
			// Get the ids of all the configuration attributes attached to the
			// selected element's template.
			const configurableAttributes = Object.keys( this.templateAttributes )
				.filter( attr => Object.keys( template.attributes ).includes( attr ) )
				.sort();

			// If template doesn't have configurable attributes, skip it.
			if ( configurableAttributes.length === 0 ) {
				continue;
			}

			const pointer = configurableAttributes.join( ':' );
			this.toolbarPointers[ template.name ] = pointer;

			// If the same toolbar has already been configured, just mark it as a pointer.
			if ( this.toolbarPanels.hasOwnProperty( pointer ) ) {
				continue;
			}

			const components = configurableAttributes.map( attr => `templateAttribute:${ attr }` );

			// At least one template attribute found. Create a toolbar view and fill
			// it with editable components based on the attribute's definition.
			const toolbar = this._createToolbarView();
			toolbar.fillFromConfig(
				components,
				this.editor.ui.componentFactory
			);

			const panel = this._createPanelView( toolbar );

			// Close the #panelView upon clicking outside of the plugin UI.
			clickOutsideHandler( {
				emitter: panel,
				contextElements: [ panel.element ],
				activator: () => panel.isVisible,
				callback: () => {
					this._hidePanels();
				}
			} );

			this.toolbarPanels[ pointer ] = panel;
		}

		this.configureButton = new TemplateButtonView( this.editor.locale );
		this.configureButton.set( {
			icon: ConfigureIcon,
			isVisible: false,
			class: 'ck-button-ui-attribute',
		} );
		this.editor.ui.view.body.add( this.configureButton );
		this.editor.ui.focusTracker.add( this.configureButton.element );

		// Update button positioning on any of the various occasions.
		this.listenTo( this.editor.ui, 'update', () => this._updateButtonDisplay() );
		this.listenTo( this.editor, 'change:isReadOnly', () => this._updateButtonDisplay() );

		this.listenTo( this.configureButton, 'change:isVisible', ( evt, name, isVisible ) => {
			if ( isVisible ) {
				this.listenTo( global.window, 'resize', () => this._updateButtonDisplay() );
			}
			else {
				this.stopListening( global.window, 'resize', () => this._updateButtonDisplay() );
				this._hidePanels();
			}
		} );

		this.listenTo( this.configureButton, 'execute', () => {
			this._hidePanels();
			const result = this.editor.templates.findSelectedTemplateElement( info => info.isTemplateRoot );
			const info = result.info;
			if ( info && this.toolbarPointers.hasOwnProperty( info.name ) ) {
				const pointer = this.toolbarPointers[ info.name ];
				if ( this.toolbarPanels.hasOwnProperty( pointer ) ) {
					this.toolbarPanels[ pointer ].pin( {
						target: this.configureButton.element,
						limiter: this.editor.ui.view.editableElement,
					} );
				}
			}
		} );
	}

	/**
	 * Hide all configuration panels.
	 *
	 * @private
	 */
	_hidePanels() {
		Object.values( this.toolbarPanels ).forEach( el => {
			el.isVisible = false;
		} );
	}

	/**
	 * Creates a dropdown component based on given template attribute.
	 *
	 * @param {Object} templateAttribute - The configuration object.
	 * @param {String} commandName - The command associated with the attribute.
	 * @param {Editor} editor - The editor object.
	 *
	 * @return {Function} - A callback for editor.ui.componentFactory.add.
	 */
	_createDropdownView( templateAttribute, commandName, editor ) {
		return locale => {
			const command = editor.commands.get( commandName );
			const dropdownItems = new Collection();
			const titles = {};

			for ( const key of Object.keys( templateAttribute.options ) ) {
				const option = templateAttribute.options[ key ];
				const itemModel = new Model( {
					label: option,
					withText: true,
				} );

				itemModel.bind( 'isActive' ).to( command, 'value', value => value === key );
				itemModel.set( {
					commandName,
					commandValue: key,
				} );
				titles[ key ] = option;

				dropdownItems.add( { type: 'button', model: itemModel } );
			}

			const dropdownView = createDropdown( locale );
			addListToDropdown( dropdownView, dropdownItems );

			dropdownView.buttonView.set( {
				isOn: false,
				withText: true,
				label: templateAttribute.label,
				tooltip: `Configure the ${ templateAttribute.label } option.`,
			} );

			dropdownView.buttonView.bind( 'label' ).to( command, 'value', value => {
				return titles[ value ] || templateAttribute.label;
			} );

			dropdownView.bind( 'isEnabled' ).to( command, 'isEnabled', value => {
				return value;
			} );

			// Execute command when an item from the dropdown is selected.
			this.listenTo( dropdownView, 'execute', evt => {
				editor.execute( evt.source.commandName, { value: evt.source.commandValue } );
			} );

			return dropdownView;
		};
	}

	/**
	 * Creates a dropdown component based on given template attribute.
	 *
	 * @param {Object} templateAttribute - The configuration object.
	 * @param {String} commandName - The command associated with the attribute.
	 * @param {Editor} editor - The editor object.
	 *
	 * @return {Function} - A callback for editor.ui.componentFactory.add.
	 */
	_createTextfieldView( templateAttribute, commandName, editor ) {
		return locale => {
			const command = editor.commands.get( commandName );
			const { placeholder = '' } = templateAttribute;
			const inputView = new InputTextView( locale );

			inputView.placeholder = placeholder;
			inputView.bind( 'value' ).to( command, 'value' );

			this.listenTo( inputView, 'input', evt => {
				editor.execute( commandName, { value: evt.source.element.value } );
			} );

			return inputView;
		};
	}

	/**
	 * Creates a multi-select dropdown component based on given template attribute.
	 *
	 * @param {Object} templateAttribute - The configuration object.
	 * @param {String} commandName - The command associated with the attribute.
	 * @param {Editor} editor - The editor object.
	 *
	 * @return {Function} - A callback for editor.ui.componentFactory.add.
	 */
	_createMultiselectView( templateAttribute, commandName, editor ) {
		return locale => {
			const command = editor.commands.get( commandName );
			const dropdownItems = new Collection();
			const keys = Object.keys( templateAttribute.options );

			/**
			 * Returns the label associated with given option key.
			 * @param {String} key
			 * @returns {String}
			 */
			const getLabel = key => templateAttribute.options[ key ];

			/**
			 * Turns given attribute value into an array of selections.
			 * @param {String} encodedKeys - Selected keys separated by commas.
			 * @returns {String[]}
			 */
			const decodeKeys = encodedKeys => ( encodedKeys || '' )
				.split( ',' )
				.filter( value => value )
				.sort( ( a, b ) => keys.indexOf( a ) - keys.indexOf( b ) );

			/**
			 * Returns a function that tells if a given value is currently selected.
			 * @param {String} key - A key in the options array.
			 * @returns {function(*): boolean}
			 */
			const valueIsSelected = key =>
				encodedKeys => decodeKeys( encodedKeys ).includes( key );

			/**
			 * Returns a comma separated list of selected items' labels.
			 * @param {String} encodedKeys - Selected keys separated by commas
			 * @returns {string}
			 */
			const getSelectionsSummary = encodedKeys => {
				const selections = decodeKeys( encodedKeys );
				if ( selections.length > 0 ) {
					return selections.map( getLabel ).join( ', ' );
				}
				return templateAttribute.label || '';
			};

			// Fill dropdownItems with switchbutton.
			for ( const optionKey of Object.keys( templateAttribute.options ) ) {
				const itemModel = new Model( {
					label: getLabel( optionKey ),
					withText: true,
					key: optionKey,
				} );

				// Turn the switchbutton on when it's key is present in the values
				// and off otherwise.
				itemModel.bind( 'isOn' ).to( command, 'value', valueIsSelected( optionKey ) );
				dropdownItems.add( { type: 'switchbutton', model: itemModel } );
			}

			const dropdownView = createDropdown( locale );
			addListToDropdown( dropdownView, dropdownItems );

			dropdownView.buttonView.set( {
				withText: true,
				label: templateAttribute.label,
				tooltip: `Configure the ${ templateAttribute.label } option.`,
			} );

			// Update the dropdown label whenever the selections set changes.
			dropdownView.buttonView
				.bind( 'label' )
				.to( command, 'value', getSelectionsSummary );

			// Execute command when any item from the dropdown is toggled.
			this.listenTo( dropdownView, 'execute', evt => {
				const values = decodeKeys( command.value );
				const { key } = evt.source;
				const index = values.indexOf( key );

				if ( index === -1 ) {
					// The item wasn't selected, add it to the values.
					values.push( key );
				} else {
					// The item was selected before. It's deselected now.
					values.splice( index, 1 );
				}
				editor.execute( commandName, { value: values.join( ',' ) } );
			} );

			return dropdownView;
		};
	}

	/**
	 * Creates the {@link #toolbarView}.
	 *
	 * @private
	 * @returns {module:ui/toolbar/toolbarview~ToolbarView}
	 */
	_createToolbarView() {
		const toolbarView = new ToolbarView( this.editor.locale );

		toolbarView.extendTemplate( {
			attributes: {
				// https://github.com/ckeditor/ckeditor5-editor-inline/issues/11
				class: [ 'ck-toolbar_floating' ]
			}
		} );

		return toolbarView;
	}

	/**
	 * Creates the {@link #panelView}.
	 *
	 * @private
	 * @returns {module:ui/panel/balloon/balloonpanelview~BalloonPanelView}
	 */
	_createPanelView( toolbar ) {
		const editor = this.editor;
		const panelView = new BalloonPanelView( editor.locale );

		panelView.content.add( toolbar );
		panelView.className = 'ck-toolbar-container';
		editor.ui.view.body.add( panelView );
		editor.ui.focusTracker.add( panelView.element );

		// Close #panelView on `Esc` press.
		toolbar.keystrokes.set( 'Esc', ( evt, cancel ) => {
			this._hidePanel( panelView );
			cancel();
		} );

		return panelView;
	}

	/**
	 * @inheritDoc
	 */
	_updateButtonDisplay() {
		const result = this.editor.templates.findSelectedTemplateElement( info => info.isTemplateRoot );
		const modelElement = result.element;
		const info = result.info;

		if ( !info || !this.toolbarPointers.hasOwnProperty( info.name ) || this.editor.isReadOnly ) {
			this.configureButton.isVisible = false;
			return;
		}

		this.configureButton.isVisible = true;

		const viewElement = this.editor.editing.mapper.toViewElement( modelElement );
		const domElement = this.editor.editing.view.domConverter.mapViewToDom( viewElement );

		const buttonPosition = getOptimalPosition( {
			element: this.configureButton.element,
			target: domElement,
			positions: [
				( targetRect, buttonRect ) => ( {
					top: targetRect.top + buttonRect.height,
					left: targetRect.left + targetRect.width,
				} )
			]
		} );

		this.configureButton.top = buttonPosition.top;
		this.configureButton.left = buttonPosition.left;
	}
}
