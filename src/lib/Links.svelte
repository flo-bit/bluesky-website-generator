<script lang="ts">
	let { links } = $props();
</script>

<div class="mt-6 flex flex-col gap-6 px-4 text-white">
	{#each links as link}
		<div>
			<a href={link.url} target="_blank" class="text-accent-600 dark:text-accent-400 font-medium">
				{link.title}
			</a>

			<div class="text-base-600 dark:text-base-400 mt-1 text-sm">
				{link.description}
			</div>
		</div>
	{/each}
</div>
