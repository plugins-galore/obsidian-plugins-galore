import { Repo, Release, PluginForGalore } from './types';
import { App, normalizePath } from 'obsidian';
import GaloreErrorModal from './errorModal';
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

const getLocalPluginMeta = async (app: App, pluginID: string) => {
	const path = getPluginPath(app, pluginID);
	const adapter = app.vault.adapter;
	return JSON.parse(await adapter.read(path + ".galore"));
}

const writePlugin = async (app: App, plugin: PluginForGalore) => {
	try {
		const path = getPluginPath(app, plugin.manifest.id);
		const adapter = app.vault.adapter;
		if (!(await adapter.exists(path))) {
			await adapter.mkdir(path);
		}
		await adapter.write(
			path + ".galore",
			JSON.stringify(plugin.galore),
		)
		await Promise.all(plugin.assets.map(async (asset: any) => adapter.write(
			path + asset.name,
			asset.content,
		)));
	} catch (error) {
		console.error(error);
		new GaloreErrorModal(app, error).open();
	}
}

const installPluginFromRepo = async (app: App, repo: Repo) => {
	const plugin = await getRemotePlugin(repo);
	await writePlugin(app, plugin);
	return plugin;
}

const asyncFilter = async (array: Array<any>, func: Function) => {
	const out = Symbol();
	return (await Promise.all(array.map(async (item: any) => {
		const isIn = await func(item);
		return isIn ? item : out;
	}))).filter(x => x !== out);
}

const getGalorePlugins = async (app: App) => {
	try {
		const adapter = app.vault.adapter;
		const pluginsDir = getPluginsDir(app);
		const allPluginPaths = (await adapter.list(pluginsDir)).folders;
		const galorePluginPaths = (await asyncFilter(allPluginPaths, async (path: string) => adapter.exists(path + "/.galore"))).map(p => p + "/");
		const galorePlugins = await Promise.all(galorePluginPaths.map(async path => {
			const localManifest = JSON.parse(await adapter.read(path + "manifest.json"));
			const localGalore = await getLocalPluginMeta(app, localManifest.id);
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

export {
	getPluginsDir,
	installPluginFromRepo,
	getGalorePlugins,
}
