import { App, Modal, Setting, Notice } from 'obsidian';
import { installFromRepo } from './utils.ts';

export default class GaloreAddModal extends Modal {

	constructor(app: App) {
		super(app);
		this.app = app;
	}

	onOpen(): void {
		const {contentEl} = this;

		contentEl.empty();

		contentEl.createEl("h2", {text: "Plugins Galore: Add a Plugin"})

		let siteDomainInput = null;

		let repoFullName = "";
		let siteType = "github";

		const siteDomainByType = {
			github: "github.com",
			gitea: "",
			gitlab: "",
		}

		new Setting(contentEl)
			.setName('Repo Full Name')
			.setDesc('')
			.addText(text => text
				.setPlaceholder("user/repo")
				.setValue(repoFullName)
				.onChange(value => {
					repoFullName = value;
				})
			)

		new Setting(contentEl)
			.setName('Git Host')
			.setDesc('')
			.addDropdown(dd => dd
				.addOption("github", "GitHub")
				.addOption("gitea", "Gitea")
				// .addOption("gitlab", "GitLab") // we don't support GitLab yet.
				.setValue(siteType)
				.onChange(value => {
					siteType = value;
					siteDomainInput.setValue(siteDomainByType[siteType]);
				})
			)
			.addText(text => {
				siteDomainInput = text;
				text
					.setPlaceholder("example.com")
					.setValue(siteDomainByType[siteType])
					.onChange(value => {
						siteDomainByType[siteType] = value;
					})
			})

		new Setting(contentEl)
			.setName('Install the plugin')
			.setDesc("")
			.addButton(button => button
				.setButtonText("Install")
				.setCta()
				.onClick(async ev => {
					const plugin = await installFromRepo(this.app, {type: siteType, domain: siteDomainByType[siteType]}, repoFullName);
					new Notice(`Installed ${plugin.name}.`);
					this.close();
				})
			)
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
