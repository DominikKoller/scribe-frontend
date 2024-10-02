<!-- frontend/src/TipTapEditor/Editor.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor as TipTapEditor, type Extension } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import { Color } from '@tiptap/extension-color';
	import TextStyle from '@tiptap/extension-text-style';

	import Underline from '@tiptap/extension-underline';
	import Collaboration from '@tiptap/extension-collaboration';
	import { HocuspocusProvider } from '@hocuspocus/provider';
	import * as Y from 'yjs';
	import { authToken } from '$lib/stores/auth';

	import { PUBLIC_HOCUSPOCUS_URL } from '$env/static/public';

	import { CommentExtension } from '$lib/TipTapEditor/CommentExtension';
	import { createCommentDecorationPlugin } from '$lib/TipTapEditor/CommentDecorationPlugin';
	import CommentsPanel from '$lib/TipTapEditor/CommentsPanel.svelte';

	import { writable, type Writable, readable, type Readable } from 'svelte/store';
	import type { CommentType } from './Types';
	import { connectStringStoreToYText } from '$lib/utils/yutils';

	export let documentId: string;
	export let extensions: Extension[] = [];
	export let commentsStore: Writable<any[]> = writable([]);

	export let nameStore: Writable<string> = writable('');

	let editor: TipTapEditor | null;
	let editorContainer: HTMLDivElement;

	let ydoc: Y.Doc;
	let provider: HocuspocusProvider;
	let commentsYArray: Y.Array<CommentType>;

	let selectedCommentIdStore: Writable<string | null> = writable(null);

	onMount(() => {
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

		$nameStore = ydoc.getText('name').toString();
		connectStringStoreToYText(nameStore, ydoc.getText('name'));

		editor = new TipTapEditor({
			element: editorContainer,
			extensions: [
				StarterKit.configure({
					history: false
				}),
				Underline,
				TextStyle,
				Color,
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

	export function getCommentsYArray() {
		return commentsYArray;
	}
	export function getTipTapEditor() {
		return editor;
	}
</script>

<div class="editor-container">
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
	.editor-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		font-family: 'Roboto', sans-serif;

		width: fit-content;
		min-width: 100%;
		overflow: hidden;
	}

	.editor :global(.tiptap) {
		outline: none; /* Removes the default blue outline */
		padding: 20px;
		min-height: 400px; /* important rn so that there is enough space to click into the editor */
	}

	.editor-wrapper {
		display: flex;
		width: fit-content;
		min-width: 100%;
		flex: 1;
	}

	.editor {
		flex-grow: 1;
		min-width: 500px;
		padding: 0;

		overflow-y: auto;
		color: #ffffff;
		border-right: 1px solid #222;
	}

	.editor :global(p) {
		line-height: 1.6;
		margin-bottom: 16px;
	}

	.editor :global(h1),
	.editor :global(h2),
	.editor :global(h3),
	.editor :global(h4),
	.editor :global(h5),
	.editor :global(h6) {
		font-weight: 500;
		color: #202124;
		margin: 24px 0 16px;
	}

	:global(.comment-mark) {
		background-color: rgb(23, 102, 23);
	}

	:global(.comment-mark.selected) {
		background-color: rgb(182, 100, 0);
	}

	:global(.comment) {
		cursor: pointer;
		padding: 5px;
	}

	:global(.comment.selected) {
		background-color: #eef;
	}
</style>
