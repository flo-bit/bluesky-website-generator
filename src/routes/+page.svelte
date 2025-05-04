<script lang="ts">
	import { Button, Tabs } from '@fuxui/base';
	import { BlueskyLogin, UserProfile } from '@fuxui/social';

	let { data } = $props();

	let form = $state<HTMLFormElement | null>(null);
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

		<form method="POST" class="hidden" bind:this={form}>
			<input type="hidden" name="handle" value="handle">
		</form>
	{:else}
		<Button size="lg" class="absolute top-2 right-2">Publish</Button>
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
<!-- 
		<form method="POST" action="/?/logout">
			<Button type="submit">Logout</Button>
		</form> -->
	{/if}
</div>
