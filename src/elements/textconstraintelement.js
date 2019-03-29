/**
 * @module templates/elements/textelement
 */
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import TemplateEditing from '@amazee/ckeditor5-template/src/templateediting';
import { downcastTemplateElement, getModelAttributes } from '@amazee/ckeditor5-template/src/utils/conversion';
import { postfixTemplateElement } from '@amazee/ckeditor5-template/src/utils/integrity';

export default class TextConstraintElement extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TemplateEditing ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		// Default editing downcast conversions for template container elements without functionality.
		this.editor.conversion.for( 'editingDowncast' ).add( downcastTemplateElement( this.editor, {
			types: [ 'text-constraint' ],
			view: ( templateElement, modelElement, viewWriter ) => {
				const config = [ 'min', 'max', 'config', 'pattern', 'message-helper' ]
					.filter( key => templateElement.configuration[ key ] )
					.map( key => ( { [ `ck-${ key }` ]: templateElement.configuration[ key ] } ) )
					.reduce( ( acc, val ) => Object.assign( acc, val ), {} );
				return viewWriter.createContainerElement(
					'ck-textfield',
					Object.assign( getModelAttributes( templateElement, modelElement ), config )
				);
			},
			converterPriority: 'high'
		} ) );

		// Postfix elements to make sure a templates structure is always correct.
		this.editor.templates.registerPostFixer( [ 'text-constraint' ], postfixTemplateElement );
	}
}
