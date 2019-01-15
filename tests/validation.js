import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import Validation from '../src/validation';
import TemplateEditing from '../src/templateediting';
import ContainerElement from '../src/elements/containerelement';

describe( 'Validation', () => {
	let editorElement, editor, model, tooltipView;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Validation, TemplateEditing, ContainerElement ],
				masterTemplate: 'master',
				templateSession: 'a',
				templates: {
					a: {
						label: 'A',
						template: '<div class="a" ck-min="2"></div>',
						validation: /./gm
					},
					b: {
						template: '<div class="b"></div>',
					},
					container: {
						template: '<div class="container" ck-min="1" ck-type="container" ck-contains="a b" itemprop="container"></div>',
						validation: /class="[b,a]/gm
					}
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				tooltipView = editor.plugins.get( Validation ).tooltipView;
			} );
	} );

	afterEach( () => {
		editorElement.remove();
		return editor.destroy();
	} );

	it( 'shows tooltip with validation error', () => {
		setModelData( model, [
			'<ck__a></ck__a>',
		].join( '' ) );
		expect( tooltipView.isVisible ).to.be.true;
	} );

	it( 'doesn\'t shows tooltip with validation error', () => {
		setModelData( model, [
			'<ck__b></ck__b>',
		].join( '' ) );
		expect( tooltipView.isVisible ).to.be.false;
	} );

	it( 'shows tooltip with validation error and hide it after input', () => {
		setModelData( model, [
			'<ck__a></ck__a>',
		].join( '' ) );

		expect( tooltipView.isVisible ).to.be.true;

		setModelData( model, [
			'<ck__a>some text</ck__a>',
		].join( '' ) );

		expect( tooltipView.isVisible ).to.be.false;
	} );

	it( 'shows and hides tooltip for containers', () => {
		setModelData( model, [
			'<ck__container></ck__container>',
		].join( '' ) );

		expect( tooltipView.isVisible ).to.be.true;

		setModelData( model, [
			'<ck__container>',
			'<ck__a></ck__a>',
			'<ck__b></ck__b>',
			'</ck__container>',
		].join( '' ) );

		expect( tooltipView.isVisible ).to.be.false;

		setModelData( model, [
			'<ck__container>',
			'<ck__a>some content</ck__a>',
			'</ck__container>',
		].join( '' ) );

		expect( tooltipView.isVisible ).to.be.false;
	} );
} );
