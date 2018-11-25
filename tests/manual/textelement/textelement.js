/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EnterPlugin from '@ckeditor/ckeditor5-enter/src/enter';
import TypingPlugin from '@ckeditor/ckeditor5-typing/src/typing';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import TemplatePlugin from '../../../src/template';
import UndoPlugin from '@ckeditor/ckeditor5-undo/src/undo';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ EnterPlugin, TypingPlugin, ParagraphPlugin, HeadingPlugin, TemplatePlugin, UndoPlugin ],
		toolbar: [ 'heading', '|', 'template', '|', 'undo', 'redo' ],
		templates: {
			simple: {
				label: 'Simple',
				template: '<div class="simple"><p ck-type="text">Simple text widget</p></div>',
			},
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
