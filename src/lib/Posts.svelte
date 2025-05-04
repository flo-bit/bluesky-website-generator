<script lang="ts">
	import { AtpBaseClient, type Agent } from '@atproto/api';
	import type { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
	import { blueskyPostToPostData, Post, type PostData } from '@fuxui/social';
	import { onMount } from 'svelte';

	export async function getPostsOfUser({
		actor,
		cursor,
		limit = 20
	}: {
		actor: string;
		cursor?: string;
		limit?: number;
	}) {
		let agent = new AtpBaseClient({ service: 'https://api.bsky.app' });
		const perLimit = limit > 100 ? 100 : limit;
		const posts: FeedViewPost[] = [];
		do {
			const { data } = await agent.app.bsky.feed.getAuthorFeed({
				actor,
				cursor,
				limit: perLimit,
				filter: 'posts_no_replies'
			});
			posts.push(...data.feed);
			cursor = data.cursor;
		} while (cursor && posts.length < limit);
		return { feed: posts, cursor };
	}

	let { did } = $props();

	let blueskyPosts: PostData[] = $state([]);

	onMount(async () => {
		const posts = await getPostsOfUser({ actor: did });
		console.log(posts);

		blueskyPosts = posts.feed.map((post) => {
			console.log(post);
			return blueskyPostToPostData(post.post);
		});
	});
</script>

<div class="mt-4">
{#if blueskyPosts}
	{#each blueskyPosts as post}
		<Post data={post} class="py-4">hello</Post>
	{/each}
{/if}
</div>