/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EnterPlugin from '@ckeditor/ckeditor5-enter/src/enter';
import TypingPlugin from '@ckeditor/ckeditor5-typing/src/typing';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import UndoPlugin from '@ckeditor/ckeditor5-undo/src/undo';
import TemplatePlugin from '../../../src/template';

import TemplateidPlugin from '../../../src/templateid';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ EnterPlugin, TypingPlugin, HeadingPlugin, TemplatePlugin, TemplateidPlugin, UndoPlugin ],
		toolbar: [ 'template' ],
		templates: {
			a: {
				label: 'A',
				template: '<div class="a" id=""></div>',
			},
			b: {
				label: 'B',
				template: '<div class="b" id=""><div class="c"></div></div>',
			}
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
