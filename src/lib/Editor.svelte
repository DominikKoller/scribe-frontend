<!-- frontend/src/lib/Editor.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';

	import Underline from '@tiptap/extension-underline';
	import Collaboration from '@tiptap/extension-collaboration';
	import { HocuspocusProvider } from '@hocuspocus/provider';
	import * as Y from 'yjs';
	import { authToken } from '$lib/stores/auth';

	import { PUBLIC_HOCUSPOCUS_URL } from '$env/static/public';

	import { Comment } from '$lib/extensions/Comment';
	import { writable, type Writable } from 'svelte/store';

	import { v4 as uuidv4 } from 'uuid';
	import { Plugin, PluginKey } from 'prosemirror-state';
	import { Decoration, DecorationSet } from 'prosemirror-view';

	export let documentId: string;

	let editor: Editor;
	let ydoc: Y.Doc;
	let provider: HocuspocusProvider;
	let editorContainer: HTMLDivElement;

	export const commentsStore: Writable<any[]> = writable([]);

	const icons = {
		bold: '𝐁',
		italic: '𝑰',
		underline: 'U̲',
		undo: '↺',
		redo: '↻',
		comment: '💬'
	};

	onMount(() => {
		ydoc = new Y.Doc();
		provider = new HocuspocusProvider({
			url: PUBLIC_HOCUSPOCUS_URL,
			name: documentId,
			document: ydoc,
			token: $authToken
		});

		const commentsYArray = ydoc.getArray('comments');
		$commentsStore = commentsYArray.toJSON();

		commentsYArray.observe((event) => {
			$commentsStore = commentsYArray.toJSON();
		});

		editor = new Editor({
			element: editorContainer,
			extensions: [
				StarterKit,
				Underline,
				Collaboration.configure({
					document: ydoc
				}),
				Comment,
			]
		});

		updateToolbarState();
		editor.on('selectionUpdate', updateToolbarState);
	});

	// Toolbar State Variables
	let isBoldActive = false;
	let isItalicActive = false;
	let isUnderlineActive = false;

	// Update Toolbar State Function
	const updateToolbarState = () => {
		if (editor) {
			isBoldActive = editor.isActive('bold');
			isItalicActive = editor.isActive('italic');
			isUnderlineActive = editor.isActive('underline');
		}
	};

	// Toolbar Actions
	const toggleBold = () => {
		editor.chain().focus().toggleBold().run();
	};

	const toggleItalic = () => {
		editor.chain().focus().toggleItalic().run();
	};

	const toggleUnderline = () => {
		editor.chain().focus().toggleUnderline().run();
	};

	const undoAction = () => {
		editor.chain().focus().undo().run();
	};

	const redoAction = () => {
		editor.chain().focus().redo().run();
	};

	const addCommentAction = () => {
		if (!editor) return;

		const { state, view } = editor;
		const { selection } = state;

		if (selection.empty) {
			return;
		}

		const commentText = prompt('Enter your comment');
		if (!commentText) return;

		const commentId = uuidv4();

		const commentsYArray = ydoc.getArray('comments');
		commentsYArray.push([
			{
				id: commentId,
				text: commentText,
				author: 'User', // replace with actual user info
				timestamp: Date.now(),
			}
		]);

		editor
			.chain()
			.focus()
			.setMark('comment', { id: commentId })
			.run();
	};

	onDestroy(() => {
		provider?.destroy();
		editor?.destroy();
	});
</script>

<div class="editor-toolbar">
	<button class={isBoldActive ? 'active' : ''} on:click={toggleBold}>
		{icons.bold}
	</button>
	<button class={isItalicActive ? 'active' : ''} on:click={toggleItalic}>
		{icons.italic}
	</button>
	<button
		class={isUnderlineActive ? 'active' : ''}
		on:click={toggleUnderline}
	>
		{icons.underline}
	</button>
	<button on:click={undoAction}>{icons.undo}</button>
	<button on:click={redoAction}>{icons.redo}</button>
	<button on:click={addCommentAction}>{icons.comment}</button>
</div>


<div class="editor-wrapper">
	<div class="editor" bind:this={editorContainer}></div>

	<div class="comments-section">
		<h3>Comments</h3>
		{#each $commentsStore as comment}
		  <!-- svelte-ignore a11y_click_events_have_key_events -->
		  <!-- svelte-ignore a11y_no_static_element_interactions -->
		  <div
			class="comment"
		  >
			<strong>{comment.author}</strong> ({new Date(comment.timestamp).toLocaleString()})
			<p>{comment.text}</p>
		  </div>
		{/each}
	  </div>
</div>

<style>
	.editor-wrapper {
		display: flex;
	}

	.editor {
		flex: 1; /* Editor takes available space */
		min-height: 600px;
		font-size: 16px;
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

	/* ProseMirror content styling */
	:global(.ProseMirror) {
		outline: none;
		white-space: pre-wrap;
		min-height: 600px;
	}

	:global(.ProseMirror p) {
		margin: 0;
	}

	:global(.ProseMirror strong) {
		font-weight: bold;
	}

	:global(.ProseMirror em) {
		font-style: italic;
	}

	:global(.ProseMirror u) {
		text-decoration: underline;
	}

	/* Headings */
	:global(.ProseMirror h1) {
		font-size: 2em;
		margin: 0.67em 0;
	}

	:global(.ProseMirror h2) {
		font-size: 1.5em;
		margin: 0.75em 0;
	}

	:global(.ProseMirror .comment) {
		background-color: rgba(255, 255, 0, 0.5);
		cursor: pointer;
	}

	:global(.ProseMirror .comment.active-comment) {
		background-color: rgba(173, 216, 230, 0.5);
	}
</style>
