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
			a: {
				label: 'A',
				template: '<p class="a" ck-type="text">A</p>',
			},
			b: {
				label: 'B',
				template: '<p class="b" ck-type="text">B</p>',
			},
			container: {
				label: 'Container',
				template: '<div class="wrapper"><div class="container" ck-type="container" ck-contains="a b"></div></div>',
			},
			containersingle: {
				label: 'Container Single',
				template: '<div class="wrapper"><div class="container" ck-type="container" ck-contains="b"></div></div>',
			},
			placeholder: {
				label: 'Placeholder',
				template: '<div class="placeholder" ck-type="placeholder" ck-conversions="a b"></div>',
			},
		},
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
