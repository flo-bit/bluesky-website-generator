<script lang="ts">
	import { toast, Subheading, Input, Button } from '@fuxui/base';
	import { editingState } from '../routes/state.svelte';

	let { links } = $props();

	let link = $state('');

	let loading = $state(false);

	async function addLink(event: Event) {
		event.preventDefault();
		if (loading) return;
		loading = true;

		// check if link is already in the list
		if (editingState.links.some((l) => l.url === link)) {
			toast.error('Link already exists');
			loading = false;
			return;
		}

		const response = await fetch(`/api/get-og?url=${link}`);
		const og = await response.json();

		if (!og.success) {
			toast.error('Invalid link');
			loading = false;
			return;
		}

		editingState.links.push({
			url: link,
			title: og.ogTitle,
			description: og.ogDescription,
			image: og.ogImage?.[0]?.url
		});

		// save links to local storage
		localStorage.setItem('links', JSON.stringify(editingState.links));

		link = '';
		loading = false;

		toast('Link added');

		console.log(editingState.links);
	}

	function removeLink(url: string) {
		editingState.links = editingState.links.filter((l) => l.url !== url);
		localStorage.setItem('links', JSON.stringify(editingState.links));
	}
</script>

<div class="px-2">
	<Subheading class="mt-4 mb-4">Add a link:</Subheading>
	<form onsubmit={addLink} class="flex gap-2">
		<Input bind:value={link} name="link" class="grow" />
		<Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add'}</Button>
	</form>
</div>
<div class="mt-6 flex flex-col gap-6 px-4 text-white">
	{#each links as link}
		<div class="relative">
			<a href={link.url} target="_blank" class="text-accent-600 dark:text-accent-400 font-medium">
				{link.title}
			</a>

			<div class="text-base-600 dark:text-base-400 mt-1 text-sm">
				{link.description}
			</div>

			<Button
				onclick={() => removeLink(link.url)}
				variant="secondary"
				size="iconSm"
				class="absolute top-0 right-0"
			>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
			  </svg>
			  

			  <span class="sr-only">remove link</span>
			</Button>
		</div>
	{/each}
</div>
