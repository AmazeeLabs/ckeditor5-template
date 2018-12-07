/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EnterPlugin from '@ckeditor/ckeditor5-enter/src/enter';
import TypingPlugin from '@ckeditor/ckeditor5-typing/src/typing';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import UndoPlugin from '@ckeditor/ckeditor5-undo/src/undo';

import TextLimit from '../../../src/textlimit';
import TemplateUI from '../../../src/ui/templateui';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ EnterPlugin, TypingPlugin, ParagraphPlugin, HeadingPlugin, TextLimit, TemplateUI, UndoPlugin ],
		toolbar: [ 'heading', '|', 'template', '|', 'undo', 'redo' ],
		templates: {
			text: {
				label: 'text',
				template: '<p class="simple" ck-type="text" ck-limit="3">Limited</p>',
			}
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
