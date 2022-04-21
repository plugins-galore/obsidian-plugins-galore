import { Plugin } from 'obsidian';
import { parseRepoURL } from 'src/gitServerInterface.ts';
import { getPluginsDir } from 'src/pluginActions.ts';
import GaloreSettingTab from 'src/settingsPage.ts';

export default class Galore extends Plugin {
	async onload() {
		this.addSettingTab(new GaloreSettingTab(this.app, this));

		const galoreFilePath = getPluginsDir(this.app) + "/plugins-galore/.galore";
		const adapter = this.app.vault.adapter;
		if (!(await adapter.exists(galoreFilePath))) {
			const galoreManifest = this.app.plugins.manifests["plugins-galore"];
			const repo = await parseRepoURL("https://github.com/dylanpizzo/obsidian-plugins-galore");
			const version = galoreManifest.version;
			adapter.write(galoreFilePath, JSON.stringify({repo, version}));
		}
	}
}
