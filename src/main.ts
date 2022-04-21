import { Plugin } from 'obsidian';
import { parseRepoURL } from './gitServerInterface';
import { getPluginsDir } from './pluginActions';
import GaloreSettingTab from './settingsPage';

// This is split out into it's own function as a workaround since otherwise
// typescript yells at us that App doesn't have `plugins` property.
const getExistingPluginManifest = (app: any, name: string) => {
	return app.plugins.manifests[name];
}

export default class Galore extends Plugin {
	async onload() {
		this.addSettingTab(new GaloreSettingTab(this.app, this));

		const galoreFilePath = getPluginsDir(this.app) + "/plugins-galore/.galore";
		const adapter = this.app.vault.adapter;
		if (!(await adapter.exists(galoreFilePath))) {
			const galoreManifest = getExistingPluginManifest(this.app, "plugins-galore");
			const repo = await parseRepoURL("https://github.com/dylanpizzo/obsidian-plugins-galore");
			const version = galoreManifest.version;
			adapter.write(galoreFilePath, JSON.stringify({repo, version}));
		}
	}
}
