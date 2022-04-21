import { App, Modal, Setting, Notice } from 'obsidian';
import { installPluginFromRepo } from './pluginActions.ts';

export default class GaloreUpdateModal extends Modal {
	constructor(app: App, galorePlugins) {
		super(app);
		this.app = app;
		this.galorePlugins = galorePlugins;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.createEl("h2", {text: "Plugins Galore: Update Plugins"})
		new Setting(contentEl)
			.setName("Select the plugins below to update, and then click Update.")
			.setDesc('')
			.addButton(button => button
				.setButtonText("Cancel")
				.onClick(ev => {
					this.close();
				})
			)
			.addButton(button => button
				.setButtonText("Update")
				.setCta()
				.onClick(async ev => {
					const pluginsToUpdate = this.galorePlugins.filter(plugin => plugin.toggle.getValue());
					for (const plugin of pluginsToUpdate) {
						await installPluginFromRepo(this.app, plugin.repo);
					}
					new Notice(`Updated ${pluginsToUpdate.length} plugins`);
					this.close();
				})
			)
		for (const plugin of this.galorePlugins) {
			new Setting(contentEl)
				.setName(plugin.manifest.name)
				.setDesc(`Version: ${plugin.localVersion} -> ${plugin.remoteVersion}`)
				.addToggle(toggle => {
					plugin.toggle = toggle;
					toggle.setValue(true);
				})
		}
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
