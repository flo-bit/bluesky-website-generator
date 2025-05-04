<script>
	import { Button, Tabs } from '@fuxui/base';
	import { BlueskyLogin, UserProfile } from '@fuxui/social';

	let { data } = $props();
</script>

<div class="mx-auto max-w-2xl">
	{#if !data.user}
		<BlueskyLogin
			login={async (handle) => {
				// create and submit form with handle
				const form = document.createElement('form');
				form.action = '/?/login';
				form.method = 'POST';
				form.innerHTML = `<input type="hidden" name="handle" value="${handle}">`;

				// submit form
				document.body.appendChild(form);
				form.submit();

				return true;
			}}
			formAction="/login"
			formMethod="POST"
		/>
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

		<form method="POST" action="/?/logout">
			<Button type="submit">Logout</Button>
		</form>
	{/if}
</div>
