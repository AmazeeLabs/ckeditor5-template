/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EnterPlugin from '@ckeditor/ckeditor5-enter/src/enter';
import TypingPlugin from '@ckeditor/ckeditor5-typing/src/typing';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import UndoPlugin from '@ckeditor/ckeditor5-undo/src/undo';

import Validation from '../../../src/validation';
import TemplatePlugin from '../../../src/template';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ EnterPlugin, TypingPlugin, ParagraphPlugin, HeadingPlugin, TemplatePlugin, UndoPlugin, Validation ],
		toolbar: [ 'heading', '|', 'template', '|', 'undo', 'redo' ],
		templates: {
			text: {
				label: 'text',
				template: '<p class="simple" ck-type="text" ck-min="2">Limited</p>',
				validation: /./gm
			},
			textrequired: {
				label: 'text required',
				template: '<p class="simple" ck-type="text">Limited</p>',
			},
			container: {
				label: 'Container',
				template: `<div class="wrapper">
							<div class="container" ck-type="container" ck-contains="text textrequired" ck-min="1"></div>
						</div>`,
				validation: /p class="simple/,
			},
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
