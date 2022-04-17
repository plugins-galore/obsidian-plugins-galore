import { Plugin } from 'obsidian';
import { getPluginsDir } from 'src/utils.ts';
import GaloreSettingTab from 'src/settingsPage.ts';

export default class Galore extends Plugin {
	async onload() {
		this.addSettingTab(new GaloreSettingTab(this.app, this));

		const galoreFilePath = getPluginsDir(this.app) + "/plugins-galore/.galore";
		const adapter = this.app.vault.adapter;
		if (!(await adapter.exists(galoreFilePath))) {
			const galoreManifest = this.app.plugins.manifests["plugins-galore"];
			const site = {
				type: "github",
				domain: "github.com",
			};
			const repo = "dylanpizzo/obsidian-plugins-galore";
			const version = galoreManifest.version;
			adapter.write(galoreFilePath, JSON.stringify({site, repo, version}));
		}
	}
}
