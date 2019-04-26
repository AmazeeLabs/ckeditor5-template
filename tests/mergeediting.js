import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import MergeEditing from '../src/mergeediting';
import TextElement from '../src/elements/textelement';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ContainerElement from '../src/elements/containerelement';

describe( 'Merge editing', () => {
	let editorElement, model, view, editor;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ MergeEditing, TextElement, Paragraph, ContainerElement ],
				templates: {
					container: {
						label: 'Container',
						template: '<div class="container" ck-type="container" ck-contains="a b"></div>',
					},
					a: {
						label: 'A',
						template: '<div class="a"></div>',
					},
					b: {
						label: 'B',
						template: '<div class="b"><p class="text" ck-type="text"></p></div>',
					},
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

	it( 'allows "added" and "removed" attributes on template roots', () => {
		editor.setData( '<div class="container"><div class="a" added></div><div class="a" removed></div></div>' );
		expect( getModelData( model ) ).to.equal( '[<ck__container><ck__a added=""></ck__a><ck__a removed=""></ck__a></ck__container>]' );
	} );

	it( 'filters "added and "removed" attributes from non-root elements', () => {
		editor.setData( '<div class="container"><div class="b"><p class="text" added removed></p></div></div>' );
		expect( getModelData( model ) ).to.equal( '[<ck__container><ck__b><ck__b__child0></ck__b__child0></ck__b></ck__container>]' );
	} );

	it( 'allows text conflict elements in place of text elements', () => {
		const data = [ '[' +
			'<ck__container>' +
				'<ck__b>' +
					'<ck__b__child0__conflict>' +
						'<ck__b__child0__conflict__option from="A">' +
							'<ck__b__child0></ck__b__child0>' +
						'</ck__b__child0__conflict__option>' +
						'<ck__b__child0__conflict__option from="B">' +
							'<ck__b__child0></ck__b__child0>' +
						'</ck__b__child0__conflict__option>' +
					'</ck__b__child0__conflict>' +
				'</ck__b>' +
			'</ck__container>' +
		']' ].join( '' );
		setModelData( model, data );
		expect( getModelData( model ) ).to.equal( data );
	} );

	it( 'upcasts text conflict elements', () => {
		editor.setData( [
			'<div class="container">' +
				'<div class="b">' +
					'<ck-conflict-text class="text">' +
						'<ck-conflict-option from="A"><p class="text">A</p></ck-conflict-option>' +
						'<ck-conflict-option from="B"><p class="text">B</p></ck-conflict-option>' +
						'<ck-conflict-option from="C"><p class="text">C</p></ck-conflict-option>' +
					'</ck-conflict-text>' +
				'</div>' +
			'</div>'
		].join( '' ) );

		expect( getModelData( model ) ).to.equal( [ '[' +
			'<ck__container>' +
				'<ck__b>' +
					'<ck__b__child0__conflict>' +
						'<ck__b__child0__conflict__option from="A">' +
							'<ck__b__child0>A</ck__b__child0>' +
						'</ck__b__child0__conflict__option>' +
						'<ck__b__child0__conflict__option from="B">' +
							'<ck__b__child0>B</ck__b__child0>' +
						'</ck__b__child0__conflict__option>' +
						'<ck__b__child0__conflict__option from="C">' +
							'<ck__b__child0>C</ck__b__child0>' +
						'</ck__b__child0__conflict__option>' +
					'</ck__b__child0__conflict>' +
				'</ck__b>' +
			'</ck__container>' +
			']' ].join( '' ) );
	} );

	it( 'editor downcasts to conflict elements', () => {
		const data = [ '[' +
		'<ck__container>' +
			'<ck__b>' +
				'<ck__b__child0__conflict>' +
					'<ck__b__child0__conflict__option from="A">' +
						'<ck__b__child0>A</ck__b__child0>' +
					'</ck__b__child0__conflict__option>' +
					'<ck__b__child0__conflict__option from="B">' +
						'<ck__b__child0>B</ck__b__child0>' +
					'</ck__b__child0__conflict__option>' +
				'</ck__b__child0__conflict>' +
			'</ck__b>' +
		'</ck__container>' +
		']' ].join( '' );
		setModelData( model, data );
		expect( editor.getData() ).to.equal( [
			'<div class="container">' +
				'<div class="b">' +
					'<ck-conflict-text class="text">' +
						'<ck-conflict-option from="A"><p class="text">A</p></ck-conflict-option>' +
						'<ck-conflict-option from="B"><p class="text">B</p></ck-conflict-option>' +
					'</ck-conflict-text>' +
				'</div>' +
			'</div>'
		].join( '' ) );
	} );

	it( 'editor displays to conflict elements', () => {
		const data = [ '[' +
		'<ck__container>' +
			'<ck__b>' +
				'<ck__b__child0__conflict>' +
					'<ck__b__child0__conflict__option from="A">' +
						'<ck__b__child0>A</ck__b__child0>' +
					'</ck__b__child0__conflict__option>' +
					'<ck__b__child0__conflict__option from="B">' +
						'<ck__b__child0>B</ck__b__child0>' +
					'</ck__b__child0__conflict__option>' +
				'</ck__b__child0__conflict>' +
			'</ck__b>' +
		'</ck__container>' +
		']' ].join( '' );
		setModelData( model, data );
		expect( getViewData( view ) ).to.equal( [ '[' +
		'<div ck-contains="a b" ck-icon="configurator" ck-label="Container" ck-name="container" ck-type="container" class="ck-widget ck-widget_selected container" contenteditable="false">' +
			'<div ck-icon="configurator" ck-label="B" ck-name="b" class="b ck-widget" contenteditable="false">' +
				'<ck-conflict-text class="text">' +
					'<ck-conflict-option from="A">' +
						'<p class="text">A</p>' +
					'</ck-conflict-option>' +
					'<ck-conflict-option from="B">' +
						'<p class="text">B</p>' +
					'</ck-conflict-option>' +
				'</ck-conflict-text>' +
			'</div>' +
		'</div>' +
		']' ].join( '' ) );
	} );
} );
