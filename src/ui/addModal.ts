import { App, Modal, Setting, Notice } from 'obsidian';
import Galore from '../main';
import { parseRepoURL } from '../util/gitServerInterface';
import { installPluginFromRepo } from '../util/pluginActions';

export default class GaloreAddModal extends Modal {
	plugin: Galore;

	constructor(plugin: Galore) {
		super(app);
		this.plugin = plugin;
		this.app = plugin.app;
	}

	onOpen(): void {
		const {contentEl} = this;

		contentEl.empty();

		contentEl.createEl("h2", {text: "Plugins Galore: Add a Plugin"})

		let repoURL = "";
		let siteType = "github";

		new Setting(contentEl)
			.setName('Repo URL')
			.setDesc('')
			.addText(text => text
				.setPlaceholder("https://github.com/{owner}/{plugin-repo}")
				.setValue(repoURL)
				.onChange(value => {
					repoURL = value;
				})
			)

		new Setting(contentEl)
			.setName('Install the plugin')
			.setDesc("")
			.addButton(button => button
				.setButtonText("Install")
				.setCta()
				.onClick(async ev => {
					const repo = await parseRepoURL(repoURL);
					const plugin = await installPluginFromRepo(this.plugin, repo);
					new Notice(`Installed ${plugin.manifest.name}.`);
					this.close();
				})
			)
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
