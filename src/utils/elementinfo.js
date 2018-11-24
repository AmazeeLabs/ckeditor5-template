/**
 * @module template/utils/elementinfo
 */

/**
 * Template info object.
 *
 * Used by the template engine to store and retrieve information on different template elements.
 */
export default class ElementInfo {
	/**
	 * Create a new template element.
	 *
	 * @param {Element} node - A HTML node.
	 * @param {ElementInfo} parent - An optional parent element.
	 */
	constructor( node, parent = null ) {
		this._node = node;
		this._parent = parent;
		this._children = [];

		if ( parent ) {
			parent.addChild( this );
		}

		// All attributes that are not prefixed with 'ck-' and are not the class attribute
		// are considered template attributes and will appear in editor and data representations.
		this._attributes = Array.from( node.attributes )
			.filter( attr => !attr.name.startsWith( 'ck-' ) )
			.filter( attr => attr.name !== 'class' )
			.map( attr => ( { [ attr.name ]: attr.value } ) )
			.reduce( ( acc, val ) => Object.assign( acc, val ), {} );

		// All attributes that are prefixed with 'ck-' are considered template configuration
		// and will not be cast down to data and editor representations.
		this._configuration = Array.from( node.attributes )
			.filter( attr => attr.name.startsWith( 'ck-' ) )
			.map( attr => ( { [ attr.name.substr( 3 ) ]: attr.value } ) )
			.reduce( ( acc, val ) => Object.assign( acc, val ), {} );

		// Element index for automatic child element naming.
		const index = node.parentNode ?
			Array.prototype.indexOf.call( node.parentNode.childNodes, node ) :
			'';

		// If there is a 'ck-name' attribute, use it, or default to `childN`.
		const name = node.getAttribute( 'ck-name' ) || `child${ index }`;

		// Prefix element names with the parent name, and in the root case with "ck_".
		this._name = parent ?
			`${ parent.name }__${ name }` :
			`ck__${ name }`;
	}

	/**
	 * Register a child element.
	 *
	 * Used by the registration process to build up the template element tree.
	 *
	 * @param {module:template/utils/elementinfo~ElementInfo} child
	 */
	addChild( child ) {
		this._children.push( child );
	}

	/**
	 * Check if a given template element matches a view element.
	 *
	 * To match a view element, the view has to have the same tagname as well as all classes of the template element.
	 *
	 * @param {module:engine/view/element~Element} viewElement
	 * @returns {boolean}
	 */
	matches( viewElement ) {
		// Tag name has to be the same.
		if ( viewElement.name !== this._node.tagName ) {
			return false;
		}

		// The view has to contain all classes of the template element.
		for ( const cls of this._node.classList ) {
			if ( !viewElement.hasClass( cls ) ) {
				return false;
			}
		}

		// If this is not a template root, also check if there is a view parent and if it matches the template parent.
		if ( this.parent ) {
			return !!viewElement.parent && this.parent.matches( viewElement.parent );
		}

		// If there is no parent, we know it matches by now.
		return true;
	}

	/**
	 * The class attribute.
	 *
	 * @returns {String}
	 */
	get classes() {
		return this._node.getAttribute( 'class' );
	}

	/**
	 * The template elements
	 * @returns {string}
	 */
	get tagName() {
		return this._node.tagName;
	}

	/**
	 * The element type. Defaults to "element".
	 *
	 * @returns {string}
	 */
	get type() {
		return this._configuration.type || 'element';
	}

	/**
	 * The parent element.
	 *
	 * @returns {module:template/utils/elementinfo~ElementInfo}
	 */
	get parent() {
		return this._parent;
	}

	/**
	 * The list of child elements.
	 *
	 * @returns {module:template/utils/elementinfo~ElementInfo}
	 */
	get children() {
		return this._children;
	}

	/**
	 * The registered schema name.
	 *
	 * @returns {string}
	 */
	get name() {
		return this._name;
	}

	/**
	 * Configuration value map.
	 *
	 * @returns {Object}
	 */
	get configuration() {
		return this._configuration;
	}

	/**
	 * Attribute value map.
	 *
	 * @returns {Object}
	 */
	get attributes() {
		return this._attributes;
	}
}
