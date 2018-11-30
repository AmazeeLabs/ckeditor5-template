import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element';

import ElementInfo from '../../src/utils/elementinfo';

describe( 'ElementInfo', () => {
	it( 'returns its type', () => {
		const node = global.document.createElement( 'div' );
		node.setAttribute( 'ck-type', 'test' );

		const element = new ElementInfo( node );
		expect( element.type ).to.equal( 'test' );

		expect( element.isTemplateRoot ).to.be.true;
	} );

	it( 'has a prefixed name', () => {
		const node = global.document.createElement( 'div' );
		node.setAttribute( 'ck-name', 'test' );

		const element = new ElementInfo( node );
		expect( element.name ).to.equal( 'ck__test' );
	} );

	it( 'prefixes child names', () => {
		const parent = global.document.createElement( 'div' );
		parent.setAttribute( 'ck-name', 'foo' );

		const child = global.document.createElement( 'div' );
		child.setAttribute( 'ck-name', 'bar' );

		parent.appendChild( child );

		const element = new ElementInfo( child, new ElementInfo( parent ) );
		expect( element.name ).to.equal( 'ck__foo__bar' );
	} );

	it( 'sets automatic names for children', () => {
		const parent = global.document.createElement( 'div' );
		parent.setAttribute( 'ck-name', 'foo' );

		const child = global.document.createElement( 'div' );

		parent.appendChild( child );

		const element = new ElementInfo( child, new ElementInfo( parent ) );
		expect( element.name ).to.equal( 'ck__foo__child0' );
	} );

	it( 'exposes its parent', () => {
		const parent = global.document.createElement( 'div' );
		parent.setAttribute( 'ck-name', 'foo' );

		const child = global.document.createElement( 'div' );

		parent.appendChild( child );

		const parentElement = new ElementInfo( parent );
		const childElement = new ElementInfo( child, parentElement );
		expect( childElement.parent ).to.equal( parentElement );

		expect( childElement.isTemplateRoot ).to.be.false;
	} );

	it( 'exposes prefixed attributes as configuration', () => {
		const node = global.document.createElement( 'div' );
		node.setAttribute( 'ck-name', 'foo' );
		node.setAttribute( 'ck-type', 'bar' );
		node.setAttribute( 'foo', 'bar' );

		const element = new ElementInfo( node );
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

		const element = new ElementInfo( node );
		expect( element.attributes ).to.deep.equal( {
			foo: 'bar',
		} );
	} );

	it( 'keeps track of child elements', () => {
		const parent = global.document.createElement( 'div' );
		parent.setAttribute( 'ck-name', 'foo' );

		const child = global.document.createElement( 'div' );

		parent.appendChild( child );

		const parentElement = new ElementInfo( parent );
		const childElement = new ElementInfo( child, parentElement );
		expect( parentElement.children ).to.deep.equal( [ childElement ] );
	} );

	it( 'exposes the elements tagname', () => {
		const el = global.document.createElement( 'h1' );
		const element = new ElementInfo( el );
		expect( element.tagName ).to.equal( 'H1' );
	} );

	describe( 'classes are', () => {
		it( 'sorted', () => {
			const el = global.document.createElement( 'div' );
			el.setAttribute( 'class', 'z x y' );
			const element = new ElementInfo( el );
			expect( element.classes ).to.deep.equal( [ 'x', 'y', 'z' ] );
		} );

		it( 'empty if there is no class attribute', () => {
			const el = global.document.createElement( 'div' );
			const element = new ElementInfo( el );
			expect( element.classes ).to.deep.equal( [] );
		} );
	} );

	describe( 'text is', () => {
		it( 'an empty string if its empty', () => {
			const el = global.document.createElement( 'div' );
			const element = new ElementInfo( el );
			expect( element.text ).to.equal( '' );
		} );

		it( 'the elements text content', () => {
			const el = global.document.createElement( 'div' );
			el.innerHTML = 'Test';
			const element = new ElementInfo( el );
			expect( element.text ).to.equal( 'Test' );
		} );

		it( 'free of html tags', () => {
			const el = global.document.createElement( 'div' );
			el.innerHTML = '<h1>Test</h1>';
			const element = new ElementInfo( el );
			expect( element.text ).to.equal( 'Test' );
		} );
	} );

	describe( 'matches view element', () => {
		it( 'by tag name', () => {
			const dom = global.document.createElement( 'h1' );
			const info = new ElementInfo( dom );
			const viewElement = new ViewElement( 'H1' );
			expect( info.matches( viewElement ) ).to.equal( true );
		} );

		it( 'by tag name and classes', () => {
			const dom = global.document.createElement( 'h1' );
			dom.setAttribute( 'class', 'b a' );
			const info = new ElementInfo( dom );
			const viewElement = new ViewElement( 'H1', { class: 'a b' } );
			expect( info.matches( viewElement ) ).to.equal( true );
		} );
	} );

	describe( 'mismatches view element', () => {
		it( 'by tag name', () => {
			const dom = global.document.createElement( 'div' );
			const info = new ElementInfo( dom );
			const viewElement = new ViewElement( 'H1' );
			expect( info.matches( viewElement ) ).to.equal( false );
		} );

		it( 'by tag name and classes', () => {
			const dom = global.document.createElement( 'h1' );
			dom.setAttribute( 'class', 'b c a' );
			const info = new ElementInfo( dom );
			const viewElement = new ViewElement( 'H1', { class: 'a b' } );
			expect( info.matches( viewElement ) ).to.equal( false );
		} );
	} );
} );
