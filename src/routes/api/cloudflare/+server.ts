import type { RequestEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const ACCOUNT_ID = env.CLOUDFLARE_ACCOUNT_ID;
const ZONE_ID = env.CLOUDFLARE_ZONE_ID;
const PAGES_TOKEN = env.CLOUDFLARE_API_TOKEN_PAGES;
const ZONES_TOKEN = env.CLOUDFLARE_API_TOKEN_ZONES;

async function createPagesProject(projectName: string, profileHandle: string) {
	const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects`;
	const payload = {
		name: projectName,
		production_branch: 'main',
		build_config: {
			build_caching: true,
			build_command: 'npm run build',
			destination_dir: 'dist'
		},
		deployment_configs: {
			production: {
				env_vars: {
					HANDLE: { type: 'plain_text', value: profileHandle }
				}
			}
		},
		source: {
			type: 'github',
			config: {
				owner: 'polijn',
				repo_name: 'bluesky-home',
				deployments_enabled: false
			}
		}
	};

	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${PAGES_TOKEN}`
		},
		body: JSON.stringify(payload)
	});

	const data = await res.json();
	console.log('createPagesProject:');
	console.log(data);
	if (!data.success) throw new Error(JSON.stringify(data.errors));
	return data.result;
}

async function triggerDeployment(projectName: string) {
	const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${projectName}/deployments`;
	const form = new FormData();
	form.append('branch', 'main');

	const res = await fetch(url, {
		method: 'POST',
		headers: { Authorization: `Bearer ${PAGES_TOKEN}` },
		body: form
	});

	const data = await res.json();
	console.log('triggerDeployment:');
	console.log(data);
	if (!data.success) throw new Error(JSON.stringify(data.errors));
	return data.result;
}

async function addCustomDomain(projectName: string, domain: string) {
	const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${projectName}/domains`;
	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${PAGES_TOKEN}`
		},
		body: JSON.stringify({ name: domain })
	});

	const data = await res.json();
	console.log('addCustomDomain:');
	console.log(data);
	if (!data.success) throw new Error(JSON.stringify(data.errors));
	return data.result;
}

async function createDNSRecord(name: string, target: string) {
	const url = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`;
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
			Authorization: `Bearer ${ZONES_TOKEN}`
		},
		body: JSON.stringify(payload)
	});

	const data = await res.json();
	console.log('createDNSRecord:');
	console.log(data);
	if (!data.success) throw new Error(JSON.stringify(data.errors));
	return data.result;
}

export async function POST(event: RequestEvent) {
	const { projectName, domain, profileHandle } = await event.request.json();

	try {
		const project = await createPagesProject(projectName, profileHandle);
		const devSubdomain = project.subdomain;
		await new Promise((resolve) => setTimeout(resolve, 2000));
		const domainResult = await addCustomDomain(projectName, domain);
		await new Promise((resolve) => setTimeout(resolve, 2000));
		const dnsRecordId = await createDNSRecord(domain, devSubdomain);
		await new Promise((resolve) => setTimeout(resolve, 2000));
		const deploymentResult = await triggerDeployment(projectName);

		// , devSubdomain, bindingId, dnsRecordId
		return new Response(JSON.stringify({ project }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
}
