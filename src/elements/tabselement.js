/**
 * @module template/elements/tabselement
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { downcastTemplateElement, getModelAttributes } from '../utils/conversion';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

import TemplateEditing from '../templateediting';

/**
 * Allow an arbitrary list of elements of a given type.
 *
 * Displays elements as tabs and allows to add titles and a default status.
 */
export default class TabsElement extends Plugin {
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
		// Get all configured placeholder elements.
		const tabsElements = this.editor.templates.getElementsByType( 'tabs' );

		for ( const tabsElement of tabsElements ) {
			// Extend the schema so that the contained elements can be placed in tabs.
			for ( const el of tabsElement.contains ) {
				this.editor.model.schema.extend( `ck__${ el }`, {
					allowIn: tabsElement.name,
				} );
			}
		}

		// Allow `$text` within all elements.
		// Required until https://github.com/ckeditor/ckeditor5-engine/issues/1593 is fixed.
		// TODO: Remove this once the issue is resolved.
		this.editor.model.schema.extend( '$text', {
			allowIn: tabsElements.map( el => `${ el.name }__placeholder` ),
		} );

		this.editor.conversion.for( 'editingDowncast' ).add( downcastTemplateElement( this.editor, {
			types: [ 'tabs' ],
			view: ( templateElement, modelElement, viewWriter ) => {
				const attributes = getModelAttributes( templateElement, modelElement );
				attributes.section = templateElement.contains[ 0 ];
				const el = viewWriter.createContainerElement(
					'ck-tabs',
					attributes
				);
				return templateElement.parent ? el : toWidget( el, viewWriter );
			}
		} ) );

		// Postfix elements to make sure a templates structure is always correct.
		this.editor.templates.registerPostFixer( [ 'tabs' ], ( templateElement, item, writer ) => {
			let changed = false;
			if ( item.childCount === 0 ) {
				writer.insertElement( `ck__${ templateElement.contains[ 0 ] }`, item, 'end' );
				changed = true;
			}

			return changed;
		} );
	}
}

