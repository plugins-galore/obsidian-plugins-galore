import { App, Plugin, Notice, PluginSettingTab, Setting } from 'obsidian';
import Galore from '../main';
import { getGalorePlugins, clearHistory, removeFromHistory } from '../util/pluginActions';
import GaloreUpdateModal from './updateModal';
import GaloreAddModal from './addModal';
import GaloreAddModalClearHistory from './addModalClearHistory';

export default class GaloreSettingTab extends PluginSettingTab {
	plugin: Galore;
	doOpenHistoryDetails = false;
	
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

		new Setting(containerEl)
			.setName("Plugin List")
			.setDesc(createFragment(descEl => {
				descEl.createDiv({}, div => {
					div.appendText("This shows a list of currently and previously installed Galore plugins.")
					div.createEl("br")
					div.createEl("b", { text: "Installed: " })
					div.appendText("Plugins that installed via Plugin Galore.")
					div.createEl("br")
					div.createEl("b", { text: "History: " })
					div.appendText("Plugins that are not currently installed, but were once installed via Plugin Galore.")
				})
			}));

		// Installed list
		const collapsibleInstalledPlugins = containerEl.createEl('details');
		const summaryInstalledPlugins = collapsibleInstalledPlugins.createEl('summary', { text: "Installed" });
		new Setting(summaryInstalledPlugins)
			.setHeading();

		(async () => {
			const galorePlugins = await getGalorePlugins(this.plugin);
			const galorePluginsExceptGalore = galorePlugins.filter((x) => x.manifest.id != "plugins-galore");

			galorePluginsExceptGalore.forEach((plugin) => {
				new Setting(collapsibleInstalledPlugins)
					.setName(plugin.manifest.name)
					.setDesc(createFragment((descEl) => {
						descEl.createDiv({}, (div) => {
							div.appendText("Version: " + plugin.manifest.version)
							div.createEl("br")
							div.appendText("By " + plugin.manifest.author)
							div.createEl("br")
							div.appendText(plugin.manifest.description)
						})
					}))
			})
		})();

		// History list
		const collapsibleHistoryPlugins = containerEl.createEl('details');
		if (this.doOpenHistoryDetails) {
			collapsibleHistoryPlugins.open = true;
			this.doOpenHistoryDetails = false;
		}

		new Setting(collapsibleHistoryPlugins)
			.addButton( button => button
					.setButtonText("Clear history")
					.setTooltip("Remove all history entries")
					.setWarning()
					.onClick( () => {
						new GaloreAddModalClearHistory(async isConfirmed => {
							if (isConfirmed) {
								await clearHistory(this.plugin);
								new Notice(`History cleared.`);
								this.doOpenHistoryDetails = true;
								this.display();
							}
						}).open();
					} )
			);
		const summaryHistoryPlugins = collapsibleHistoryPlugins.createEl('summary', { text: "History" });
		new Setting(summaryHistoryPlugins)
			.setHeading();

		const galoreHistory = this.plugin.galoreData.history;
		this.sortHistory(galoreHistory);
		galoreHistory.forEach( (obj: any) => {
			const key = Object.keys(obj)[0];
			new Setting(collapsibleHistoryPlugins)
				.setName(key)
				.setDesc(createFragment((descEl) => {
					descEl.createDiv({}, (div) => {
						div.appendText("Version: " + obj[key].version)
						div.createEl("br")
						div.appendText("By " + obj[key].repo.owner)
						div.createEl("br")
						div.appendText("In history since: " + obj[key].timestamp)
					})
				}))
				.addExtraButton( button => button
						.setIcon("trash")
						.setTooltip("Remove this entry from history")
						.onClick( async () => {
							const idx = galoreHistory.indexOf(obj);
							await removeFromHistory(this.plugin, idx);
							new Notice(`Removed from history: ` + key);
							this.doOpenHistoryDetails = true;
							this.display();
						})
				);
		})
	}

	// Sort history by timestamp (in ascending order)
	sortHistory(history: Array<Object>) {
		history.sort( (a: any, b: any) => {
			const keyA = Object.keys(a)[0];
			const keyB = Object.keys(b)[0];

			if (a[keyA].timestamp > b[keyB].timestamp)
				return 1;

			if (a[keyA].timestamp < b[keyB].timestamp)
				return -1;

			return 0;
		});
	}
}
