import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import TemplateAttributeUI from '../../src/ui/templateattributeui';
import TemplateAttributeCommand from '../../src/commands/templateattributecommand';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';

describe( 'TemplateAttributeUI', () => {
	let editorElement, editor, model, view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ TemplateAttributeUI ],
				templates: {
					a: {
						label: 'No attributes',
						template: '<div class="a"></div>',
					},

					b: {
						label: 'Attributes',
						template: '<div class="b" text="" single="" multi=""></div>',
					},

					c: {
						label: 'Preselected',
						template: '<div class="c" text="a" single="b" multi="c"></div>',
					},
					d: {
						label: 'Different toolbar',
						template: '<div class="d" single="b" multi="c"></div>',
					}
				},
				templateAttributes: {
					text: {
						type: 'textfield',
						label: 'Textfield',
						placeholder: 'Placeholder',
					},
					single: {
						type: 'dropdown',
						label: 'Singleselect',
						options: {
							a: 'A',
							b: 'B',
							c: 'C',
						}
					},
					multi: {
						type: 'multiselect',
						label: 'Multiselect',
						options: {
							a: 'A',
							b: 'B',
							c: 'C',
						}
					},
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

	it( 'should be loaded', () => {
		expect( editor.plugins.get( TemplateAttributeUI ) ).to.instanceOf( TemplateAttributeUI );
	} );

	it( 'should create commands for each attribute', () => {
		expect( editor.commands.get( 'setTemplateAttribute:text' ) ).to.be.instanceOf( TemplateAttributeCommand );
		expect( editor.commands.get( 'setTemplateAttribute:single' ) ).to.be.instanceOf( TemplateAttributeCommand );
		expect( editor.commands.get( 'setTemplateAttribute:multi' ) ).to.be.instanceOf( TemplateAttributeCommand );
	} );

	it( 'should create input widgets for each attribute', () => {
		expect( editor.ui.componentFactory.create( 'templateAttribute:text' ) ).to.be.instanceOf( InputTextView );
		expect( editor.ui.componentFactory.create( 'templateAttribute:single' ) ).to.be.instanceOf( DropdownView );
		expect( editor.ui.componentFactory.create( 'templateAttribute:multi' ) ).to.be.instanceOf( DropdownView );
	} );

	describe( 'configure button', () => {
		it( 'is invisible by default', () => {
			setModelData( model, '[<ck__a></ck__a>]' );
			const button = editor.plugins.get( TemplateAttributeUI ).configureButton;
			expect( button.isVisible ).to.be.false;
		} );

		it( 'is visible for configurable elements', () => {
			setModelData( model, '[<ck__b></ck__b>]' );
			const button = editor.plugins.get( TemplateAttributeUI ).configureButton;
			expect( button.isVisible ).to.be.true;
		} );
	} );

	describe( 'execute()', () => {
		it( 'sets the model value', () => {
			setModelData( model, '[<ck__b></ck__b>]' );
			editor.execute( 'setTemplateAttribute:text', { value: 'abc' } );
			expect( getModelData( model ) ).to.equal( '[<ck__b text="abc"></ck__b>]' );
		} );
		it( 'data is reflected in the view', () => {
			setModelData( model, '[<ck__b></ck__b>]' );
			editor.execute( 'setTemplateAttribute:text', { value: 'abc' } );
			expect( getViewData( view ) ).to.equal(
				'[<div ck-icon="configurator" ck-label="Attributes" ck-name="b" class="b ck-widget ck-widget_selected" ' +
				'contenteditable="false" text="abc"></div>]'
			);
		} );
		it( 'data is reflected in the data', () => {
			setModelData( model, '[<ck__b></ck__b>]' );
			editor.execute( 'setTemplateAttribute:text', { value: 'abc' } );
			expect( editor.getData() ).to.equal( '<div class="b" text="abc">&nbsp;</div>' );
		} );
	} );
} );
