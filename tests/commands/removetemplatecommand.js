import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TextElement from '../../src/elements/textelement';
import RemoveTemplateCommand from '../../src/commands/removetemplatecommand';
import PlaceholderElement from '../../src/elements/placeholderelement';
import ContainerElement from '../../src/elements/containerelement';

describe( 'RemoveTemplateCommand', () => {
	let editorElement, editor, command, model;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );
		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ TextElement, PlaceholderElement, ContainerElement, Paragraph ],
				templates: {
					a: {
						label: 'A',
						template: '<p class="a" ck-type="text"></p>',
					},
					b: {
						label: 'B',
						template: '<div class="b"></div>',
					},
					container: {
						label: 'Container',
						template: '<div class="container" ck-type="container" ck-contains="a b"></div>',
					},
					fixed: {
						label: 'Fixed',
						template: '<div class="fixed"><div class="content" ck-type="placeholder" ck-conversions="a b"></div></div>',
					},
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new RemoveTemplateCommand( editor );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'enabled if a convertible template is selected', () => {
			setModelData( model, '[<ck__a></ck__a>]' );
			command.refresh();
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'enabled if cursor is within a convertible template', () => {
			setModelData( model, '<ck__a>F[o]o</ck__a>' );
			command.refresh();
			expect( command.isEnabled ).to.be.true;
		} );
	} );

	describe( 'execute()', () => {
		it( 'removes the selected template', () => {
			setModelData( model, '[<ck__a></ck__a>]' );
			command.execute();
			expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
		} );

		it( 'removes the current host template', () => {
			setModelData( model, '<ck__a>F[o]o</ck__a>' );
			command.execute();
			expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
		} );

		it( 'reverts to a placeholder in a fixed position', () => {
			setModelData( model, '<ck__fixed>[<ck__a></ck__a>]</ck__fixed>' );
			command.execute();
			expect( getModelData( model ) ).to.equal( [
				'[<ck__fixed><ck__fixed__child0></ck__fixed__child0></ck__fixed>]'
			].join( '' ) );
		} );

		it( 'removes a container item', () => {
			setModelData( model, '<ck__container>[<ck__a></ck__a>]<ck__a></ck__a></ck__container>' );
			command.execute();
			expect( getModelData( model ) ).to.equal( [
				'<ck__container>',
				'[<ck__a></ck__a>]',
				'</ck__container>',
			].join( '' ) );
		} );

		it( 'removes the last container item', () => {
			setModelData( model, '<ck__container>[<ck__a></ck__a>]</ck__container>' );
			command.execute();
			expect( getModelData( model ) ).to.equal( [
				'[<ck__container>',
				'</ck__container>]',
			].join( '' ) );
		} );
	} );
} );
