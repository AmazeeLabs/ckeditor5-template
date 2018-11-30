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
		this._label = node.getAttribute( 'ck-label' );

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

		const classAttribute = node.getAttribute( 'class' );
		this._classes = classAttribute ? classAttribute.split( ' ' ).sort() : [];

		// Calculate the possible conversions for an element.
		this._conversions = this._configuration.conversions ?
			this._configuration.conversions.split( ' ' ).map( el => `ck__${ el }` ) :
			[];

		this._contains = this._configuration.contains ?
			this._configuration.contains.split( ' ' ).map( el => el ) :
			[];
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
		return viewElement &&
			// Match the tag name.
			viewElement.name === this._node.tagName &&
			// Match all classes.
			this.classes.join( ' ' ) === Array.from( viewElement.getClassNames() ).sort().join( ' ' ) &&
			// If there is a parent, match the parent.
			( !this.parent || this.parent.matches( viewElement.parent ) );
	}

	/**
	 * Retrieve the human readable name for this element.
	 *
	 * @returns {String}
	 */
	get label() {
		return this._label;
	}

	/**
	 * Retrieve the dom elements inner text.
	 *
	 * @returns {Element}
	 */
	get text() {
		return this._node.textContent;
	}

	/**
	 * The class attribute.
	 *
	 * @returns {String[]}
	 */
	get classes() {
		return this._classes;
	}

	/**
	 * The template elements
	 * @returns {string}
	 */
	get tagName() {
		return this._node.tagName;
	}

	/**
	 * Check if this element is the root of a template object.
	 *
	 * @returns {boolean}
	 */
	get isTemplateRoot() {
		return !this._parent;
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

	/**
	 * Get possible conversions for a given element.
	 *
	 * @returns {String[]}
	 */
	get conversions() {
		return this._conversions;
	}

	/**
	 * Retrieve the list of elements this element can contain.
	 *
	 * @returns {String[]}
	 */
	get contains() {
		return this._contains;
	}
}
