import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import RemoteControlObserver from './observer/remotecontrolobserver';
import RemoteControlCommand from './commands/remotecontrolcommand';

export default class RemoteControl extends Plugin {
	init() {
		this.editor.editing.view.addObserver( RemoteControlObserver );
		this.editor.commands.add( 'remoteControlCommand', new RemoteControlCommand( this.editor ) );
		this.listenTo( this.editor.editing.view.document, 'ckEditorOperation', ( evt, data ) => {
			this.editor.commands.get( 'remoteControlCommand' ).execute( data.domEvent.detail );
		} );
	}
}
