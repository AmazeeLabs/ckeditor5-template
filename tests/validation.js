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
						template: '<div class="a" ck-validation="." ck-min="1"></div>',
					},
					b: {
						template: '<div class="b"></div>',
					},
					c: {
						template: '<div class="c" ck-validation="." ck-max="5"></div>'
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

	it( 'doesn\'t show tooltip with validation error', () => {
		setModelData( model, [
			'<ck__b></ck__b>',
		].join( '' ) );
		expect( tooltipView.isVisible ).to.be.false;
	} );

	it( 'shows tooltip with validation error and hides it after input', () => {
		setModelData( model, [
			'<ck__a></ck__a>',
		].join( '' ) );

		expect( tooltipView.isVisible ).to.be.true;

		setModelData( model, [
			'<ck__a>some text</ck__a>',
		].join( '' ) );

		expect( tooltipView.isVisible ).to.be.false;
	} );

	it( 'shows tooltip with validation error for max attribute and hides it', () => {
		setModelData( model, [
			'<ck__c>testtestest</ck__c>',
		].join( '' ) );

		expect( tooltipView.isVisible ).to.be.true;
		expect( tooltipView.text ).to.equal( 'Too long: please remove at least 6 letters.' );

		setModelData( model, [
			'<ck__c></ck__c>',
		].join( '' ) );

		expect( tooltipView.isVisible ).to.be.false;
	} );
} );
