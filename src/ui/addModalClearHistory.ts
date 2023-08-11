import { Modal, Setting, Notice } from 'obsidian';

export default class GaloreAddModalClearHistory extends Modal {
	onSubmit: (isConfirmed: boolean) => void;

	constructor(onSubmit: (isConfirmed: boolean) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen(): void {
		const {contentEl} = this;

		contentEl.empty();

		contentEl.createEl("h2", {text: "Plugins Galore: Clear History"})

		new Setting(contentEl)
			.setName(createFragment(descEl => {
				descEl.createDiv({}, div => {
					div.appendText("This will remove all history entries.")
					div.createEl("br")
					div.createEl("b", { text: "Are you sure?" })
				})
			}))
			.addButton(button => button
				.setButtonText("Confirm")
				.setWarning()
				.onClick(() => {
					this.close();
					this.onSubmit(true);
				})
			)
			.addButton(button => button
				.setButtonText("Cancel")
				.onClick(() => {
					this.close();
					this.onSubmit(false);
				})
			)
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
