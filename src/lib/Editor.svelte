<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Image from '@tiptap/extension-image';
	import Placeholder from '@tiptap/extension-placeholder';
	import Link from '@tiptap/extension-link'
	import { Prose } from '@fuxui/base';
	import { editingState } from '../routes/state.svelte';

	let element: HTMLElement | undefined = $state();
	let editor: Editor | null = $state(null);

	onMount(() => {
		if (!element || editor) return;

		if(!editingState.aboutContent) {
			editingState.aboutContent = JSON.parse(localStorage.getItem('aboutContent') ?? '{}');
		}

		editor = new Editor({
			element: element,
			extensions: [
				StarterKit.configure({
					history: false
				}),
				Image.configure(),
				Link.configure({
					openOnClick: false
				}),
				Placeholder.configure({
					placeholder: 'Write something about yourself...'
				})
			],
			onTransaction: () => {
				editor = editor;
				editingState.aboutContent = editor?.getJSON() ?? { type: "doc", content: [] };
				editingState.aboutHTML = editor?.getHTML() ?? '';
				
				// save to local storage
				localStorage.setItem('aboutContent', JSON.stringify(editingState.aboutContent));
			},

			content: editingState.aboutContent,

			editorProps: {
				attributes: {
					class: 'outline-none prose-headings:mt-2'
				}
			}
		});
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});
</script>

<Prose>
	<div bind:this={element}></div>
</Prose>

<style>
	:global(.tiptap p.is-editor-empty:first-child::before) {
		color: var(--color-base-100);
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
	}
	:global(.dark .tiptap p.is-editor-empty:first-child::before) {
		color: var(--color-base-200);
	}
</style>