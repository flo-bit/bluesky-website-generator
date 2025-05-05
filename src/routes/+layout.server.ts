import { convertHandleToProjectName, getProjectDomain } from '$lib/server/cloudflare';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const handle = event.locals.user?.handle;

	if (handle) {
		const projectName = convertHandleToProjectName(handle);
		const project = await getProjectDomain(projectName);
		return {
			user: event.locals.user,
			project
		};
	}
	return { user: event.locals.user, project: '' };
};
