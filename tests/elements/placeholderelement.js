import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import PlaceholderElement from '../../src/elements/placeholderelement';

describe( 'Placeholder', () => {
	let editorElement, editor, model, view;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ PlaceholderElement, Paragraph ],
				templates: {
					a: {
						label: 'A',
						template: '<div class="a"></div>',
					},
					b: {
						label: 'B',
						template: '<div class="b"></div>',
					},
					c: {
						label: 'C',
						template: '<div class="c"></div>',
					},
					placeholder: {
						label: 'Placeholder',
						template: '<div class="placeholder"><div ck-type="placeholder" ck-conversions="a b"></div></div>',
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

	it( 'is upcast to a placeholder', () => {
		editor.setData( '<div class="placeholder"></div>' );
		expect( getModelData( model ) ).to.equal( '[' +
			'<ck__placeholder><ck__placeholder__child0></ck__placeholder__child0></ck__placeholder>' +
			']' );
	} );

	it( 'accepts allowed elements in its place', () => {
		editor.setData( '<div class="placeholder"><div class="a"></div></div>' );
		expect( getModelData( model ) ).to.equal( '[<ck__placeholder><ck__a></ck__a></ck__placeholder>]' );
	} );

	it( 'filters disallowed elements in its place', () => {
		editor.setData( '<div class="placeholder"><div class="c"></div></div>' );
		expect( getModelData( model ) ).to.equal( '[' +
			'<ck__placeholder><ck__placeholder__child0></ck__placeholder__child0></ck__placeholder>' +
			']' );
	} );

	it( 'renders buttons for allowed elements', () => {
		setModelData( model, '<ck__placeholder></ck__placeholder>' );
		expect( getViewData( view ) ).to.equal( '[' +
			'<div class="ck-widget ck-widget_selected placeholder" contenteditable="false">' +
			'<div class=" ck-widget" contenteditable="false">' +
			'<div class="ck-placeholder-ui"></div>' +
			'</div>' +
			'</div>]' );
	} );

	it( 'is selectable', () => {
		setModelData( model, [
			'<ck__placeholder>',
			'[<ck__placeholder__child0></ck__placeholder__child0>]',
			'</ck__placeholder>',
		].join( '' ) );

		expect( getModelData( model ) ).to.equal( [
			'<ck__placeholder>',
			'[<ck__placeholder__child0></ck__placeholder__child0>]',
			'</ck__placeholder>',
		].join( '' ) );

		expect( getViewData( view ) ).to.equal( [
			'<div class="ck-widget placeholder" contenteditable="false">',
			'[<div class=" ck-widget ck-widget_selected" contenteditable="false"><div class="ck-placeholder-ui"></div></div>]',
			'</div>'
		].join( '' ) );
	} );
} );
