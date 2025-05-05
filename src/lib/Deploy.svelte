<script lang="ts">
	import { Button, Modal, Input, toast, Heading, Label, Paragraph } from '@fuxui/base';
	import TurndownService from 'turndown';
	import { Undraw, launchConfetti } from '@fuxui/visual';
	import svg from './assets/waiting.svg?raw';
	import { Stopwatch, StopwatchState } from '@fuxui/time';

	import { editingState } from '../routes/state.svelte';
	import { onMount } from 'svelte';

	async function checkDeployment(deploymentId: string) {
		const res = await fetch('/api/deploy-info', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id: deploymentId })
		});

		const data = await res.json();

		console.log('deployment status', data);
		return data.done as boolean;
	}

	async function deploy() {
		var turndownService = new TurndownService({
			headingStyle: 'atx',
			bulletListMarker: '-'
		});
		const markdown = turndownService.turndown(editingState.aboutHTML);

		success = false;
		stopwatch = new StopwatchState();
		stopwatch?.reset();
		stopwatch?.start();
		open = false;
		openUpdate = true;

		const res = await fetch('/api/deploy', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				projectName: handle.replace(/\./g, '-'),
				domain: domain + '.flo-bit.dev',
				profileHandle: handle,
				about: markdown,
				links: editingState.links
			})
		});

		const data = await res.json();

		if (!res.ok) {
			console.error(data.error);
			toast.error('Error!', {
				description: JSON.parse(data.error)[0].message
			});
			
			return;
		}

		const deploymentId = data.deploymentId;

		const interval = setInterval(async () => {
			console.log('checking deployment status');
			const done = await checkDeployment(deploymentId);
			if (done) {
				console.log('deployment done');
				clearInterval(interval);
				success = true;
				openUpdate = true;
				stopwatch?.stop();
				launchConfetti();
			}
		}, 5000);
	}

	let { handle, existingDomain }: { handle: string; existingDomain?: string } = $props();

	let domain = $state(handle.split('.')[0]);
	let open = $state(false);

	let openUpdate = $state(false);

	let success = $state(false);
	let stopwatch: StopwatchState | undefined = $state();
</script>

<Button
	onclick={() => {
		if (existingDomain) {
			deploy();
		} else {
			open = true;
		}
	}}
	size="lg"
>
	{existingDomain ? 'Update' : 'Publish'}
</Button>

<Modal bind:open>
	<Heading>Publish Your Website</Heading>
	<form onsubmit={deploy} class="flex flex-col gap-4">
		<Label>Subdomain</Label>
		<Input placeholder={'your subdomain'} bind:value={domain} />
		<div class="flex justify-end">
			<Button type="submit" class="w-fit">Create & Deploy</Button>
		</div>
	</form>
</Modal>

<Modal bind:open={openUpdate} class="flex flex-col items-center justify-center">
	{#if !success}
		<Heading class="mb-8 text-center text-pretty"
			>One second, please. <br />We're building your website...</Heading
		>
		<Undraw
			{svg}
			alt="Waiting"
			class="w-1/3"
			colorMap={{
				'#3f3d56': 'fill-base-700 dark:fill-base-800'
			}}
		/>
		<Paragraph>This usually takes around 1 minute.</Paragraph>
		<Stopwatch class="text-xl" bind:stopwatch />
	{:else}
		<Heading>Aaand we're done!</Heading>
		<Paragraph>Your website has been built successfully.</Paragraph>

		<Button href={existingDomain ? `https://${existingDomain}` : `https://${domain}.flo-bit.dev`} class="mt-4" target="_blank" size="lg">Open website</Button>
	{/if}
</Modal>
