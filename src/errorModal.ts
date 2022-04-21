import { App, Modal } from 'obsidian';

export default class GaloreErrorModal extends Modal {
	error?: Error | string = null;

	constructor(app: App, error: Error | string) {
		super(app);
		this.error = error;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText("Oops. Something went wrong!");
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
