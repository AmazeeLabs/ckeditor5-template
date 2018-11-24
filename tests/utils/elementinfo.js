import Elementinfo from '../../src/utils/elementinfo';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

describe( 'Elementinfo', () => {
	it( 'returns its type', () => {
		const node = global.document.createElement( 'div' );
		node.setAttribute( 'ck-type', 'test' );

		const element = new Elementinfo( node );
		expect( element.type ).to.equal( 'test' );
	} );

	it( 'has a prefixed name', () => {
		const node = global.document.createElement( 'div' );
		node.setAttribute( 'ck-name', 'test' );

		const element = new Elementinfo( node );
		expect( element.name ).to.equal( 'ck__test' );
	} );

	it( 'prefixes child names', () => {
		const parent = global.document.createElement( 'div' );
		parent.setAttribute( 'ck-name', 'foo' );

		const child = global.document.createElement( 'div' );
		child.setAttribute( 'ck-name', 'bar' );

		parent.appendChild( child );

		const element = new Elementinfo( child, new Elementinfo( parent ) );
		expect( element.name ).to.equal( 'ck__foo__bar' );
	} );

	it( 'sets automatic names for children', () => {
		const parent = global.document.createElement( 'div' );
		parent.setAttribute( 'ck-name', 'foo' );

		const child = global.document.createElement( 'div' );

		parent.appendChild( child );

		const element = new Elementinfo( child, new Elementinfo( parent ) );
		expect( element.name ).to.equal( 'ck__foo__child0' );
	} );

	it( 'exposes its parent', () => {
		const parent = global.document.createElement( 'div' );
		parent.setAttribute( 'ck-name', 'foo' );

		const child = global.document.createElement( 'div' );

		parent.appendChild( child );

		const parentElement = new Elementinfo( parent );
		const childElement = new Elementinfo( child, parentElement );
		expect( childElement.parent ).to.equal( parentElement );
	} );

	it( 'exposes prefixed attributes as configuration', () => {
		const node = global.document.createElement( 'div' );
		node.setAttribute( 'ck-name', 'foo' );
		node.setAttribute( 'ck-type', 'bar' );
		node.setAttribute( 'foo', 'bar' );

		const element = new Elementinfo( node );
		expect( element.configuration ).to.deep.equal( {
			name: 'foo',
			type: 'bar',
		} );
	} );

	it( 'exposes un-prefixed attributes as attributes', () => {
		const node = global.document.createElement( 'div' );
		node.setAttribute( 'ck-name', 'foo' );
		node.setAttribute( 'ck-type', 'bar' );
		node.setAttribute( 'foo', 'bar' );

		const element = new Elementinfo( node );
		expect( element.attributes ).to.deep.equal( {
			foo: 'bar',
		} );
	} );

	it( 'keeps track of child elements', () => {
		const parent = global.document.createElement( 'div' );
		parent.setAttribute( 'ck-name', 'foo' );

		const child = global.document.createElement( 'div' );

		parent.appendChild( child );

		const parentElement = new Elementinfo( parent );
		const childElement = new Elementinfo( child, parentElement );
		expect( parentElement.children ).to.deep.equal( [ childElement ] );
	} );
} );
