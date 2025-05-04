<script>
	import { Button } from '@fuxui/base';
	import { BlueskyLogin } from '@fuxui/social';

	let { data } = $props();
</script>

<div class="flex h-screen flex-col items-center justify-center">
	{#if !data.user}
		<BlueskyLogin
			login={async (handle) => {
				console.log(handle);

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
		<p class="text-base-900 dark:text-base-50 text-2xl font-bold">
			Welcome {data.user.displayName}
		</p>
	{/if}
</div>
