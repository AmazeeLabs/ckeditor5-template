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
						template: '<div class="a"></div>',
					},
					b: {
						label: 'B',
						template: '<div class="b"></div>',
					},
					container: {
						label: 'Container',
						template: '<div class="container" ck-type="container" ck-contains="a b" itemprop="container"></div>',
					},
					containersingle: {
						label: 'Container Single',
						template: '<div class="container" ck-type="container" ck-contains="b" itemprop="container"></div>',
					},
					c: {
						label: 'C',
						template: '<div class="container" ck-type="container" ck-contains="containersingle" itemprop="container"></div>',
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
		'<ck-container-item class="a ck-widget" contenteditable="false"></ck-container-item>' +
		'</ck-container>]' ].join( '' ) );
	} );
} );
