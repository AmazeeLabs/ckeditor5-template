import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Templateediting from '../src/templateediting';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TemplateUI from '../src/templateui';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';

describe( 'TemplateUI', () => {
	let editorElement, editor;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Templateediting, TemplateUI, Paragraph ],
				templates: {
					a: {
						label: 'Simple',
						template: '<div class="a"></div>',
					},
					b: {
						label: 'Nested',
						template: '<div class="b"><div class="c"></div></div>',
					},
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				// Set data so the commands will be enabled.
				setModelData( editor.model, '<paragraph>f{}oo</paragraph>' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();
		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( TemplateUI ) ).to.instanceOf( TemplateUI );
	} );

	it( 'register options for each template', () => {
		const dropdown = editor.ui.componentFactory.create( 'template' );
		expect( dropdown ).to.be.instanceof( DropdownView );
		expect( dropdown.buttonView.isEnabled ).to.be.true;
		expect( dropdown.buttonView.label ).to.equal( 'Choose template ...' );
		expect( dropdown.buttonView.tooltip ).to.equal( 'Insert a template.' );
	} );

	it( 'should execute the template command', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );
		const dropdown = editor.ui.componentFactory.create( 'template' );

		dropdown.commandName = 'template';
		dropdown.commandValue = 'ck__a';
		dropdown.fire( 'execute' );

		sinon.assert.calledOnce( executeSpy );
		sinon.assert.calledWithExactly( executeSpy, 'template', { value: 'ck__a' } );
	} );

	it( 'should be enabled based on the command status', () => {
		const command = editor.commands.get( 'template' );
		const dropdown = editor.ui.componentFactory.create( 'template' );

		command.isEnabled = false;
		expect( dropdown.buttonView.isEnabled ).to.be.false;

		command.isEnabled = true;
		expect( dropdown.buttonView.isEnabled ).to.be.true;

	} );
} );
