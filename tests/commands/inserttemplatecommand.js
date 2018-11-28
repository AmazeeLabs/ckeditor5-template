import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { downcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';

import InsertTemplateCommand from '../../src/commands/inserttemplatecommand';
import TemplateEditing from '../../src/templateediting';

describe( 'InsertTemplateCommand', () => {
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
						template: '<div class="test"></div>',
					}
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new InsertTemplateCommand( editor );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be true when the selection directly in the root', () => {
			model.enqueueChange( 'transparent', () => {
				setModelData( model, '[]' );

				command.refresh();
				expect( command.isEnabled ).to.be.true;
			} );
		} );

		it( 'should be true when the selection is in empty block', () => {
			setModelData( model, '<paragraph>[]</paragraph>' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true when the selection directly in a paragraph', () => {
			setModelData( model, '<paragraph>foo[]</paragraph>' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true when the selection directly in a block', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block' } );
			model.schema.extend( '$text', { allowIn: 'block' } );
			editor.conversion.for( 'downcast' ).add( downcastElementToElement( { model: 'block', view: 'block' } ) );

			setModelData( model, '<block>foo[]</block>' );
			expect( command.isEnabled ).to.be.true;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should insert template at selection position as other widgets', () => {
			setModelData( model, '<paragraph>f[o]o</paragraph>' );

			command.execute( { value: 'ck__test' } );

			expect( getModelData( model ) )
				.to.equal( '[<ck__test></ck__test>]<paragraph>foo</paragraph>' );
		} );

		it( 'should use parent batch', () => {
			setModelData( model, '<paragraph>[]foo</paragraph>' );

			model.change( writer => {
				expect( writer.batch.operations ).to.length( 0 );

				command.execute( { value: 'ck__test' } );

				expect( writer.batch.operations ).to.length.above( 0 );
			} );
		} );
	} );
} );
