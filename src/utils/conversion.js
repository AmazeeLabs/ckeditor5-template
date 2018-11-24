/**
 * @module template/utils/conversion
 */

/**
 * Generate a downcast converter for selected template element types.
 *
 * Configuration consists of a "types" and a "view" property, whereas the view is a builder callback.
 *
 *     downcastTemplateElement( this.editor, {
 *         types: [ "element" ],
 *         view: ( templateElement, modelElement, viewWriter ) => {
 *             return writer.createContainerElement( ... );
 *         }
 *     } );
 *
 * @param {module:core/editor/editor~Editor} editor
 * @param {Object} config
 */
export function downcastTemplateElement( editor, config ) {
	return editor.plugins.get( 'TemplateEditing' ).downcastTemplateElement( config );
}

/**
 * Generate an upcast converter for selected template element types.
 *
 * Configuration consists of a "types" and a "model" property, whereas the model is a builder callback.
 *
 *     downcastTemplateElement( this.editor, {
 *         types: [ "element" ],
 *         model: ( templateElement, viewElement, modelWriter ) => {
 *             return writer.createElement( ... );
 *         }
 *     } );
 *
 * @param {module:core/editor/editor~Editor} editor
 * @param {Object} config
 */
export function upcastTemplateElement( editor, config ) {
	return editor.plugins.get( 'TemplateEditing' ).upcastTemplateElement( config );
}

/**
 * Generate a map of all template attributes to be downcasted.
 *
 * @param {module:template/utils/elementinfo~ElementInfo} templateElement
 * @param {module:engine/model/element~Element} modelElement
 *
 * @returns {Object}
 */
export function getModelAttributes( templateElement, modelElement ) {
	return Object.keys( templateElement.attributes )
		.map( attr => ( { [ attr ]: modelElement.getAttribute( attr ) } ) )
		.concat( [ { class: templateElement.classes } ] )
		.reduce( ( acc, val ) => Object.assign( acc, val ), {} );
}

/**
 * Generate a map of all template attributes to be upcasted.
 *
 * @param {module:template/utils/elementinfo~ElementInfo} templateElement
 * @param {module:engine/view/element~Element} viewElement
 *
 * @returns {Object}
 */
export function getViewAttributes( templateElement, viewElement ) {
	return Object.keys( templateElement.attributes )
		.map( key => ( { [ key ]: viewElement.getAttribute( key ) } ) )
		.filter( val => Object.values( val )[ 0 ] !== undefined )
		.reduce( ( acc, val ) => Object.assign( acc, val ), {} );
}
