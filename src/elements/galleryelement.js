/**
 * @module template/elements/galleryelement
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import { downcastTemplateElement, getModelAttributes } from '../utils/conversion';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

import TemplateEditing from '../templateediting';
import PlaceholderElement from './placeholderelement';

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
		return [ TemplateEditing, PlaceholderElement ];
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

			// Register a new placeholder for this gallery by creating a template element.
			const dom = global.document.createElement( 'div' );
			dom.setAttribute( 'ck-type', 'placeholder' );
			dom.setAttribute( 'ck-name', 'placeholder' );
			dom.setAttribute( 'ck-conversions', galleryElement.contains.join( ' ' ) );
			this.editor.templates.registerElement( dom, galleryElement );
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
				const el = viewWriter.createContainerElement(
					templateElement.tagName,
					Object.assign( getModelAttributes( templateElement, modelElement ), {
						'ck-gallery-current-item': 0,
					} )
				);
				return templateElement.parent ? el : toWidget( el, viewWriter );
			}
		} ) );

		// TODO: Throttle this?
		this.editor.editing.view.on( 'render', () => {
			const domRoot = this.editor.editing.view.getDomRoot();
			const galleries = domRoot.querySelectorAll( '[ck-gallery-current-item]' );
			for ( const gallery of galleries ) {
				for ( const item of gallery.childNodes ) {
					item.style.transform = `translateX(calc(${ gallery.getAttribute( 'ck-gallery-current-item' ) } * -100%)) scale(0.98)`;
					item.style.transformOrigin = 'center';
				}
			}
		} );

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

