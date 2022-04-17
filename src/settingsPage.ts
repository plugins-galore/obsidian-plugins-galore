import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import { installFromRepo, getGalorePlugins } from './utils.ts';
import GaloreUpdateModal from './updateModal.ts';

export default class GaloreSettingTab extends PluginSettingTab {

	constructor(app: App, plugin: Galore) {
		super(app, plugin);
		this.app = app;
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Add a plugin from a Github repository'});

		let repoURL = "";
		let repoInput = null;

		new Setting(containerEl)
			.setName('Add a Plugin')
			.setDesc('Enter the `user/repo` of a plugin and then click to install')
			.addText(text => {
				repoInput = text;
				text
					.setPlaceholder("user/repo")
					.setValue(repoURL)
					.onChange(value => {
						repoURL = value;
					})
			})
			.addButton(button => button
				.setButtonText("Install")
				.setCta()
				.onClick(async ev => {
					const plugin = await installFromRepo(this.app, {type: "github", domain: "github.com"}, repoURL);
					console.log('plugin', plugin);
					if (repoInput) {
						repoURL = '';
						repoInput.setValue(repoURL);
					}
					new Notice(`Installed ${plugin.name}.`);
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
