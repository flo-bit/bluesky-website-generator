import { error, json, type RequestHandler } from '@sveltejs/kit';
import { AtpBaseClient } from '@atproto/api';
import ogs from 'open-graph-scraper';

export const GET: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	const agent = locals.agent;
	if (!user || !agent || agent instanceof AtpBaseClient) {
		return error(401, 'Unauthorized API call');
	}
	const url = new URL(request.url).searchParams.get('url');
	if (!url) {
		return error(400, 'URL is required');
	}

	const og = await ogs({ url });

	return json(og.result);
};
