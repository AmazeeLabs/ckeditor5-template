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
				template: '<div class="a">A</div>',
			},
			b: {
				label: 'B',
				template: '<div class="b">B</div>',
			},
			gallery: {
				label: 'Gallery',
				template: '<div class="gallery" ck-type="gallery" ck-contains="a b"></div>',
			},
			gallerysingle: {
				label: 'Gallery Single',
				template: '<div class="gallery" ck-type="gallery" ck-contains="a"></div>',
			},
		},
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
