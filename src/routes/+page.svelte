<script lang="ts">
	import {
		Badge,
		Button,
		Heading,
		Input,
		Modal,
		Subheading,
		Tabs,
		ThemeToggle,
		toast,
		Toaster
	} from '@fuxui/base';
	import { BlueskyLogin, blueskyPostToPostData, UserProfile, type PostData } from '@fuxui/social';
	import { editingState } from './state.svelte.js';
	import Editor from '$lib/Editor.svelte';
	import Posts from '$lib/Posts.svelte';
	import Links from '$lib/Links.svelte';
	import { onMount } from 'svelte';
	import { AtpBaseClient } from '@atproto/api';
	import type { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs.js';
	import Navbar from '$lib/Navbar.svelte';

	let { data } = $props();
	let form = $state<HTMLFormElement | null>(null);

	onMount(async () => {
		editingState.links = JSON.parse(localStorage.getItem('links') ?? '[]');

		if (!data.user) return;

		const posts = await getPostsOfUser({ actor: data.user.did });
		blueskyPosts = posts.feed.map((post) => {
			return blueskyPostToPostData(post.post);
		});
	});

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

	let blueskyPosts: PostData[] = $state([]);
</script>

<div class="mx-auto max-w-2xl py-16">
	{#if !data.user}
		<Heading class="mt-16 mb-8">Login with Bluesky to create your website</Heading>
		<BlueskyLogin
			login={async (handle) => {
				// create and submit form with handle

				if (!form) {
					console.error('Form not found');
					return false;
				}

				// set handle
				const input = form.querySelector('input[name="handle"]') as HTMLInputElement;
				if (!input) {
					return false;
				}
				input.value = handle;
				form.submit();

				return true;
			}}
		/>

		<form method="POST" action="/?/login" class="hidden" bind:this={form}>
			<input type="hidden" name="handle" value="handle" />
		</form>
	{:else}
		<UserProfile class="" profile={{ ...data.user, description: undefined }} />

		<div class="-mt-8">
			<Tabs
				active={editingState.active}
				items={[
					{
						name: 'about',
						onclick: () => (editingState.active = 'about')
					},
					{
						name: 'links',
						onclick: () => (editingState.active = 'links')
					},
					{
						name: 'feed',
						onclick: () => (editingState.active = 'feed')
					}
				]}
			/>

			<div class="px-4">
				{#if editingState.active === 'about'}
					<div
						class="focus-within:outline-accent-400 hover:not-focus-within:bg-base-200/40 dark:hover:not-focus-within:bg-base-900/20 group focus-within:bg-accent-500/5 relative mt-4 rounded-2xl px-2 py-0.5 focus-within:outline"
					>
						<Editor />
						<Badge
							variant="secondary"
							class="absolute top-2 right-2 opacity-60 group-focus-within:hidden"
						>
							Select to edit
						</Badge>
					</div>
				{:else if editingState.active === 'links'}
					<div>
						<Links links={editingState.links} />
					</div>
				{:else if editingState.active === 'feed'}
					<Posts posts={blueskyPosts} />
				{/if}
			</div>

			<form method="POST" action="/?/logout" class="fixed right-2 bottom-2">
				<Button variant="secondary" type="submit">Logout</Button>
			</form>
		</div>
	{/if}
</div>

<Toaster />

{#if data.user}
	<Navbar handle={data.user.handle} domain={data.project} />
{/if}
