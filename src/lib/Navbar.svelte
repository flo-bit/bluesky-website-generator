<script lang="ts">
	import { ThemeToggle, Navbar } from '@fuxui/base';
	import ThemeSelectDropdown from './ThemeSelectDropdown.svelte';
	import Deploy from './Deploy.svelte';

	let { handle, domain }: { handle: string, domain?: string } = $props();
</script>

<Navbar>
	<div></div>
	<div class="flex items-center gap-3">
		<ThemeSelectDropdown />
		<ThemeToggle class="backdrop-blur-none" />
		<Deploy {handle} existingDomain={domain} />
	</div>
</Navbar>
