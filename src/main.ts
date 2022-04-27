import { Plugin } from 'obsidian';
import { parseRepoURL } from './util/gitServerInterface';
import { getPluginsDir } from './util/pluginActions';
import GaloreSettingTab from './ui/settingsPage';

export default class Galore extends Plugin {
	galoreData: any;

	async onload() {
		await this.loadGaloreData();

		this.addSettingTab(new GaloreSettingTab(this));
	}

	async loadGaloreData() {
		this.galoreData = Object.assign({}, {
			plugins: {
				"plugins-galore": {
					repo: await parseRepoURL("https://github.com/dylanpizzo/obsidian-plugins-galore"),
					version: this.manifest.version,
				}
			}
		}, await this.loadData());
	}

	async saveGaloreData() {
		await this.saveData(this.galoreData);
	}
}
