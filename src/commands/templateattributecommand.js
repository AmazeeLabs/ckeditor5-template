import TemplateCommandBase from './templatecommandbase';

/**
 * Command to set a attribute value on a template.
 */
export default class TemplateAttributeCommand extends TemplateCommandBase {
	/**
	 * The command constructor.
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 * @param {String} attribute
	 */
	constructor( editor, attribute ) {
		super( editor );
		this.attribute = attribute;
		this.isEnabled = false;
		this.value = null;
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		super.refresh();
		this.isEnabled = !!( this._currentElement && Object.keys( this._currentElementInfo.attributes ).includes( this.attribute ) );
		if ( this.isEnabled ) {
			this.value = this._currentElement.getAttribute( this.attribute );
		}
	}

	/**
	 * @inheritDoc
	 */
	matchElement( templateElement ) {
		return templateElement.isTemplateRoot;
	}

	/**
	 * @inheritDoc
	 */
	execute( values ) {
		if ( this.isEnabled ) {
			this.editor.model.change( writer => {
				writer.setAttribute( this.attribute, values.value, this._currentElement );
			} );
		}
	}
}
