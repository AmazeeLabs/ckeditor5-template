/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EnterPlugin from '@ckeditor/ckeditor5-enter/src/enter';
import TypingPlugin from '@ckeditor/ckeditor5-typing/src/typing';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import UndoPlugin from '@ckeditor/ckeditor5-undo/src/undo';

import TemplatePlugin from '../../../src/template';
import TabbedElementPlugin from '../../../src/elements/tabbedelement';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ EnterPlugin, TypingPlugin, ParagraphPlugin, HeadingPlugin, TemplatePlugin, UndoPlugin, TabbedElementPlugin ],
		toolbar: [ 'heading', '|', 'template', '|', 'undo', 'redo' ],
		templates: {
			tabbed: {
				label: 'Tabbed',
				template: '<ck-tabbed>' +
					'<ck-tab title="A"><div ck-type="text">One</div></ck-tab>' +
					'<ck-tab title="B"><div ck-type="text">Two</div></ck-tab>' +
					'<ck-tab title="C"><div ck-type="text">Three</div></ck-tab>' +
					'</ck-tabbed>',
			},
		},
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
