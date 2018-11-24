import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import Template from '../src/template';
import TemplateUI from '../src/templateui';
import TemplateEditing from '../src/templateediting';

describe( 'Template', () => {
	let editorElement, editor;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Template ],
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		editorElement.remove();
		return editor.destroy();
	} );

	it( 'should load dependencies', () => {
		expect( editor.plugins.get( TemplateEditing ) ).to.instanceOf( TemplateEditing );
		expect( editor.plugins.get( TemplateUI ) ).to.instanceOf( TemplateUI );
	} );
} );
