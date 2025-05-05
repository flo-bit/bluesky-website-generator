import type { Content } from '@tiptap/core';

export const editingState = $state({
	active: 'about' as 'about' | 'links' | 'feed',
	aboutContent: '' as Content,
	links: [] as { url: string; title: string; description: string; image?: string }[],
	aboutHTML: '' as string
});
