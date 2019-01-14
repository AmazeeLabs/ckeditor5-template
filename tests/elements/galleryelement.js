import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import ReplaceTemplateCommand from '../../src/commands/replacetemplatecommand';
import GalleryElement from '../../src/elements/galleryelement';

describe( 'Gallery', () => {
	let editorElement, editor, model, view;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ GalleryElement ],
				templates: {
					a: {
						label: 'A',
						template: '<div class="a"></div>',
					},
					b: {
						label: 'B',
						template: '<div class="b"></div>',
					},
					gallery: {
						label: 'Container',
						template: '<div class="gallery" itemprop="gallery" ck-type="gallery" ck-contains="a b"></div>',
					},
					gallerysingle: {
						label: 'Gallery Single',
						template: '<div class="gallery" itemprop="gallery" ck-type="gallery" ck-contains="a"></div>',
					}
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				view = editor.editing.view;
			} );
	} );

	afterEach( () => {
		editorElement.remove();
		return editor.destroy();
	} );

	it( 'is pre-filled with at least one placeholder', () => {
		setModelData( model, '<ck__gallery></ck__gallery>' );
		expect( getModelData( model ) ).to.equal( [ '[',
			'<ck__gallery itemprop="gallery">',
			'<ck__gallery__placeholder></ck__gallery__placeholder>',
			'</ck__gallery>',
			']' ].join( '' ) );
	} );

	it( 'doesn\'t add placeholders to non-empty elements', () => {
		setModelData( model, [
			'<ck__gallery itemprop="gallery">',
			'<ck__a></ck__a>',
			'</ck__gallery>'
		].join( '' ) );
		expect( getModelData( model ) ).to.equal( [ '[',
			'<ck__gallery itemprop="gallery">',
			'<ck__a></ck__a>',
			'</ck__gallery>',
			']' ].join( '' ) );
	} );

	it( 'allows to select placeholders', () => {
		setModelData( model, [
			'<ck__gallery itemprop="gallery">',
			'[<ck__gallery__placeholder></ck__gallery__placeholder>]',
			'</ck__gallery>'
		].join( '' ) );

		expect( getModelData( model ) ).to.equal( [
			'<ck__gallery itemprop="gallery">',
			'[<ck__gallery__placeholder></ck__gallery__placeholder>]',
			'</ck__gallery>',
		].join( '' ) );

		expect( getViewData( view ) ).to.equal( [
			'<div ck-gallery-current-item="0" class="ck-widget gallery" contenteditable="false" itemprop="gallery">',
			'[<div class=" ck-widget ck-widget_selected" contenteditable="false">',
			'<div class="ck-placeholder-ui"></div>',
			'</div>]',
			'</div>',
		].join( '' ) );

		expect( model.document.selection.getSelectedElement().name ).to.equal( 'ck__gallery__placeholder' );
	} );

	it( 'allows to insert elements at a placeholder position', () => {
		const command = new ReplaceTemplateCommand( editor );

		setModelData( model, [
			'<ck__gallery itemprop="gallery">',
			'[<ck__gallery__placeholder></ck__gallery__placeholder>]',
			'</ck__gallery>'
		].join( '' ) );

		expect( command.isEnabled ).to.be.true;
		command.execute( { template: 'ck__a' } );

		expect( getModelData( model ) ).to.equal( [
			'<ck__gallery itemprop="gallery">',
			'[<ck__a></ck__a>]',
			'</ck__gallery>',
		].join( '' ) );
	} );

	it( 'it sets the current element', () => {
		setModelData( model, [
			'<ck__gallery itemprop="gallery">',
			'[<ck__a></ck__a>]',
			'<ck__a></ck__a>',
			'<ck__a></ck__a>',
			'</ck__gallery>',
		].join( '' ) );

		expect( getViewData( view ) ).to.equal( [
			'<div ck-gallery-current-item="0" class="ck-widget gallery" contenteditable="false" itemprop="gallery">',
			'[<div class="a ck-widget ck-widget_selected" contenteditable="false"></div>]',
			'<div class="a ck-widget" contenteditable="false"></div>',
			'<div class="a ck-widget" contenteditable="false"></div>',
			'</div>',
		].join( '' ) );
	} );

	it( 'fills container if only one element is available', () => {
		setModelData( model, [
			'<ck__gallerysingle itemprop="container">',
			'</ck__gallerysingle>'
		].join( '' ) );

		expect( getModelData( model ) ).to.equal( [
			'[<ck__gallerysingle itemprop="container">',
			'<ck__a></ck__a>',
			'</ck__gallerysingle>]',
		].join( '' ) );
	} );
} );
