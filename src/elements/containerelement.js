/**
 * @module template/elements/containerelement
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import { downcastTemplateElement, getModelAttributes } from '../utils/conversion';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

import TemplateEditing from '../templateediting';
import PlaceholderElement from './placeholderelement';

/**
 * Allow an arbitrary list of elements of a given type.
 */
export default class ContainerElement extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TemplateEditing, PlaceholderElement ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		// Get all configured placeholder elements.
		const containerElements = this.editor.templates.getElementsByType( 'container' );

		for ( const containerElement of containerElements ) {
			// Extend the schema so that the contained elements can be placed in the container.
			for ( const el of containerElement.contains ) {
				this.editor.model.schema.extend( `ck__${ el }`, {
					allowIn: containerElement.name,
				} );
			}

			// Register a new placeholder for this container by creating a template element.
			const dom = global.document.createElement( 'div' );
			dom.setAttribute( 'ck-type', 'placeholder' );
			dom.setAttribute( 'ck-name', 'placeholder' );
			dom.setAttribute( 'ck-conversions', containerElement.contains.join( ' ' ) );
			this.editor.templates.registerElement( dom, containerElement );
		}

		// Allow `$text` within all elements.
		// Required until https://github.com/ckeditor/ckeditor5-engine/issues/1593 is fixed.
		// TODO: Remove this once the issue is resolved.
		this.editor.model.schema.extend( '$text', {
			allowIn: containerElements.map( el => `${ el.name }__placeholder` ),
		} );

		this.editor.conversion.for( 'editingDowncast' ).add( downcastTemplateElement( this.editor, {
			types: [ 'container' ],
			view: ( templateElement, modelElement, viewWriter ) => {
				const el = viewWriter.createContainerElement(
					templateElement.tagName,
					Object.assign( getModelAttributes( templateElement, modelElement ), {
						'ck-container-layout': templateElement.configuration.layout || 'vertical',
					} )
				);
				return templateElement.parent ? el : toWidget( el, viewWriter );
			}
		} ) );

		// Postfix elements to make sure a templates structure is always correct.
		this.editor.templates.registerPostFixer( [ 'container' ], ( templateElement, item, writer ) => {
			// Remove any double-placeholders by finding placeholders that are followed by placeholders.
			let changed = Array.from( item.getChildren() )
				.filter( child =>
					this.editor.templates.getElementInfo( child.name ).type === 'placeholder' &&
					child.nextSibling && this.editor.templates.getElementInfo( child.nextSibling.name ).type === 'placeholder'
				).map( child => {
					writer.remove( child );
				} ).length > 0;

			// Intersperse children with placeholders.
			// Filter for all children that are not placeholders themselves and are not
			// directly followed by a placeholder.
			changed = changed || Array.from( item.getChildren() )
				.filter( child =>
					this.editor.templates.getElementInfo( child.name ).type !== 'placeholder' &&
					( !child.nextSibling || this.editor.templates.getElementInfo( child.nextSibling.name ).type !== 'placeholder' )
				).map( slot => {
					writer.insertElement( templateElement.name + '__placeholder', slot, 'after' );
				} ).length > 0;

			if ( item.childCount > 0 ) {
				// If there are children, make sure the first one is a placeholder.
				const firstChild = item.getChild( 0 );
				if ( this.editor.templates.getElementInfo( firstChild.name ).type !== 'placeholder' ) {
					writer.insertElement( templateElement.name + '__placeholder', item.getChild( 0 ), 'before' );
					changed = true;
				}
			}
			else {
				// If there are no children, inject at least one placeholder.
				writer.insertElement( templateElement.name + '__placeholder', item, 'end' );
				changed = true;
			}

			return changed;
		} );
	}
}

