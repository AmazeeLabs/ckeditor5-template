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
				label: 'No attributes',
				template: '<div class="a"></div>',
			},

			b: {
				label: 'Attributes',
				template: '<div class="b" text="" single="" multi=""></div>',
			},

			c: {
				label: 'Preselected',
				template: '<div class="c" text="a" single="b" multi="c"></div>',
			},
			d: {
				label: 'Different toolbar',
				template: '<div class="d" single="b" multi="c"></div>',
			}
		},
		templateAttributes: {
			text: {
				type: 'textfield',
				label: 'Textfield',
			},
			single: {
				type: 'dropdown',
				label: 'Singleselect',
				options: {
					a: 'A',
					b: 'B',
					c: 'C',
				}
			},
			multi: {
				type: 'multiselect',
				label: 'Multiselect',
				options: {
					a: 'A',
					b: 'B',
					c: 'C',
				}
			},
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
