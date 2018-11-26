/**
 * @module template/mastertemplate
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import TemplateEditing from './templateediting';

/**
 * Master template plugin.
 *
 * Allows to define a master template for the current document that will take control over the whole page layout.
 */
export default class MasterTemplate extends Plugin {
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
		return 'MasterTemplate';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );
		editor.config.define( 'masterTemplate', null );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		// If there is no master template configured, just bail out.
		if ( !this.editor.config.get( 'masterTemplate' ) ) {
			return;
		}

		// Add the templates prefix.
		const masterTemplate = 'ck__' + this.editor.config.get( 'masterTemplate' );

		// Child-check that ensures that nothing but the master template will ever end up at the document root.
		this.editor.model.schema.addChildCheck( ( context, def ) => {
			if ( context.endsWith( '$root' ) && def.name !== masterTemplate ) {
				return false;
			}
		} );

		// The postfixer will add an master template to empty documents.
		this.editor.model.document.registerPostFixer( writer => this._ensureMasterTemplate( writer, masterTemplate ) );
		// It has to be called for new existing empty documents separately.
		this.editor.on( 'dataReady', () => {
			this.editor.model.enqueueChange( 'transparent', writer => this._ensureMasterTemplate( writer, masterTemplate ) );
		}, { priority: 'lowest' } );
	}

	/**
	 * Adds the root template into each empty root element.
	 *
	 * @param {module:engine/model/writer~Writer} modelWriter - The element's writer.
	 * @param {String} masterTemplate - The root template's id.
	 *
	 * @return {Boolean} - True if any changes were made.
	 *
	 * @private
	 */
	_ensureMasterTemplate( modelWriter, masterTemplate ) {
		const model = this.editor.model;

		for ( const rootName of model.document.getRootNames() ) {
			const root = model.document.getRoot( rootName );

			if ( root.rootName === '$graveyard' ) {
				continue;
			}

			if ( root.isEmpty ) {
				modelWriter.appendElement( masterTemplate, root );
				return true;
			}
		}
	}
}
