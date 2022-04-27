import { App, Plugin, Notice, PluginSettingTab, Setting } from 'obsidian';
import Galore from '../main';
import { getGalorePlugins } from '../util/pluginActions';
import GaloreUpdateModal from './updateModal';
import GaloreAddModal from './addModal';

export default class GaloreSettingTab extends PluginSettingTab {
	plugin: Galore;
	
	constructor(plugin: Galore) {
		super(app, plugin);
		this.plugin = plugin;
		this.app = plugin.app;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Plugins Galore'});

		let repoURL = "";
		let repoInput = null;

		new Setting(containerEl)
			.setName('Add a plugin')
			.setDesc('')
			.addButton(button => button
				.setButtonText("Add a plugin")
				.setCta()
				.onClick(async ev => {
					new GaloreAddModal(this.plugin).open();
				})
			)

		new Setting(containerEl)
			.setName('Installed Plugins')
			.setDesc('This only checks for updates on plugins installed through Plugins Galore.')
			.addButton(button => button
				.setButtonText("Check for updates")
				.setCta()
				.onClick(async ev => {
					const galorePlugins = await getGalorePlugins(this.plugin);
					const galorePluginsThatCanUpdate = galorePlugins.filter(x => x.canUpdate);
					if (galorePluginsThatCanUpdate.length) {
						new GaloreUpdateModal(this.plugin, galorePluginsThatCanUpdate).open();
					} else {
						new Notice('No plugins updates found.');
					}
				})
			)
	}
}
