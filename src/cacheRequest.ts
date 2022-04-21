import { request } from 'obsidian';

const cache = [];

const cacheRequest = async (req) => {
	const filteredCache = cache.filter(item => item.req === JSON.stringify(req));
	if (filteredCache.length) {
		return filteredCache[0].res;
	}
	const res = await request(req);
	cache.push({req: JSON.stringify(req), res});
	return res;
}

export {
	cacheRequest as request,
}
