<!-- src/lib/components/Toolbar.svelte -->
<script lang="ts">
	import { Editor as TipTapEditor } from '@tiptap/core';
	import { onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import { Array as YArray } from 'yjs';
	import type { CommentType } from './Types';

	export let editor: TipTapEditor;
	export let commentsYArray: YArray<CommentType>;

	let isBoldActive = false;
	let isItalicActive = false;
	let isUnderlineActive = false;

	const icons = {
		bold: '𝐁',
		italic: '𝑰',
		underline: 'U̲',
		undo: '↺',
		redo: '↻',
		comment: '💬'
	};

	const updateToolbarState = () => {
		if (editor) {
			isBoldActive = editor.isActive('bold');
			isItalicActive = editor.isActive('italic');
			isUnderlineActive = editor.isActive('underline');
		}
	};

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

	// TODO
	// It is very strange that this function is in here
	// It should really be somewhere with the comments extension code
	const addCommentAction = () => {
		if (!editor) return;

		const { state } = editor;
		const { selection } = state;

		if (selection.empty) {
			return;
		}

		const commentId = uuidv4();

		commentsYArray.push([
			{
				id: commentId,
				text: '',
				author: 'User', // Replace with actual user info
				timestamp: Date.now(),
				pending: true
			}
		]);

		editor.commands.addComment(commentId);
	};

	onMount(() => {
		updateToolbarState();
		editor.on('selectionUpdate', updateToolbarState);
	});
</script>

<div class="editor-toolbar">
	<button class:active={isBoldActive} on:click={toggleBold} title="Bold">
		{icons.bold}
	</button>
	<button class:active={isItalicActive} on:click={toggleItalic} title="Italic">
		{icons.italic}
	</button>
	<button class:active={isUnderlineActive} on:click={toggleUnderline} title="Underline">
		{icons.underline}
	</button>
	<button on:click={undoAction}>{icons.undo}</button>
	<button on:click={redoAction}>{icons.redo}</button>
	<button on:click={addCommentAction}>{icons.comment}</button>
</div>

<style>
	.editor-toolbar {
		background-color: #f1f3f4;
		padding: 4px;
		border-bottom: 1px solid #e0e0e0;
	}

	.editor-toolbar button {
		background: none;
		border: none;
		padding: 8px;
		cursor: pointer;
		border-radius: 4px;
		color: #5f6368;
	}

	.editor-toolbar button:hover {
		background-color: rgba(60, 64, 67, 0.08);
	}

	.editor-toolbar button.active {
		background-color: #e8f0fe;
		color: #1967d2;
	}
</style>
