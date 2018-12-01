import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import RemoveTemplateUi from '../../src/ui/removetemplateui';

describe( 'RemoveTemplateUI', () => {
	let editorElement, editor, removeButton, model;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ RemoveTemplateUi, Paragraph ],
				templates: {
					test: {
						label: 'Test',
						template: '<div class="test"></div>',
					},
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				removeButton = editor.plugins.get( RemoveTemplateUi ).removeButton;
			} );
	} );

	afterEach( () => {
		editorElement.remove();
		return editor.destroy();
	} );

	it( 'is invisible if no template is selected', () => {
		setModelData( model, '<paragraph>[]</paragraph>' );
		expect( removeButton.isVisible ).to.be.false;
	} );

	it( 'is visible if a template is selected', () => {
		setModelData( model, '[<ck__test></ck__test>]' );
		expect( removeButton.isVisible ).to.be.true;
	} );

	it( 'has a label computed from the currently selected element', () => {
		setModelData( model, '[<ck__test></ck__test>]' );
		expect( removeButton.label ).to.equal( 'Remove Test' );
	} );

	it( 'executes the remove command', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );
		removeButton.fire( 'execute' );
		sinon.assert.calledOnce( executeSpy );
		sinon.assert.calledWithExactly( executeSpy, 'removeTemplate' );
	} );
} );
