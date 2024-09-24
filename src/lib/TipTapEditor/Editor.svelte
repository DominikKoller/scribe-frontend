<!-- frontend/src/lib/Editor.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor as TipTapEditor, type Extension } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';

	import Underline from '@tiptap/extension-underline';
	import Collaboration from '@tiptap/extension-collaboration';
	import { HocuspocusProvider } from '@hocuspocus/provider';
	import * as Y from 'yjs';
	import { authToken } from '$lib/stores/auth';

	import { PUBLIC_HOCUSPOCUS_URL } from '$env/static/public';

	import { CommentExtension } from '$lib/TipTapEditor/CommentExtension';
	import { createCommentDecorationPlugin } from '$lib/TipTapEditor/CommentDecorationPlugin';
	import Toolbar from '$lib/TipTapEditor/Toolbar.svelte';
	import CommentsPanel from '$lib/TipTapEditor/CommentsPanel.svelte';

	import { writable, type Writable } from 'svelte/store';
	import type { CommentType } from './Types';

	export let documentId: string;
	export let extensions: Extension[] = [];
	export let commentsStore: Writable<any[]> = writable([]);

	let editor: TipTapEditor | null;
	let editorContainer: HTMLDivElement;

	let ydoc: Y.Doc;
	let provider: HocuspocusProvider;
	let commentsYArray: Y.Array<CommentType>;

	let selectedCommentIdStore: Writable<string | null> = writable(null);

	onMount(() => {
		console.log('outer onmount');
		ydoc = new Y.Doc();
		provider = new HocuspocusProvider({
			url: PUBLIC_HOCUSPOCUS_URL,
			name: documentId,
			document: ydoc,
			token: $authToken
		});

		commentsYArray = ydoc.getArray('comments');
		$commentsStore = commentsYArray.toJSON();

		commentsYArray.observe((event) => {
			$commentsStore = commentsYArray.toJSON();
		});

		editor = new TipTapEditor({
			element: editorContainer,
			extensions: [
				StarterKit,
				Underline,
				...extensions,
				Collaboration.configure({
					document: ydoc
				}),
				CommentExtension
			]
		});

		editor.registerPlugin(createCommentDecorationPlugin(selectedCommentIdStore));

		selectedCommentIdStore.subscribe((_) => {
			// NOTE this is pretty slow. 
			// We should do something more selective to make sure the comment decorations are updated
			editor?.view.dispatch(editor.view.state.tr);
		});

		editor.on('comment:select', (commentId) => {
			$selectedCommentIdStore = commentId;
		});

		editor.view.dom.addEventListener('click', (event) => {
			const target = event.target as Element;
			if (target && !target.closest('.comment-mark')) {
				$selectedCommentIdStore = null;
			}
		});
	});

	onDestroy(() => {
		provider?.destroy();
		editor?.destroy();
	});
</script>

<div class="editor-container">
	<slot name="toolbar">
		{#if editor}
			<Toolbar {editor} {commentsYArray} />
		{/if}
	</slot>
	<div class="editor-wrapper">
		<div class="editor" bind:this={editorContainer}></div>
		<slot name="comments-panel">
			{#if editor}
				<CommentsPanel {editor} {commentsYArray} {commentsStore} {selectedCommentIdStore} />
			{/if}
		</slot>
	</div>
</div>

<style>
	.editor-wrapper {
		display: flex;
	}

	.editor {
		flex: 1;
		min-height: 600px;
		font-size: 16px;
		border-right: 1px solid #ccc;
		padding-right: 10px;
	}

	.comments-section {
		width: 300px;
		padding-left: 10px;
	}

	.comments-section h3 {
		margin-top: 0;
	}

	.editor-toolbar {
		display: flex;
		gap: 8px;
		margin-bottom: 8px;
		position: sticky;
		top: 80px; /* Adjust based on header height */
		background-color: rgba(255, 255, 255, 0.9);
		padding: 10px;
		z-index: 999;
		border-bottom: 1px solid #ccc;
	}

	.editor-toolbar button {
		padding: 6px 10px;
		font-size: 16px;
		background: none;
		border: none;
		cursor: pointer;
		border-radius: 4px;
	}

	.editor-toolbar button.active {
		background-color: #ddd;
	}

	.editor-toolbar button:hover {
		background-color: #eee;
	}

	:global(.comment-mark) {
		background-color: lightgreen;
	}

	:global(.comment-mark.selected) {
		background-color: orange;
	}

	:global(.comments-section) {
		margin-top: 20px;
		border-top: 1px solid #ccc;
		padding-top: 10px;
	}

	:global(.comment) {
		cursor: pointer;
		padding: 5px;
	}

	:global(.comment.selected) {
		background-color: #eef;
	}
</style>
