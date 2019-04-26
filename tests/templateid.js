import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import TemplateId from '../src/templateid';
import ContainerElement from '../src/elements/containerelement';

describe( 'TemplateId', () => {
	let editorElement, editor, model;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ TemplateId, ContainerElement, Paragraph ],
				masterTemplate: 'master',
				templateSession: 'a',
				templates: {
					a: {
						label: 'A',
						template: '<div class="a"></div>',
					},
					b: {
						template: '<div class="b"><div class="c"></div></div>',
					},
					d: {
						template: '<div class="d"></div>',
					},
					container_b: {
						label: 'B Container',
						template: '<div class="wrapper"><div class="container" ck-type="container" ck-contains="b"></div></div>',
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

	it( 'automatically adds ids to elements without ids', () => {
		setModelData( model, '<ck__a></ck__a><ck__a id="exists"></ck__a>' );
		expect( getModelData( model ) ).to.equal( [
			'[<ck__a id="374c5q"></ck__a>]<ck__a id="exists"></ck__a>'
		].join( '' ) );
	} );

	it( 'adds ids to upcasted elements', () => {
		editor.setData( [
			'<div class="a"></div>',
			'<div class="a" id="exists"></div>',
		].join( '' ) );
		expect( getModelData( model ) ).to.equal( [
			'[<ck__a id="374c5q"></ck__a>]<ck__a id="exists"></ck__a>'
		].join( '' ) );
	} );

	it( 'generates different id\'s for each element', () => {
		setModelData( model, '<ck__a></ck__a><ck__a></ck__a>' );
		expect( getModelData( model ) ).to.equal( [
			'[<ck__a id="374c5q"></ck__a>]<ck__a id="374cy7"></ck__a>'
		].join( '' ) );
	} );

	it( 'doesn\'t add ids to sub-elements', () => {
		setModelData( model, '<ck__b><ck__b__child0></ck__b__child0></ck__b>' );
		expect( getModelData( model ) ).to.equal( [
			'[<ck__b id="374c5q"><ck__b__child0></ck__b__child0></ck__b>]'
		].join( '' ) );
	} );

	it( 'generates different ids per session', () => {
		setModelData( model, '<ck__a></ck__a>' );
		const sessionA = getModelData( model );
		editor.config.set( 'templateSession', 'b' );
		setModelData( model, '<ck__a></ck__a>' );
		expect( getModelData( model ) ).to.not.equal( sessionA );
	} );

	it( 'fills empty id attributes', () => {
		editor.setData( [
			'<div class="a" id=""></div>',
		].join( '' ) );
		expect( getModelData( model ) ).to.equal( [
			'[<ck__a id="374c5q"></ck__a>]'
		].join( '' ) );
	} );

	it( 'generates ids for container children and container', () => {
		editor.setData( [
			'<div class="wrapper"><div class="container" ck-type="container" ck-contains="b"><div class="b"></div></div></div>',
		].join( '' ) );

		expect( getModelData( model ) ).to.equal( [
			'[<ck__container_b id="374c5q">' +
			'<ck__container_b__child0>' +
			'<ck__b id="374cy7"><ck__b__child0></ck__b__child0></ck__b>' +
			'</ck__container_b__child0>' +
			'</ck__container_b>]'
		].join( '' ) );
	} );

	it( 'generates ids for container children without id', () => {
		editor.setData( [
			'<div class="wrapper">' +
			'<div class="container" ck-type="container" ck-contains="b">' +
			'<div class="b"></div>',
			'</div>',
			'</div>',
		].join( '' ) );

		expect( getModelData( model ) ).to.equal( [
			'[<ck__container_b id="374c5q">' +
			'<ck__container_b__child0>' +
			'<ck__b id="374cy7"><ck__b__child0></ck__b__child0></ck__b>' +
			'</ck__container_b__child0>' +
			'</ck__container_b>]'
		].join( '' ) );
	} );
} );
