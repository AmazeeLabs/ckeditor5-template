import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { setData as setViewData, getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';


import List from '@ckeditor/ckeditor5-list/src/list';

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
				plugins: [ List, TextElement, Paragraph ],
				templates: {
					simple: {
						label: 'Simple',
						template: '<div class="simple" itemprop="content" ck-input="basic"></div>',
					},
					placeholder: {
						label: 'Placeholder',
						template: '<div class="placeholder" ck-input="basic">Placeholder!</div>',
					},
					container: {
						label: 'Container',
						template: '<div class="container" ck-input="full"></div>'
					},
					containerWithText: {
						label: 'Container with text',
						template: '<div class="container-with-text" ck-input="full">Text</div>'
					},
					nested: {
						label: 'Nested',
						template: '<div class="parent"><p class="simple" ck-input="basic"></p></div>'
					},
					sectiona: {
						label: 'Section A',
						template: '<div class="sectiona"><div class="container-with-text-a" ck-input="full">Text</div></div>'
					},
					sectionb: {
						label: 'Section B',
						template: '<div class="sectionb"><div class="container-with-text-b" ck-input="full">Text</div></div>'
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
			'<div class="' + editableClasses + ' simple" contenteditable="true" itemprop="content"></div>' +
			']' );
	} );

	it( 'simple text field with content', () => {
		setModelData( model, '<ck__simple>F[o]o</ck__simple>' );
		expect( getViewData( view ) ).to.equal(
			'<div class="ck-editor__editable ck-editor__nested-editable ck-widget simple" contenteditable="true" itemprop="content">F{o}o</div>'
		);
	} );

	it( 'simple text field with placeholder', () => {
		setModelData( model, '<ck__placeholder></ck__placeholder>' );
		expect( getViewData( view ) ).to.equal( '[' +
			'<div class="ck-editor__editable ck-editor__nested-editable ck-placeholder ck-widget ck-widget_selected placeholder" ' +
			'contenteditable="true" data-placeholder="Placeholder!"></div>' +
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

	it( 'nested text element', () => {
		setModelData( model, '<ck__nested></ck__nested>' );
		expect( getViewData( view ) ).to.equal( '[<div ck-icon="configurator" ck-label="Nested" ck-name="nested" class="ck-widget ck-widget_selected parent" contenteditable="false">' +
			'<p class="ck-editor__editable ck-editor__nested-editable simple" contenteditable="true"></p>' +
			'</div>]' );
	} );

	it( 'nested text element with content', () => {
		setModelData( model, '<ck__nested><ck__nested__child0>F[o]o</ck__nested__child0></ck__nested>' );
		expect( getViewData( view ) ).to.equal( '<div ck-icon="configurator" ck-label="Nested" ck-name="nested" class="ck-widget parent" contenteditable="false">' +
			'<p class="ck-editor__editable ck-editor__nested-editable simple" contenteditable="true">F{o}o</p>' +
			'</div>' );
	} );

	it( 'do not merge two sections with a list inside', () => {
		setModelData( model, '<ck__sectiona><ck__sectiona__child0>' +
				'<listItem listIndent="0" listType="bulleted">dsafasdfasdf</listItem>' +
				'<listItem listIndent="0" listType="bulleted">asdfasdfasdf</listItem>' +
			'</ck__sectiona__child0></ck__sectiona>' +
			'<ck__sectionb><ck__sectionb__child0>' +
			'<listItem listIndent="0" listType="bulleted">dsafasdfasdf</listItem>' +
			'<listItem listIndent="0" listType="bulleted">asdfasdfasdf</listItem>' +
			'</ck__sectionb__child0></ck__sectionb>' );

		console.log(getViewData( view ));
	} );
} );
