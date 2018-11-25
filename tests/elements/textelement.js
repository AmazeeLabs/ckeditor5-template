import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import TextElement from '../../src/elements/textelement';

describe( 'TextElement', () => {
	let editorElement, editor, model, view;
	const editableClasses = 'ck-editor__editable ck-editor__nested-editable ck-widget ck-widget_selected';

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ TextElement, Paragraph ],
				templates: {
					simple: {
						label: 'Simple',
						template: '<p class="simple" ck-type="text"></p>',
					},
					placeholder: {
						label: 'Placeholder',
						template: '<p class="placeholder" ck-type="text">Placeholder!</p>',
					},
					container: {
						label: 'Container',
						template: '<div class="container" ck-type="text"></div>'
					},
					containerWithText: {
						label: 'Container with text',
						template: '<div class="container-with-text" ck-type="text">Text</div>'
					},
					fakeContainer: {
						label: 'Fake Container',
						template: '<p class="fake-container" ck-type="text" ck-multiline="true"></p>'
					},
					fakeBlock: {
						label: 'Fake Block',
						template: '<div class="fake-block" ck-type="text" ck-mutiline="false"></div>'
					},
					nested: {
						label: 'Nested',
						template: '<div class="parent"><p class="simple" ck-type="text"></p></div>'
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

	it( 'simple text field', () => {
		setModelData( model, '<ck__simple></ck__simple>' );
		expect( getViewData( view ) ).to.equal( '[' +
			'<p class="' + editableClasses + ' simple" contenteditable="true"></p>' +
			']' );
	} );

	it( 'simple text field with placeholder', () => {
		setModelData( model, '<ck__placeholder></ck__placeholder>' );
		expect( getViewData( view ) ).to.equal( '[' +
			'<p class="ck-editor__editable ck-editor__nested-editable ck-placeholder ck-widget ck-widget_selected placeholder" ' +
			'contenteditable="true" data-placeholder="Placeholder!"></p>' +
			']' );
	} );

	it( 'multiline textfield', () => {
		setModelData( model, '<ck__container></ck__container>' );
		expect( getViewData( view ) ).to.equal( '[<div class="' + editableClasses + ' container" ' +
			'contenteditable="true"><p></p></div>]' );
	} );

	it( 'multiline textfield with content', () => {
		setModelData( model, '<ck__container><paragraph>Content</paragraph></ck__container>' );
		expect( getViewData( view ) ).to.equal( '[<div class="' + editableClasses + ' container" ' +
			'contenteditable="true"><p>Content</p></div>]' );
	} );

	it( 'multiline textfield with default text', () => {
		setModelData( model, '<ck__containerWithText></ck__containerWithText>' );
		expect( getViewData( view ) ).to.equal( '[<div class="' + editableClasses + ' container-with-text" ' +
			'contenteditable="true" data-placeholder="Text"><p>Text</p></div>]' );
	} );

	it( 'block element forced to container', () => {
		setModelData( model, '<ck__fakeContainer></ck__fakeContainer>' );
		expect( getViewData( view ) ).to.equal( '[<p class="' + editableClasses + ' fake-container" ' +
			'contenteditable="true"><p></p></p>]' );
	} );

	it( 'container element forced to block', () => {
		setModelData( model, '<ck__fakeBlock></ck__fakeBlock>' );
		expect( getViewData( view ) ).to.equal( '[<div class="' + editableClasses + ' fake-block" ' +
			'contenteditable="true"><p></p></div>]' );
	} );

	it( 'nested text element', () => {
		setModelData( model, '<ck__nested></ck__nested>' );
		expect( getViewData( view ) ).to.equal( '[<div class="ck-widget ck-widget_selected parent" contenteditable="false">' +
			'<p class="ck-editor__editable ck-editor__nested-editable simple" contenteditable="true"></p>' +
			'</div>]' );
	} );
} );
