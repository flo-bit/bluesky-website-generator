<script lang="ts">
	import { Badge, Button, Heading, Input, Subheading, Tabs } from '@fuxui/base';
	import { BlueskyLogin, UserProfile } from '@fuxui/social';
	import { editingState } from './state.svelte.js';
	import Editor from '$lib/Editor.svelte';
	import Posts from '$lib/Posts.svelte';
	import Links from '$lib/Links.svelte';

	let { data } = $props();

	let form = $state<HTMLFormElement | null>(null);

	let link = $state('');

	async function addLink(event: Event) {
		event.preventDefault();

		// check if link is already in the list
		if (editingState.links.some((l) => l.url === link)) {
			return;
		}

		const response = await fetch(`/api/get-og?url=${link}`);
		const og = await response.json();

		if(!og.success) return;

		editingState.links.push({
			url: link,
			title: og.ogTitle,
			description: og.ogDescription,
			image: og.ogImage?.[0]?.url
		});

		// save links to local storage
		localStorage.setItem('links', JSON.stringify(editingState.links));

		link = '';

		console.log(editingState.links);
	}
</script>

<div class="mx-auto max-w-2xl">
	{#if !data.user}
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
		<Button size="lg" class="fixed top-2 right-2">Publish</Button>
		<UserProfile class="" profile={{ ...data.user, description: '' }} />

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
					class="focus-within:outline-accent-400 hover:bg-base-900/20 group focus-within:bg-accent-500/5 focus-within:hover:bg-accent-500/5 relative mt-4 rounded-2xl px-2 py-0.5 focus-within:outline"
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
					<div class="px-2">
						<Subheading class="mb-4 mt-4">Add a link:</Subheading>
						<form onsubmit={addLink} class="flex gap-2">
							<Input bind:value={link} name="link" class="grow" />
							<Button type="submit">Add</Button>
						</form>
					</div>
					<Links links={editingState.links} />
				</div>
			{:else if editingState.active === 'feed'}
				<Posts did={data.user.did} />
			{/if}
		</div>

		<form method="POST" action="/?/logout" class="fixed right-2 bottom-2">
			<Button type="submit">Logout</Button>
		</form>
	{/if}
</div>
