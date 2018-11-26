/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EnterPlugin from '@ckeditor/ckeditor5-enter/src/enter';
import TypingPlugin from '@ckeditor/ckeditor5-typing/src/typing';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import UndoPlugin from '@ckeditor/ckeditor5-undo/src/undo';

import TemplatePlugin from '../../../src/template';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ EnterPlugin, TypingPlugin, ParagraphPlugin, HeadingPlugin, TemplatePlugin, UndoPlugin ],
		toolbar: [ 'heading', '|', 'template', '|', 'undo', 'redo' ],
		templates: {
			simple: {
				label: 'Simple',
				template: '<p class="simple" ck-type="text"></p>',
			},
			placeholder: {
				label: 'Placeholder',
				template: '<p class="placeholder" ck-type="text">Placeholder!</p>',
			},
			container: {
				label: 'Container',
				template: '<div class="container" ck-type="text">Tralala</div>'
			},
			fakeContainer: {
				label: 'Fake Container',
				template: '<p class="fake-container" ck-type="text" ck-multiline="true"></p>'
			},
			fakeBlock: {
				label: 'Fake Block',
				template: '<div class="fake-block" ck-type="text" ck-multiline="false"></div>'
			},
			nested: {
				label: 'Nested',
				template: '<div class="parent"><p class="simple" ck-type="text"></p></div>'
			}
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
