import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import { installPluginFromRepo, getGalorePlugins } from './utils.ts';
import GaloreUpdateModal from './updateModal.ts';
import GaloreAddModal from './addModal.ts';

export default class GaloreSettingTab extends PluginSettingTab {

	constructor(app: App, plugin: Galore) {
		super(app, plugin);
		this.app = app;
		this.plugin = plugin;
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
					new GaloreAddModal(this.app).open();
				})
			)

		new Setting(containerEl)
			.setName('Installed Plugins')
			.setDesc('This only checks for updates on plugins installed through Plugins Galore.')
			.addButton(button => button
				.setButtonText("Check for updates")
				.setCta()
				.onClick(async ev => {
					const galorePlugins = await getGalorePlugins(this.app);
					console.log('galorePlugins', galorePlugins);
					const galorePluginsThatCanUpdate = galorePlugins.filter(x => x.canUpdate);
					if (galorePluginsThatCanUpdate.length) {
						new GaloreUpdateModal(this.app, galorePluginsThatCanUpdate).open();
					} else {
						new Notice('No plugins updates found.');
					}
				})
			)
	}
}
