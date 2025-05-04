<script lang="ts">
	import { Post, type PostData } from '@fuxui/social';

	let { posts }: { posts: PostData[] } = $props();
</script>

<div class="mt-4">
	{#if posts}
		{#each posts as post}
			<Post data={post} class="py-4">hello</Post>
		{/each}
	{/if}
</div>