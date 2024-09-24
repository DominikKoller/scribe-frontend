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
		console.log('inner onmount');
		updateToolbarState();
		editor.on('selectionUpdate', updateToolbarState);
	});
</script>

<div class="editor-toolbar">
	<button class={isBoldActive ? 'active' : ''} on:click={toggleBold}>
		{icons.bold}
	</button>
	<button class={isItalicActive ? 'active' : ''} on:click={toggleItalic}>
		{icons.italic}
	</button>
	<button class={isUnderlineActive ? 'active' : ''} on:click={toggleUnderline}>
		{icons.underline}
	</button>
	<button on:click={undoAction}>{icons.undo}</button>
	<button on:click={redoAction}>{icons.redo}</button>
	<button on:click={addCommentAction}>{icons.comment}</button>
</div>

<style>
	/* Add your toolbar styles here */
</style>
