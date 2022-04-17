import { request, normalizePath } from 'obsidian';
import GaloreErrorModal from './errorModal.ts';

const siteTypes = {
	github: {
		getURL(domain, purpose, ...args) {
			if (purpose === 'file-from-repo') {
				const [repo, file] = args;
				return `https://raw.githubusercontent.com/${repo}/HEAD/${file}`;
			} else if (purpose === 'releases') {
				const [repo] = args;
				return `https://api.github.com/repos/${repo}/releases`
			}
		}
	},
	gitea: {
		getURL(domain, purpose, ...args) {
			if (purpose === 'file-from-repo') {
				const [repo, file] = args;
				return `https://${domain}/api/v1/repos/${repo}/raw/${file}`;
			} else if (purpose === 'releases') {
				const [repo] = args;
				return `https://${domain}/api/v1/repos/${repo}/releases`;
			}
		}
	}
}

const getFileFromRepo = async (site, repo, file) => request({
	url: siteTypes[site.type].getURL(site.domain, 'file-from-repo', repo, file),
});

const getRelease = async (site, repo, options={}) => {
	const {getAssets = false} = options;
	let assets = null;
	const rawRelease = JSON.parse(await request({
		url: siteTypes[site.type].getURL(site.domain, 'releases', repo),
	}))[0];
	if (getAssets) {
		assets = await Promise.all(rawRelease.assets.map(async asset => ({
			name: asset.name,
			content: await request({
				url: asset.browser_download_url,
			}),
		})));
	}
	return {
		repo,
		version: rawRelease.tag_name,
		assets,
	}
}

const getPluginsDir = app => {
	return normalizePath(app.vault.configDir + "/plugins") + "/";
}

const getPluginPath = (app, pluginID) => {
	return getPluginsDir(app) + pluginID + "/";
}

const formatPlugin = ({path, galore, manifest}) => {
	const {site, repo, version} = galore;
	const {id, name, author, description} = manifest;
	return {
		path,
		galore,
		manifest,
		site,
		repo,
		version,
		id,
		name,
		author,
		description,
	}
}

const installFromRepo = async (app, site, repo) => {
	try {
		const manifest = JSON.parse(await getFileFromRepo(site, repo, 'manifest.json'));
		const pluginID = manifest.id;
		const pluginPath = getPluginPath(app, pluginID);
		const release = await getRelease(site, repo, {getAssets: true});
		const adapter = app.vault.adapter;
		if (!(await adapter.exists(pluginPath))) {
            await adapter.mkdir(pluginPath);
        }
		const galore = {
			site,
			repo,
			version: release.version,
		};
		await adapter.write(
			pluginPath + ".galore",
			JSON.stringify(galore),
		)
		await Promise.all(release.assets.map(async asset => adapter.write(
			pluginPath + asset.name,
			asset.content,
		)));
		return formatPlugin({path: pluginPath, galore, manifest});
	} catch (error) {
		console.error(error);
		new GaloreErrorModal(app, error).open();
	}
}

const asyncFilter = async (array, func) => {
	const out = Symbol();
	return (await Promise.all(array.map(async item => {
		const isIn = await func(item);
		return isIn ? item : out;
	}))).filter(x => x !== out);
}

const getGalorePlugins = async (app) => {
	try {
		const adapter = app.vault.adapter;
		const pluginsDir = getPluginsDir(app);
		const allPluginPaths = (await adapter.list(pluginsDir)).folders;
		const galorePluginPaths = (await asyncFilter(allPluginPaths, async path => adapter.exists(path + "/.galore"))).map(p => p + "/");
		const galorePlugins = await Promise.all(galorePluginPaths.map(async path => {
			const manifest = JSON.parse(await adapter.read(path + "manifest.json"));
			const galore = JSON.parse(await adapter.read(path + ".galore"));
			const site = galore.site;
			const repo = galore.repo;
			const latestRelease = await getRelease(site, repo);
			const remoteVersion = latestRelease.version;
			const remoteManifest = JSON.parse(await getFileFromRepo(site, repo, 'manifest.json'));
			const currentPlugin = formatPlugin({path, galore, manifest});
			currentPlugin.remote = {
				release: latestRelease,
				manifest: remoteManifest,
				version: remoteVersion,
			}
			currentPlugin.canUpdate = currentPlugin.version !== currentPlugin.remote.version;
			return currentPlugin
		}));
		return galorePlugins;
	} catch (error) {
		console.error(error);
		new GaloreErrorModal(app, error).open();
	}
}

export {
	getPluginsDir,
	installFromRepo,
	getGalorePlugins,
}
