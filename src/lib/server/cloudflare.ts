import { env } from '$env/dynamic/private';

export async function getProjectDomain(projectName: string): Promise<string | undefined> {
	const url = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/pages/projects/${projectName}`;

	const res = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN_PAGES}`
		}
	});

	const data = await res.json();

	if (!data.success) return undefined;
	return data.result.latest_deployment
		? data.result.domains[data.result.domains.length - 1]
		: undefined;
}

export function convertHandleToProjectName(handle: string) {
	return handle.replace(/\./g, '-');
}

export async function createProject({ handle }: { handle: string }) {
	const url = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/pages/projects`;
	const payload = {
		name: convertHandleToProjectName(handle),
		production_branch: 'main',
		build_config: {
			build_caching: true,
			build_command: 'npm run build',
			destination_dir: 'dist'
		},
		deployment_configs: {
			production: {
				env_vars: {
					HANDLE: { type: 'plain_text', value: handle }
				}
			}
		},
		source: {
			type: 'github',
			config: {
				owner: 'flo-bit',
				repo_name: 'bluesky-home',
				deployments_enabled: false
			}
		}
	};

	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN_PAGES}`
		},
		body: JSON.stringify(payload)
	});

	const data = await res.json();

	if (!data.success) throw new Error(JSON.stringify(data.errors));
	return data.result;
}

export async function triggerDeployment({ handle }: { handle: string }) {
	const projectName = convertHandleToProjectName(handle);
	const url = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/pages/projects/${projectName}/deployments`;
	const form = new FormData();
	form.append('branch', 'main');

	const res = await fetch(url, {
		method: 'POST',
		headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN_PAGES}` },
		body: form
	});

	const data = await res.json();

	if (!data.success) throw new Error(JSON.stringify(data.errors));
	return data.result;
}

export async function addCustomDomain({ handle, domain }: { handle: string; domain: string }) {
	const projectName = convertHandleToProjectName(handle);
	const url = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/pages/projects/${projectName}/domains`;
	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN_PAGES}`
		},
		body: JSON.stringify({ name: domain })
	});

	const data = await res.json();

	if (!data.success) throw new Error(JSON.stringify(data.errors));
	return data.result;
}

export async function createDNSRecord({ name, target }: { name: string; target: string }) {
	const url = `https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/dns_records`;
	const payload = {
		type: 'CNAME',
		name,
		content: target,
		ttl: 3600,
		proxied: true,
		comment: 'personal subdomain'
	};

	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN_ZONES}`
		},
		body: JSON.stringify(payload)
	});

	const data = await res.json();
	if (!data.success) throw new Error(JSON.stringify(data.errors));
	return data.result;
}

export async function getDeployment({ handle, id }: { handle: string; id: string }) {
	const projectName = convertHandleToProjectName(handle);
	const url = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/pages/projects/${projectName}/deployments/${id}`;
	const res = await fetch(url, {
		method: 'GET',
		headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN_PAGES}` }
	});

	const data = await res.json();
	if (!data.success) throw new Error(JSON.stringify(data.errors));
	return data.result;
}
