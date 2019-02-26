import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import GalleryElement from '../../src/elements/galleryelement';
import AddItemCommand from '../../src/commands/additemcommand';
import SetCurrentItemCommand from '../../src/commands/setcurrentitemcommand';

describe( 'AddItemCommand', () => {
	let editorElement, editor, command, model, view, setItemCommand;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );
		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ GalleryElement, Paragraph ],
				templates: {
					a: {
						label: 'A',
						template: '<div class="a"></div>',
					},
					gallery: {
						label: 'Gallery',
						template: '<div class="gallery" ck-type="gallery" ck-contains="a"></div>',
					},
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				view = editor.editing.view;
				command = new AddItemCommand( editor );
				setItemCommand = new SetCurrentItemCommand( editor );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'enabled if a gallery is selected', () => {
			setModelData( model, '[<ck__gallery><ck__a></ck__a></ck__gallery>]' );
			command.refresh();
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'enabled a gallery item is selected', () => {
			setModelData( model, '<ck__gallery>[<ck__a></ck__a>]</ck__gallery>' );
			command.refresh();
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'disabled if anything else is selected', () => {
			setModelData( model, '[<paragraph></paragraph>]' );
			command.refresh();
			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'adds a new placeholder at the end and focuses it', () => {
			setModelData( model, '<ck__gallery>[<ck__a></ck__a>]</ck__gallery>' );
			command.execute();
			setItemCommand.refresh();
			expect( setItemCommand.currentItem ).to.equal( 1 );
			expect( setItemCommand.itemCount ).to.equal( 2 );
			expect( getViewData( view ) ).to.equal( [
				'<ck-gallery ck-gallery-current-item="1" class="ck-widget gallery" contenteditable="false" section="a">',
				'<div class="a ck-widget" contenteditable="false"></div>',
				'[<div class="a ck-widget ck-widget_selected" contenteditable="false"></div>]',
				'</ck-gallery>',
			].join( '' ) );
		} );
	} );
} );
