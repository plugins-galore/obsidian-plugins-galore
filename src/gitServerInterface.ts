import { request } from 'obsidian';

// https://gitlab.com/api/v4/projects/gitlab-org%2Fgitlab/releases

const parseRepoURL = (type, url) => {
	// TODO: make this get domain, owner, and name, from a url.
}

const getRelease = async (repo, options) => {
	const {domain, owner, name} = parseRepoURL(repo.url);
	const {allowPrerelease = false} = options || {};
	if (type === "github") {
		const rawReleases = JSON.parse(await request({
			url: `https://api.${domain}/repos/${owner}/${name}/releases`,
		}));
		const rawRelease = rawReleases.filter(x => !x.draft && (allowPrerelease || !x.prerelease)).sort('published_at')[0]
		const release = {
			version: rawRelease.tag_name,
			assets: rawRelease.assets.map(asset => ({
				name: asset.name,
				url: asset.browser_download_url,
			})),
		}
	} else if (type === "gitea") {
		const rawReleases = JSON.parse(await request({
			url: `https://${domain}/api/v1/repos/${owner}/${name}/releases`,
		}));
		const rawRelease = rawReleases.filter(x => !x.draft && (allowPrerelease || !x.prerelease)).sort('published_at')[0]
		const release = {
			version: rawRelease.tag_name,
			assets: rawRelease.assets.map(asset => ({
				name: asset.name,
				url: asset.browser_download_url,
			})),
		}
	} else if (type === "gitlab") {
		const rawReleases = JSON.parse(await request({
			url: `https://${domain}/api/v4/projects/${owner}%2F${name}/releases`,
		}));
		const rawRelease = rawReleases.filter(x => allowPrerelease || !x.upcoming_release).sort('published_at')[0]
		const release = {
			version: rawRelease.tag_name,
			assets: rawRelease.assets.links.map(asset => ({
				name: asset.name,
				url: asset.direct_asset_url,
			})),
		}
	}
	return release;
}

const getAsset = async (release, name) => {
	const asset = release.assets.filter(asset => asset.name === name)[0];
	if (!asset) {
		return null;
	}
	return request({
		url: asset.url,
	});
}

const getAssets = async (release, names) => {
	const assets = names ? release.assets.filter(asset => names.includes(asset.name)) : release.assets;
	return Promise.all(assets.map(async asset => request({url: asset.url})));
}

export {
	parseRepoURL,
	getRelease,
	getAsset,
	getAssets,
}
