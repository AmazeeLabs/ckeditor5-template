import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TemplateEditing from '../../src/templateediting';
import TemplateAttributeCommand from '../../src/commands/templateattributecommand';

describe( 'TemplateAttributeCommand', () => {
	let editorElement, editor, command, model;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );
		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ TemplateEditing, Paragraph ],
				templates: {
					test: {
						label: 'Test',
						template: '<div class="test" test="a"></div>',
					}
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new TemplateAttributeCommand( editor, 'test' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be true if a template with this attribute is selected', () => {
			setModelData( model, '[<ck__test></ck__test>]' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false if something else is selected', () => {
			setModelData( model, '[<paragraph></paragraph>]' );
			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'value', () => {
		it( 'reflects the current elements value', () => {
			setModelData( model, '[<ck__test test="foo"></ck__test>]' );
			expect( command.value ).to.equal( 'foo' );
		} );
	} );

	describe( 'execute()', () => {
		it( 'sets the model and command value', () => {
			setModelData( model, '[<ck__test test="foo"></ck__test>]' );
			command.execute( { value: 'bar' } );
			expect( command.value ).to.equal( 'bar' );
			expect( getModelData( model ) ).to.equal( '[<ck__test test="bar"></ck__test>]' );
		} );
	} );
} );
