import { request } from 'obsidian';

const cache = [];

const cacheRequest = async (req) => {
	const filteredCache = cache.filter(item => item.req === JSON.stringify(req));
	if (!filteredCache.length) {
		return filteredCache[0];
	}
	const res = await request(req);
	cache.push({req, res});
	return res;
}

export {
	cacheRequest as request,
}
