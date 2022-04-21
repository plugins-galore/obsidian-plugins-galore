import { Repo, Release } from './types';
import { request } from './cacheRequest';

const countRegexInString = (str: string, re: RegExp) => ((str || '').match(re) || []).length;

const getKeyWithMax = (obj: any) => Object.keys(obj).reduce((a: string | null, b: string) => obj[a] >= obj[b] ? a : b, null);

const parseRepoURL = async (url: string) => {
	let urlObj = null;
	try {
		urlObj = new URL(url);
	} catch (e) {
		urlObj = new URL('https://'+url);
	}
	const domain = urlObj.hostname;
	let path = urlObj.pathname;
	if (path[0] === '/') {
		path = path.slice(1);
	}
	const pathParts = path.split('/');
	const owner = pathParts[0];
	const name = pathParts[1];

	const originBody = await request({url: urlObj.origin});

	const typeScores = {
		github: countRegexInString(originBody, /github/gi),
		gitea: countRegexInString(originBody, /gitea/gi),
		gitlab: countRegexInString(originBody, /gitlab/gi),
	}
	const type = getKeyWithMax(typeScores);

	return {
		domain,
		owner,
		name,
		url,
		type,
	}
}

const getRelease = async (repo: Repo, options?: any) => {
	const {type, domain, owner, name} = repo;
	const {allowPrerelease = false} = options || {};
	let release = null;
	if (type === "github") {
		const rawReleases = JSON.parse(await request({
			url: `https://api.${domain}/repos/${owner}/${name}/releases`,
		}));
		const rawRelease: any = rawReleases.filter((x: any) => !x.draft && (allowPrerelease || !x.prerelease)).sort((x: any) => x.published_at)[0]
		release = {
			version: rawRelease.tag_name,
			assets: rawRelease.assets.map((asset: any) => ({
				name: asset.name,
				url: asset.browser_download_url,
			})),
		}
	} else if (type === "gitea") {
		const rawReleases = JSON.parse(await request({
			url: `https://${domain}/api/v1/repos/${owner}/${name}/releases`,
		}));
		const rawRelease: any = rawReleases.filter((x: any) => !x.draft && (allowPrerelease || !x.prerelease)).sort((x: any) => x.published_at)[0]
		release = {
			version: rawRelease.tag_name,
			assets: rawRelease.assets.map((asset: any) => ({
				name: asset.name,
				url: asset.browser_download_url,
			})),
		}
	} else if (type === "gitlab") {
		const rawReleases = JSON.parse(await request({
			url: `https://${domain}/api/v4/projects/${owner}%2F${name}/releases`,
		}));
		const rawRelease: any = rawReleases.filter((x: any) => allowPrerelease || !x.upcoming_release).sort((x: any) => x.published_at)[0]
		release = {
			version: rawRelease.tag_name,
			assets: rawRelease.assets.links.map((asset: any) => ({
				name: asset.name,
				url: asset.direct_asset_url,
			})),
		}
	}
	return release;
}

const getAsset = async (release: Release, name: string) => {
	const asset = release.assets.filter(asset => asset.name === name)[0];
	if (!asset) {
		return null;
	}
	return request({
		url: asset.url,
	});
}

const getAssets = async (release: Release, names?: Array<string>) => {
	const assets = names ? release.assets.filter(asset => names.includes(asset.name)) : release.assets;
	return Promise.all(assets.map(async asset => ({name: asset.name, content: await request({url: asset.url})})));
}

export {
	parseRepoURL,
	getRelease,
	getAsset,
	getAssets,
}
