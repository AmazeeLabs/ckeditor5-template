import DomEventObserver from '@ckeditor/ckeditor5-engine/src/view/observer/domeventobserver';

export default class RemoteControlObserver extends DomEventObserver {
	constructor( view ) {
		super( view );
		this.domEventType = "ckEditorOperation";
		this.useCapture = true;
	}

	onDomEvent( domEvent ) {
		this.fire( domEvent.type, domEvent );
	}
}
