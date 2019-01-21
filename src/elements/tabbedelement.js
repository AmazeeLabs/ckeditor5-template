import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import '../../theme/css/tabbedelement.css';

import { LitElement, html } from 'lit-element';
import TemplateEditing from '../templateediting';
import PlaceholderElement from './placeholderelement';

class CKTabbed extends LitElement {
	static get properties() {
		return {
			'tabs': Array,
		};
	}

	constructor() {
		super();
		this.tabs = [];
		this.currentTab = 0;
	}

	connectedCallback() {
		super.connectedCallback();
		this.tabs = Array.from( this.children ).map( ( child, index ) => ( {
			title: child.getAttribute( 'title' ),
			index,
		} ) );
		this.setTab( this.currentTab );
	}

	render() {
		return html`
			<style>
			:host {
				display: block;
				padding: 0.5em;
				border: 1px dotted red;
			}
			</style>
			<div class="tabs">${ this.tabs.map( tab => this.button( tab ) ) }</div>
			<slot></slot>
		`;
	}

	button( tab ) {
		return html`<button @click="${ () => this.setTab( tab.index ) }">${ tab.title }</button>`;
	}

	setTab( index ) {
		if ( this.childCount <= index || !this.children[ index ] ) {
			return;
		}

		this.children[ this.currentTab ].classList.remove( 'active' );
		this.children[ index ].classList.add( 'active' );
		this.currentTab = index;
	}
}

class CKTab extends LitElement {
	render() {
		return html`
			<style>
			:host {
				margin-top: 1em;
				display: block;
				border: 1px dotted green;
				padding: 1em;
			}
			</style>
			<div>
				<slot></slot>
			</div>
		`;
	}
}

customElements.define( 'ck-tabbed', CKTabbed );
customElements.define( 'ck-tab', CKTab );

export default class TabbedElement extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TemplateEditing, PlaceholderElement ];
	}
}
