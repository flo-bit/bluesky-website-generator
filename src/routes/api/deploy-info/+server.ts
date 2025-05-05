import { error, type RequestEvent } from '@sveltejs/kit';
import { AtpBaseClient } from '@atproto/api';
import { getDeployment } from '$lib/server/cloudflare';

export async function POST({ request, locals }: RequestEvent) {
	const user = locals.user;
	const agent = locals.agent;
	if (!user || !agent || agent instanceof AtpBaseClient) {
		return error(401, 'Unauthorized API call');
	}

	const handle = user.handle;

	const {
		id
	}: {
		id: string;
	} = await request.json();

	const deployment = await getDeployment({ handle, id });

	const isDone =
		deployment.latest_stage?.name === 'deploy' && deployment.latest_stage?.status === 'success';

	return new Response(JSON.stringify({ done: isDone }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
}
