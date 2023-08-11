import { Repo, Release, PluginForGalore } from '../types';
import { App, normalizePath } from 'obsidian';
import Galore from '../main';
import GaloreErrorModal from '../ui/errorModal';
import { getRelease, getAsset, getAssets } from './gitServerInterface';

const getPluginsDir = (app: App) => {
	return normalizePath(app.vault.configDir + "/plugins") + "/";
}

const getPluginPath = (app: App, pluginID: string) => {
	return getPluginsDir(app) + pluginID + "/";
}

const getRemotePluginMeta = async (repo: Repo) => {
	try {
		const release = await getRelease(repo);
		return {repo, version: release.version};
	} catch (error) {
		console.error(error);
		new GaloreErrorModal(app, error).open();
	}
}

const getRemotePlugin = async (repo: Repo) => {
	try {
		const release = await getRelease(repo);
		const galore = {repo, version: release.version};
		const rawManifest = await getAsset(release, 'manifest.json');
		const manifest = JSON.parse(await getAsset(release, 'manifest.json'));
		const assets = await getAssets(release);
		return {
			galore,
			manifest,
			assets,
		};
	} catch (error) {
		console.error(error);
		new GaloreErrorModal(app, error).open();
	}
}

const getLocalPluginMeta = (pluginsGalore: Galore, pluginID: string) => {
	return pluginsGalore.galoreData.plugins[pluginID];
}

const writePlugin = async (pluginsGalore: Galore, plugin: PluginForGalore) => {
	try {
		const path = getPluginPath(app, plugin.manifest.id);
		const adapter = app.vault.adapter;
		if (!(await adapter.exists(path))) {
			await adapter.mkdir(path);
		}
		pluginsGalore.galoreData.plugins[plugin.manifest.id] = plugin.galore;
		await pluginsGalore.saveGaloreData();
		await Promise.all(plugin.assets.map(async (asset: any) => adapter.write(
			path + asset.name,
			asset.content,
		)));
	} catch (error) {
		console.error(error);
		new GaloreErrorModal(app, error).open();
	}
}

const installPluginFromRepo = async (pluginsGalore: Galore, repo: Repo) => {
	const plugin = await getRemotePlugin(repo);
	await writePlugin(pluginsGalore, plugin);
	return plugin;
}

const asyncFilter = async (array: Array<any>, func: Function) => {
	const out = Symbol();
	return (await Promise.all(array.map(async (item: any) => {
		const isIn = await func(item);
		return isIn ? item : out;
	}))).filter(x => x !== out);
}

const getGalorePlugins = async (pluginsGalore: Galore) => {
	try {
		const app = pluginsGalore.app;
		const adapter = app.vault.adapter;
		const pluginsDir = getPluginsDir(app);
		const galorePluginPaths = Object.keys(pluginsGalore.galoreData.plugins).map((pluginID: string) => pluginsDir + "/" + pluginID + "/");

		const existingGalorePluginPaths = await asyncFilter(galorePluginPaths, async (path: string) => {
			return await adapter.exists(normalizePath(path));
		});

		const missingGalorePluginPaths = await asyncFilter(galorePluginPaths, async (path: string) => {
			return !(await adapter.exists(normalizePath(path)));
		});

		missingGalorePluginPaths.forEach(async (path: string) => {
			await moveToHistory(pluginsGalore, path);
		});

		const galorePlugins = await Promise.all(existingGalorePluginPaths.map(async (path: string) => {
			const localManifest = JSON.parse(await adapter.read(path + "manifest.json"));
			const localGalore = getLocalPluginMeta(pluginsGalore, localManifest.id);
			const remoteGalore = await getRemotePluginMeta(localGalore.repo);
			return {
				manifest: localManifest,
				repo: localGalore.repo,
				localVersion: localGalore.version,
				remoteVersion: remoteGalore.version,
				canUpdate: localGalore.version !== remoteGalore.version,
			}
		}));
		return galorePlugins;
	} catch (error) {
		console.error(error);
		new GaloreErrorModal(app, error).open();
	}
}

const moveToHistory = async (pluginsGalore: Galore, path: String) => {
	// Isolate last part of plugin path
	const folderName = path.split("/").filter(el => {
		return el.trim().length > 0;
	}).pop();

	// Add plugin data to history
	let historyDate = new Date();
	const offset = historyDate.getTimezoneOffset();
	historyDate = new Date(historyDate.getTime() - (offset*60*1000));

	const pluginData = pluginsGalore.galoreData.plugins[folderName];
	pluginData.timestamp = historyDate.toISOString();
	
	pluginsGalore.galoreData.history.push({ [folderName]: pluginData });
	delete pluginsGalore.galoreData.plugins[folderName];
	
	// Persist changes
	await pluginsGalore.saveGaloreData();
}

const clearHistory = async (pluginsGalore: Galore) => {
	pluginsGalore.galoreData.history = [];
	await pluginsGalore.saveGaloreData();
}

const removeFromHistory = async (pluginsGalore: Galore, idx: number) => {
	pluginsGalore.galoreData.history.splice(idx, 1);
	await pluginsGalore.saveGaloreData();
}

export {
	getPluginsDir,
	installPluginFromRepo,
	getGalorePlugins,
	clearHistory,
	removeFromHistory
}
