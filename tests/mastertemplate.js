import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import MasterTemplate from '../src/mastertemplate';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

describe( 'MasterTemplate', () => {
	let editorElement, editor, model;
	const expected = '[<ck__master>' +
          '<ck__master__child0>' +
            '<ck__master__child0__child0></ck__master__child0__child0>' +
          '</ck__master__child0>' +
		'</ck__master>]';

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ MasterTemplate, Paragraph ],
				masterTemplate: 'master',
				templates: {
					master: {
						label: 'Master',
						template: '<div class="grandma"><div class="ma" data-foo=""><div class="me"></div></div></div>',
					},
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	afterEach( () => {
		editorElement.remove();
		return editor.destroy();
	} );

	it( 'should initiate a new document with the master template', () => {
		expect( getModelData( model ) ).to.equal( expected );
	} );

	it( 'should clean up existing content', () => {
		editor.setData( '<p>Test</p>' );
		expect( getModelData( model ) ).to.equal( expected );
	} );
} );
