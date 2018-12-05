import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TextElement from '../../src/elements/textelement';
import ContainerElement from '../../src/elements/containerelement';
import MoveTemplateUpCommand from '../../src/commands/movetemplateupcommand';
import MoveTemplateDownCommand from '../../src/commands/movetemplatedowncommand';

describe( 'ContainerMovementCommands', () => {
	let editorElement, editor, up, down, model;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );
		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ TextElement, ContainerElement, Paragraph ],
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
				up = new MoveTemplateUpCommand( editor );
				down = new MoveTemplateDownCommand( editor );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isApplicable', () => {
		it( 'is applicable if a container item is selected', () => {
			setModelData( model, [
				'<ck__container>',
				'[<ck__a></ck__a>]',
				'</ck__container>',
			].join( '' ) );
			up.refresh();
			down.refresh();
			expect( up.isApplicable ).to.be.true;
			expect( down.isApplicable ).to.be.true;
		} );

		it( 'is not applicable if no container item is selected', () => {
			setModelData( model, [
				'[<ck__a></ck__a>]',
			].join( '' ) );
			expect( up.isApplicable ).to.be.false;
			expect( down.isApplicable ).to.be.false;
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'up enabled if non-first item is selected', () => {
			setModelData( model, [
				'<ck__container>',
				'<ck__a></ck__a>',
				'[<ck__a></ck__a>]',
				'</ck__container>',
			].join( '' ) );
			up.refresh();
			expect( up.isEnabled ).to.be.true;
		} );

		it( 'up disabled if first item is selected', () => {
			setModelData( model, [
				'<ck__container>[<ck__a></ck__a>]<ck__a></ck__a></ck__container>',
			].join( '' ) );
			up.refresh();
			expect( up.isEnabled ).to.be.false;
		} );

		it( 'down enabled if non-last item is selected', () => {
			setModelData( model, [
				'<ck__container>[<ck__a></ck__a>]<ck__a></ck__a></ck__container>',
			].join( '' ) );
			down.refresh();
			expect( down.isEnabled ).to.be.true;
		} );

		it( 'down disabled if last item is selected', () => {
			setModelData( model, [
				'<ck__container><ck__a></ck__a>[<ck__a></ck__a>]</ck__container>',
			].join( '' ) );
			down.refresh();
			expect( down.isEnabled ).to.be.false;
		} );

		it( 'both are disabled if a placeholder is selected', () => {
			setModelData( model, [
				'<ck__container>[<ck__a></ck__a>]</ck__container>',
			].join( '' ) );
			down.refresh();
			up.refresh();
			expect( down.isEnabled ).to.be.false;
			expect( up.isEnabled ).to.be.false;
		} );

		it( 'both are enabled for a middle item', () => {
			setModelData( model, [
				'<ck__container><ck__a></ck__a>[<ck__a></ck__a>]<ck__a></ck__a></ck__container>',
			].join( '' ) );
			down.refresh();
			up.refresh();
			expect( down.isEnabled ).to.be.true;
			expect( up.isEnabled ).to.be.true;
		} );
	} );

	describe( 'execute()', () => {
		it( 'moves elements up', () => {
			setModelData( model, [
				'<ck__container><ck__a></ck__a>[<ck__b></ck__b>]</ck__container>',
			].join( '' ) );
			up.execute();
			expect( getModelData( model ) ).to.equal( [
				'<ck__container>',
				'<ck__container__placeholder></ck__container__placeholder>',
				'[<ck__b></ck__b>]',
				'<ck__container__placeholder></ck__container__placeholder>',
				'<ck__a></ck__a>',
				'<ck__container__placeholder></ck__container__placeholder>',
				'</ck__container>',
			].join( '' ) );
		} );

		it( 'moves elements down', () => {
			setModelData( model, [
				'<ck__container>[<ck__a></ck__a>]<ck__b></ck__b></ck__container>',
			].join( '' ) );
			down.execute();
			expect( getModelData( model ) ).to.equal( [
				'<ck__container>',
				'<ck__container__placeholder></ck__container__placeholder>',
				'<ck__b></ck__b>',
				'<ck__container__placeholder></ck__container__placeholder>',
				'[<ck__a></ck__a>]',
				'<ck__container__placeholder></ck__container__placeholder>',
				'</ck__container>',
			].join( '' ) );
		} );
	} );
} );
