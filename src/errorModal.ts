import { App, Modal } from 'obsidian';

export default class GaloreErrorModal extends Modal {
	constructor(app: App, error) {
		super(app);
		// this.error = error;
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
