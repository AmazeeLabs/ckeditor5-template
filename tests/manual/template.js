/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EnterPlugin from '@ckeditor/ckeditor5-enter/src/enter';
import TypingPlugin from '@ckeditor/ckeditor5-typing/src/typing';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import TemplateUI from '../../src/ui/templateui';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ EnterPlugin, TypingPlugin, ParagraphPlugin, TemplateUI ],
		toolbar: [ 'template' ],
		templates: {
			simple: {
				label: 'Simple',
				template: '<div class="simple"></div>',
			},
			nested: {
				label: 'Nested',
				template: '<div class="parent"><div class="child"></div></div>',
			},
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
