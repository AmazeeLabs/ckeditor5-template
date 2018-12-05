import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import ContainerElement from '../../src/elements/containerelement';
import ReplaceTemplateCommand from '../../src/commands/replacetemplatecommand';

describe( 'Container', () => {
	let editorElement, editor, model, view;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ ContainerElement ],
				templates: {
					a: {
						label: 'A',
						template: '<div class="a"></div>',
					},
					b: {
						label: 'B',
						template: '<div class="b"></div>',
					},
					container: {
						label: 'Container',
						template: '<div class="container" ck-type="container" ck-contains="a b"></div>',
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

	it( 'is pre-filled with at least one placeholder', () => {
		setModelData( model, '<ck__container></ck__container>' );
		expect( getModelData( model ) ).to.equal( [ '[',
			'<ck__container>',
			'<ck__container__placeholder></ck__container__placeholder>',
			'</ck__container>',
			']' ].join( '' ) );
	} );

	it( 'removes double placeholders', () => {
		setModelData( model, [
			'<ck__container>',
			'<ck__container__placeholder></ck__container__placeholder>',
			'<ck__container__placeholder></ck__container__placeholder>',
			'</ck__container>'
		].join( '' ) );
		expect( getModelData( model ) ).to.equal( [ '[',
			'<ck__container>',
			'<ck__container__placeholder></ck__container__placeholder>',
			'</ck__container>',
			']' ].join( '' ) );
	} );

	it( 'wraps elements in placeholders', () => {
		setModelData( model, [
			'<ck__container>',
			'<ck__a></ck__a>',
			'</ck__container>'
		].join( '' ) );
		expect( getModelData( model ) ).to.equal( [ '[',
			'<ck__container>',
			'<ck__container__placeholder></ck__container__placeholder>',
			'<ck__a></ck__a>',
			'<ck__container__placeholder></ck__container__placeholder>',
			'</ck__container>',
			']' ].join( '' ) );
	} );

	it( 'puts placeholders between each element', () => {
		setModelData( model, [
			'<ck__container>',
			'<ck__a></ck__a>',
			'<ck__a></ck__a>',
			'<ck__a></ck__a>',
			'</ck__container>'
		].join( '' ) );
		expect( getModelData( model ) ).to.equal( [ '[',
			'<ck__container>',
			'<ck__container__placeholder></ck__container__placeholder>',
			'<ck__a></ck__a>',
			'<ck__container__placeholder></ck__container__placeholder>',
			'<ck__a></ck__a>',
			'<ck__container__placeholder></ck__container__placeholder>',
			'<ck__a></ck__a>',
			'<ck__container__placeholder></ck__container__placeholder>',
			'</ck__container>',
			']' ].join( '' ) );
	} );

	it( 'allows to select placeholders', () => {
		setModelData( model, [
			'<ck__container>',
			'[<ck__container__placeholder></ck__container__placeholder>]',
			'</ck__container>'
		].join( '' ) );

		expect( getModelData( model ) ).to.equal( [
			'<ck__container>',
			'[<ck__container__placeholder></ck__container__placeholder>]',
			'</ck__container>',
		].join( '' ) );

		expect( getViewData( view ) ).to.equal( [
			'<div class="ck-widget container" contenteditable="false">',
			'[<div class=" ck-widget ck-widget_selected" contenteditable="false">',
			'<div class="ck-placeholder-ui"></div>',
			'</div>]',
			'</div>',
		].join( '' ) );

		expect( model.document.selection.getSelectedElement().name ).to.equal( 'ck__container__placeholder' );
	} );

	it( 'allows to insert elements at a placeholder position', () => {
		const command = new ReplaceTemplateCommand( editor );

		setModelData( model, [
			'<ck__container>',
			'[<ck__container__placeholder></ck__container__placeholder>]',
			'</ck__container>'
		].join( '' ) );

		expect( command.isEnabled ).to.be.true;
		command.execute( { template: 'ck__a' } );

		expect( getModelData( model ) ).to.equal( [
			'<ck__container>',
			'<ck__container__placeholder></ck__container__placeholder>',
			'[<ck__a></ck__a>]',
			'<ck__container__placeholder></ck__container__placeholder>',
			'</ck__container>',
		].join( '' ) );
	} );
} );
