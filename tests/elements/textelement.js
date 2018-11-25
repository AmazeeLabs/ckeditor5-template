import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import TextElement from '../../src/elements/textelement';

describe( 'MasterTemplate', () => {
	let editorElement, editor, model, view;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ TextElement, Paragraph ],
				templates: {
					simple: {
						label: 'Simple',
						template: '<div class="simple"><p ck-type="text"></p></div>',
					},
					placeholder: {
						label: 'Placeholder',
						template: '<div class="placeholder"><p ck-type="text">Placeholder!</p></div>',
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
			'<div class="ck-widget ck-widget_selected simple" contenteditable="false">' +
			'<p class="ck-editor__editable ck-editor__nested-editable ck-placeholder" contenteditable="true"></p>' +
			'</div>' +
			']' );
	} );

	it( 'simple text field with placeholder', () => {
		setModelData( model, '<ck__placeholder></ck__placeholder>' );
		expect( getViewData( view ) ).to.equal( '[' +
			'<div class="ck-widget ck-widget_selected simple" contenteditable="false">' +
			'<p class="ck-editor__editable ck-editor__nested-editable ck-placeholder" contenteditable="true"></p>' +
			'</div>' +
			']' );
	} );
} );
