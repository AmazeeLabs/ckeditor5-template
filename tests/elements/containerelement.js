import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import ContainerElement from '../../src/elements/containerelement';

describe( 'Container', () => {
	let editorElement, editor, model;

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
						template: '<div class="wrapper"><div class="container" ck-type="container" ck-contains="a"></div></div>',
					}
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	afterEach( () => {
		editorElement.remove();
		return editor.destroy();
	} );

	it( 'is pre-filled with at least one placeholder', () => {
		setModelData( model, '<ck__container><ck__container__child0></ck__container__child0></ck__container>' );
		expect( getModelData( model ) ).to.equal( [ '[',
			'<ck__container>',
			'<ck__container__child0>',
			'<ck__container__child0__placeholder></ck__container__child0__placeholder>',
			'</ck__container__child0>',
			'</ck__container>',
			']' ].join( '' ) );
	} );

	it( 'removes double placeholders', () => {
		setModelData( model, [
			'<ck__container>',
			'<ck__container__child0>',
			'<ck__container__child0__placeholder></ck__container__child0__placeholder>',
			'<ck__container__child0__placeholder></ck__container__child0__placeholder>',
			'</ck__container__child0>',
			'</ck__container>'
		].join( '' ) );
		expect( getModelData( model ) ).to.equal( [ '[',
			'<ck__container>',
			'<ck__container__child0>',
			'<ck__container__child0__placeholder></ck__container__child0__placeholder>',
			'</ck__container__child0>',
			'</ck__container>',
			']' ].join( '' ) );
	} );

	it( 'wraps elements in placeholders', () => {
		setModelData( model, [
			'<ck__container>',
			'<ck__container__child0>',
			'<ck__a></ck__a>',
			'</ck__container__child0>',
			'</ck__container>'
		].join( '' ) );
		expect( getModelData( model ) ).to.equal( [ '[',
			'<ck__container>',
			'<ck__container__child0>',
			'<ck__container__child0__placeholder></ck__container__child0__placeholder>',
			'<ck__a></ck__a>',
			'<ck__container__child0__placeholder></ck__container__child0__placeholder>',
			'</ck__container__child0>',
			'</ck__container>',
			']' ].join( '' ) );
	} );

	it( 'puts placeholders between each element', () => {
		setModelData( model, [
			'<ck__container>',
			'<ck__container__child0>',
			'<ck__a></ck__a>',
			'<ck__a></ck__a>',
			'<ck__a></ck__a>',
			'</ck__container__child0>',
			'</ck__container>'
		].join( '' ) );
		expect( getModelData( model ) ).to.equal( [ '[',
			'<ck__container>',
			'<ck__container__child0>',
			'<ck__container__child0__placeholder></ck__container__child0__placeholder>',
			'<ck__a></ck__a>',
			'<ck__container__child0__placeholder></ck__container__child0__placeholder>',
			'<ck__a></ck__a>',
			'<ck__container__child0__placeholder></ck__container__child0__placeholder>',
			'<ck__a></ck__a>',
			'<ck__container__child0__placeholder></ck__container__child0__placeholder>',
			'</ck__container__child0>',
			'</ck__container>',
			']' ].join( '' ) );
	} );
} );
