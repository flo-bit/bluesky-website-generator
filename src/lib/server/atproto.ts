import type { Agent } from '@atproto/api';

export async function updateLinks({
	links,
	agent,
	did
}: {
	links: {
		title: string;
		url: string;
		description: string;
	}[];
	agent: Agent;
	did: string;
}) {
	const record: {
		repo: string;
		collection: string;
		rkey: string;
		record: {
			links: {
				title: string;
				url: string;
				description: string;
			}[];
			createdAt: string;
		};
	} = {
		repo: did,
		collection: 'dev.flo-bit.links',
		rkey: 'self',
		record: {
			links,
			createdAt: new Date().toISOString()
		}
	};
	await agent.com.atproto.repo.putRecord(record);
}

export async function updateAbout({
	about,
	agent,
	did
}: {
	about: string;
	agent: Agent;
	did: string;
}) {
	const record: {
		repo: string;
		collection: string;
		rkey: string;
		record: {
			about: string;
			createdAt: string;
		};
	} = {
		repo: did,
		collection: 'dev.flo-bit.about',
		rkey: 'self',
		record: {
			about,
			createdAt: new Date().toISOString()
		}
	};
	await agent.com.atproto.repo.putRecord(record);
}
