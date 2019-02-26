/**
 * @module template/template
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import TemplateEditing from './templateediting';
import MasterTemplate from './mastertemplate';
import TemplateUI from './ui/templateui';
import TextElement from './elements/textelement';
import PlaceholderElement from './elements/placeholderelement';
import ContainerElement from './elements/containerelement';
import TemplateAttributeUI from './ui/templateattributeui';
import TemplateId from './templateid';
import TextLimit from './textlimit';
import HoveredWidget from './hoveredwidget';
import GalleryElement from './elements/galleryelement';

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
		return [
			TemplateEditing,
			MasterTemplate,
			TextElement,
			PlaceholderElement,
			ContainerElement,
			GalleryElement,
			TemplateUI,
			TemplateAttributeUI,
			TemplateId,
			TextLimit,
			HoveredWidget
		];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Template';
	}
}
