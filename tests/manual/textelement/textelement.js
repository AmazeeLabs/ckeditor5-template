/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EnterPlugin from '@ckeditor/ckeditor5-enter/src/enter';
import TypingPlugin from '@ckeditor/ckeditor5-typing/src/typing';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import UndoPlugin from '@ckeditor/ckeditor5-undo/src/undo';

import TemplatePlugin from '../../../src/template';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ EnterPlugin, TypingPlugin, ParagraphPlugin, HeadingPlugin, TemplatePlugin, UndoPlugin, Bold ],
		toolbar: [ 'heading', '|', 'template', '|', 'undo', 'redo', 'bold' ],
		templates: {
			simple: {
				label: 'Simple',
				template: '<p class="simple" ck-input="plain"></p>',
			},
			simple_placeholder: {
				label: 'Simple placeholder',
				template: '<p class="placeholder" ck-input="plain">Placeholder</p>',
			},
			basic: {
				label: 'Basic',
				template: '<div class="basic" ck-input="basic"></div>'
			},
			basic_placeholder: {
				label: 'Basic placeholder',
				template: '<div class="basic-placeholder" ck-input="basic">Placeholder</div>'
			},
			full: {
				label: 'Full',
				template: '<div class="full" ck-input="full"></div>'
			},
			full_placeholder: {
				label: 'Full placeholder',
				template: '<div class="full-placeholder" ck-input="full">Placeholder</div>'
			},
			nested: {
				label: 'Nested',
				template: '<div class="parent"><p class="simple" ck-input="plain"></p></div>'
			}
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
