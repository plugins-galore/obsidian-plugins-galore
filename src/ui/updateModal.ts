import { App, Modal, Setting, Notice } from 'obsidian';
import Galore from '../main';
import { installPluginFromRepo } from '../util/pluginActions';

export default class GaloreUpdateModal extends Modal {
	plugin: Galore;
	galorePlugins?: any = null;

	constructor(plugin: Galore, galorePlugins: any) {
		super(app);
		this.plugin = plugin;
		this.app = plugin.app;
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
					const pluginsToUpdate = this.galorePlugins.filter((plugin: any) => plugin.toggle.getValue());
					for (const plugin of pluginsToUpdate) {
						await installPluginFromRepo(this.plugin, plugin.repo);
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
