/**
 * @module template/elements/galleryelement
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { downcastTemplateElement, getModelAttributes } from '../utils/conversion';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

import TemplateEditing from '../templateediting';

import '../../theme/css/gallery.css';

/**
 * Allow an arbitrary list of elements of a given type.
 *
 * Displays elements in a horizontal gallery.
 */
export default class GalleryElement extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TemplateEditing ];
	}

	/**
	 * Set the current item of a given gallery.
	 *
	 * @param {module:engine/model/element~Element} model
	 * @param {Number} index
	 */
	setCurrentItem( model, index ) {
		const view = this.editor.editing.mapper.toViewElement( model );
		if ( view ) {
			this.editor.editing.view.change( writer => {
				writer.setAttribute( 'ck-gallery-current-item', index, view );
			} );
		}
	}

	/**
	 * Get the current item index of a given gallery.
	 *
	 * @param model
	 */
	getCurrentItem( model ) {
		const view = this.editor.editing.mapper.toViewElement( model );
		if ( view ) {
			return view.getAttribute( 'ck-gallery-current-item' );
		}
	}

	/**
	 * @inheritDoc
	 */
	init() {
		// Get all configured placeholder elements.
		const galleryElements = this.editor.templates.getElementsByType( 'gallery' );

		for ( const galleryElement of galleryElements ) {
			// Extend the schema so that the contained elements can be placed in the gallery.
			for ( const el of galleryElement.contains ) {
				this.editor.model.schema.extend( `ck__${ el }`, {
					allowIn: galleryElement.name,
				} );
			}
		}

		// Allow `$text` within all elements.
		// Required until https://github.com/ckeditor/ckeditor5-engine/issues/1593 is fixed.
		// TODO: Remove this once the issue is resolved.
		this.editor.model.schema.extend( '$text', {
			allowIn: galleryElements.map( el => `${ el.name }__placeholder` ),
		} );

		this.editor.conversion.for( 'editingDowncast' ).add( downcastTemplateElement( this.editor, {
			types: [ 'gallery' ],
			view: ( templateElement, modelElement, viewWriter ) => {
				const attributes = getModelAttributes( templateElement, modelElement );
				attributes.section = templateElement.contains[ 0 ];
				const el = viewWriter.createContainerElement(
					'ck-gallery',
					attributes
				);
				return templateElement.parent ? el : toWidget( el, viewWriter );
			}
		} ) );

		// Postfix elements to make sure a templates structure is always correct.
		this.editor.templates.registerPostFixer( [ 'gallery' ], ( templateElement, item, writer ) => {
			let changed = false;
			if ( item.childCount === 0 ) {
				if ( templateElement.contains.length === 1 ) {
					writer.insertElement( `ck__${ templateElement.contains[ 0 ] }`, item, 'end' );
				} else {
					writer.insertElement( templateElement.name + '__placeholder', item, 'end' );
				}
				changed = true;
			}

			return changed;
		} );
	}
}

