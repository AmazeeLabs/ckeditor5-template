import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

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
					gallery: {
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

	it( 'is pre-filled with at least one item', () => {
		setModelData( model, '<ck__gallery></ck__gallery>' );
		expect( getModelData( model ) ).to.equal( [ '[',
			'<ck__gallery itemprop="gallery">',
			'<ck__a></ck__a>',
			'</ck__gallery>',
			']' ].join( '' ) );
	} );

	it( 'renders a gallery component', () => {
		setModelData( model, '<ck__gallery></ck__gallery>' );
		expect( getViewData( view ) ).to.equal( [ '[' +
		'<ck-gallery class="ck-widget ck-widget_selected gallery" contenteditable="false" itemprop="gallery" section="a">' +
		'<div class="a ck-widget" contenteditable="false"></div>' +
		'</ck-gallery>]' ].join( '' ) );
	} );
} );
