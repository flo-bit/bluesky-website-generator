<script lang="ts" module>
	let accentColor = $state({
		class: '',
		label: ''
	});

	let baseColor = $state({
		class: '',
		label: ''
	});
</script>

<script lang="ts">
	import { Subheading, Paragraph } from '@fuxui/base';
	import { ColorSelect } from '@fuxui/colors';
	import { onMount } from 'svelte';

	let accentColors = [
		{ class: 'text-red-500', label: 'red' },
		{ class: 'text-orange-500', label: 'orange' },
		{ class: 'text-amber-500', label: 'amber' },
		{ class: 'text-yellow-500', label: 'yellow' },
		{ class: 'text-lime-500', label: 'lime' },
		{ class: 'text-green-500', label: 'green' },
		{ class: 'text-emerald-500', label: 'emerald' },
		{ class: 'text-teal-500', label: 'teal' },
		{ class: 'text-cyan-500', label: 'cyan' },
		{ class: 'text-sky-500', label: 'sky' },
		{ class: 'text-blue-500', label: 'blue' },
		{ class: 'text-indigo-500', label: 'indigo' },
		{ class: 'text-violet-500', label: 'violet' },
		{ class: 'text-purple-500', label: 'purple' },
		{ class: 'text-fuchsia-500', label: 'fuchsia' },
		{ class: 'text-pink-500', label: 'pink' },
		{ class: 'text-rose-500', label: 'rose' }
	];

	let baseColors = [
		{ class: 'text-gray-500', label: 'gray' },
		{ class: 'text-stone-500', label: 'stone' },
		{ class: 'text-zinc-500', label: 'zinc' },
		{ class: 'text-neutral-500', label: 'neutral' },
		{ class: 'text-slate-500', label: 'slate' }
	];

	onMount(() => {
		let savedAccentColor = localStorage.getItem('accentColor');
		if (savedAccentColor) {
			accentColor.label = JSON.parse(savedAccentColor);
		} else {
			accentColor.label = 'pink';
		}

		let savedBaseColor = localStorage.getItem('baseColor');
		if (savedBaseColor) {
			baseColor.label = JSON.parse(savedBaseColor);
		} else {
			baseColor.label = 'stone';
		}
	});

	let { showTitle = true } = $props();
</script>

{#if showTitle}
	<Subheading class="mb-4">Select Theme</Subheading>
{/if}

<Paragraph class="mb-2">Accent Color</Paragraph>
<ColorSelect
	bind:selected={accentColor}
	colors={accentColors}
	onselected={(color, previous) => {
		if (typeof previous === 'string' || typeof color === 'string') {
			return;
		}

		document.documentElement.classList.remove(previous.label.toLowerCase());
		document.documentElement.classList.add(color.label.toLowerCase());

		localStorage.setItem('accentColor', JSON.stringify(color.label));

		window.dispatchEvent(
			new CustomEvent('theme-changed', { detail: { accentColor: color.label } })
		);
	}}
	class="w-64"
/>

<Paragraph class="mt-4 mb-2">Base Color</Paragraph>
<ColorSelect
	bind:selected={baseColor}
	colors={baseColors}
	onselected={(color, previous) => {
		if (typeof previous === 'string' || typeof color === 'string') {
			return;
		}

		document.documentElement.classList.remove(previous.label.toLowerCase());
		document.documentElement.classList.add(color.label.toLowerCase());

		localStorage.setItem('baseColor', JSON.stringify(color.label));

		window.dispatchEvent(new CustomEvent('theme-changed', { detail: { baseColor: color.label } }));
	}}
/>
