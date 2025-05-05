import { error, type RequestEvent } from '@sveltejs/kit';
import { updateAbout, updateLinks } from '$lib/server/atproto';
import { AtpBaseClient } from '@atproto/api';
import {
	createProject,
	addCustomDomain,
	createDNSRecord,
	triggerDeployment,
	getProjectDomain,
	convertHandleToProjectName
} from '$lib/server/cloudflare';

export async function POST({ request, locals }: RequestEvent) {
	const user = locals.user;
	const agent = locals.agent;
	if (!user || !agent || agent instanceof AtpBaseClient) {
		return error(401, 'Unauthorized API call');
	}

	const did = user.did;
	const handle = user.handle;

	const {
		domain,
		about,
		links
	}: {
		domain: string;
		about: string;
		links: {
			title: string;
			url: string;
			description: string;
		}[];
	} = await request.json();

	updateLinks({
		links,
		agent,
		did
	});
	updateAbout({
		about,
		agent,
		did
	});

	const projectName = convertHandleToProjectName(handle);

	console.log('deploying', projectName);

	// check if project already exists
	const project = await getProjectDomain(projectName);
	if (project) {
		// just trigger a deployment
		const deployment = await triggerDeployment({ handle });

		return new Response(JSON.stringify({ deploymentId: deployment.id }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const project = await createProject({ handle });
		const devSubdomain = project.subdomain;
		const deployment = await triggerDeployment({ handle });
		await addCustomDomain({ handle, domain });
		await createDNSRecord({ name: domain, target: devSubdomain });

		return new Response(JSON.stringify({ deploymentId: deployment.id }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return new Response(JSON.stringify({ error: (error as any).message }), { status: 500 });
	}
}
