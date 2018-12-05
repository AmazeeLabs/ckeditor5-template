import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import MoveTemplateUI from '../../src/ui/containerui';

describe( 'ContainerUI', () => {
	let editorElement, editor, upButton, downButton, model;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ MoveTemplateUI, Paragraph ],
				templates: {
					a: {
						label: 'A',
						template: '<p class="a"></p>',
					},
					b: {
						label: 'B',
						template: '<div class="b"></div>',
					},
					container: {
						label: 'Container',
						template: '<div class="container" ck-type="container" ck-contains="a b"></div>',
					},
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				upButton = editor.plugins.get( MoveTemplateUI ).upButton;
				downButton = editor.plugins.get( MoveTemplateUI ).downButton;
			} );
	} );

	afterEach( () => {
		editorElement.remove();
		return editor.destroy();
	} );

	it( 'is invisible if no container element is selected', () => {
		setModelData( model, '[<ck__a></ck__a>]' );
		expect( upButton.isVisible ).to.be.false;
		expect( downButton.isVisible ).to.be.false;
	} );

	it( 'is visible if a container element is selected', () => {
		setModelData( model, '<ck__container>[<ck__a></ck__a>]</ck__container>' );
		expect( upButton.isVisible ).to.be.true;
		expect( downButton.isVisible ).to.be.true;
	} );

	it( '"up" and "down" are disabled if the only element is selected', () => {
		setModelData( model, '<ck__container>[<ck__a></ck__a>]</ck__container>' );
		expect( upButton.isEnabled ).to.be.false;
		expect( downButton.isEnabled ).to.be.false;
	} );

	it( 'prevents the first element from going up', () => {
		setModelData( model, '<ck__container>[<ck__a></ck__a>]<ck__a></ck__a></ck__container>' );
		expect( upButton.isEnabled ).to.be.false;
		expect( downButton.isEnabled ).to.be.true;
	} );

	it( 'prevents the last element from going down', () => {
		setModelData( model, '<ck__container><ck__a></ck__a>[<ck__a></ck__a>]</ck__container>' );
		expect( upButton.isEnabled ).to.be.true;
		expect( downButton.isEnabled ).to.be.false;
	} );

	it( 'executes the up command', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );
		upButton.fire( 'execute' );
		sinon.assert.calledOnce( executeSpy );
		sinon.assert.calledWithExactly( executeSpy, 'moveTemplateUp' );
	} );

	it( 'executes the down command', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );
		downButton.fire( 'execute' );
		sinon.assert.calledOnce( executeSpy );
		sinon.assert.calledWithExactly( executeSpy, 'moveTemplateDown' );
	} );
} );
