import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import ReplaceTemplateCommand from '../../src/commands/replacetemplatecommand';
import TextElement from '../../src/elements/textelement';

describe( 'ReplaceTemplateCommand', () => {
	let editorElement, editor, command, model;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );
		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ TextElement, Paragraph ],
				templates: {
					a: {
						label: 'A',
						template: '<div class="A"></div>',
					},
					b: {
						label: 'B',
						template: '<div class="b" ck-conversions="a"></div>',
					},
					c: {
						label: 'C',
						template: '<div class="c"><div class="d" ck-type="placeholder" ck-conversions="a"></div></div>',
					},
					d: {
						label: 'D',
						template: '<div class="d" ck-conversions="a e"><p class="content" ck-type="text"></p></div>',
					},
					e: {
						label: 'E',
						template: '<div class="e"><p class="content" ck-type="text"></p></div>',
					},
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new ReplaceTemplateCommand( editor );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'enabled if a convertible template is selected', () => {
			setModelData( model, '[<ck__b></ck__b>]' );
			command.refresh();
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'enabled if cursor is within a convertible template', () => {
			setModelData( model, '<ck__d><ck__d__child0>F[o]o</ck__d__child0></ck__d>' );
			command.refresh();
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'disabled if an inconvertible template is selected', () => {
			setModelData( model, '[<ck__a></ck__a>]' );
			command.refresh();
			expect( command.isEnabled ).to.be.false;
		} );

		it( 'disabled if cursor is within an inconvertible template', () => {
			setModelData( model, '<ck__e><ck__e__child0>F[o]o</ck__e__child0></ck__e>' );
			command.refresh();
			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'replaces the selected element', () => {
			setModelData( model, '[<ck__b></ck__b>]' );
			command.execute( { template: 'ck__a' } );
			expect( getModelData( model ) ).to.equal( '[<ck__a></ck__a>]' );
		} );

		// TODO: Implement intelligent replacements.
		// To make this work, we would have to track equivalent elements across templates.
		// it( 'replaces the element with the anchor inside and takes over data if possible', () => {
		// 	setModelData( model, '<ck__d><ck__d__child0>F[o]o</ck__d__child0></ck__d>' );
		// 	command.execute( { template: 'ck__e' } );
		// 	expect( getModelData( model ) ).to.equal( '[<ck__e><ck__e__child0>F[o]o</ck__e__child0></ck__e>]' );
		// } );
	} );
} );
