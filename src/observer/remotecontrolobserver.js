import DomEventObserver from '@ckeditor/ckeditor5-engine/src/view/observer/domeventobserver';
import { eventType } from '@amazee/editor-components/components/editor/operations';

export default class RemoteControlObserver extends DomEventObserver {
	constructor( view ) {
		super( view );
		this.domEventType = eventType;
		this.useCapture = true;
	}

	onDomEvent( domEvent ) {
		this.fire( domEvent.type, domEvent );
	}
}
