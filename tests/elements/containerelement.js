import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import ContainerElement from '../../src/elements/containerelement';

describe( 'Container', () => {
	let editorElement, editor, model, view;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ ContainerElement ],
				templates: {
					a: {
						label: 'A',
						template: '<ck-section class="a"></ck-section>',
					},
					b: {
						label: 'B',
						template: '<ck-section class="b"></ck-section>',
					},
					container: {
						label: 'Container',
						template: '<ck-container class="container" ck-type="container" ck-contains="a b" itemprop="container"></ck-container>',
					},
					containersingle: {
						label: 'Container Single',
						template: '<ck-container class="container" ck-type="container" ck-contains="b" itemprop="container"></ck-container>',
					},
					c: {
						label: 'C',
						template: '<ck-container class="container" ck-type="container" ck-contains="containersingle" itemprop="container"></ck-container>',
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

	it( 'renders children as container items', () => {
		setModelData( model, [
			'<ck__container itemprop="container">',
			'<ck__a></ck__a>',
			'</ck__container>'
		].join( '' ) );
		expect( getViewData( view ) ).to.equal( [ '[' +
		'<ck-container class="ck-widget ck-widget_selected container" contenteditable="false" itemprop="container" sections="a b">' +
		'<ck-section class="a ck-widget" contenteditable="false"></ck-section>' +
		'</ck-container>]' ].join( '' ) );
	} );
} );
