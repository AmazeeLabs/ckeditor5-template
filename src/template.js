/**
 * @module template/template
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import TemplateEditing from './templateediting';
import MasterTemplate from './mastertemplate';
import TextElement from './elements/textelement';
import TemplateUI from './ui/templateui';

/**
 * Root template plugin, requiring all auxiliary plugins to enable template functionality.
 *
 * Can be configured with template snippets:
 *
 *     templates: {
 *       simple: {
 *         label: 'Simple',
 *         template: '<div class="simple"></div>',
 *       },
 *       complex: {
 *         label: 'Complex',
 *         template: '<div class="parent"><div class="child"></div></div>',
 *       },
 *     }
 *
 * @see module:template/templateediting~TemplateEditing
 * @see module:template/templateui~TemplateUI
 */
export default class Template extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TemplateEditing, TemplateUI, MasterTemplate, TextElement ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Template';
	}
}
