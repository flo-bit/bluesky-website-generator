<script lang="ts">
	import { Button, Tabs, Input } from '@fuxui/base';
	import { BlueskyLogin, UserProfile } from '@fuxui/social';

	let value = $state('');

	let { data } = $props();
	let form = $state<HTMLFormElement | null>(null);

	async function deploy() {
		const res = await fetch('/api/cloudflare', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				projectName: data.user.handle.replace(/\./g, '-'),
				domain: value + '.polijn.com',
				profileHandle: data.user.handle
			})
		});

		// const data = await res.json();
		// if (!res.ok) {
		// 	alert('Error: ' + data.error);
		// } else {
		// 	alert('Success!);
		// }
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
		<!-- Publish -->
		<Button size="lg" class="absolute top-2 right-2">Publish</Button>
		<!-- create & deploy -->
		<Input
			sizeVariant="lg"
			class=" top-2 right-2"
			placeholder={data.user.handle.split('.')[0]}
			bind:value
		/>
		<Button onclick={deploy} size="lg" class=" top-2 right-2">Create & Deploy</Button>

		<UserProfile class="" profile={{ ...data.user, description: '' }} />
		<Tabs
			active="About"
			items={[
				{
					name: 'About',
					href: '/about'
				},
				{
					name: 'Links',
					href: '/links'
				},
				{
					name: 'Feed',
					href: '/feed'
				}
			]}
		/>

		<form method="POST" action="/?/logout" class="mt-4">
			<Button type="submit">Logout</Button>
		</form>
	{/if}
</div>
