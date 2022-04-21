type Repo = {
	type: string,
	domain: string,
	owner: string,
	name: string,
	url: string,
}

type Release = {
	version: string,
	assets: Array<{
		name: string,
		url: string,
	}>
}

type PluginForGalore = {
	galore: any,
	manifest: any,
	assets: any,
}

export type {
	Repo,
	Release,
	PluginForGalore,
}
