<!-- src/lib/components/Toolbar.svelte -->
<script lang="ts">
	// import { Editor as TipTapEditor } from '@tiptap/core';
	import { onMount, tick } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import { Array as YArray } from 'yjs';
	import type { CommentType } from './Types';
	import Editor from './Editor.svelte';

	// TODO the way the Editor is passed here & we access its TipTapEditor etc from here is very tightly coupled difficult to understand & hard to maintain
	// THINK ABOUT THIS COUPLING
	// The current way is just a result of how this grew
	export let editor: Editor;

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
		const tipTapEditor = editor?.getTipTapEditor();
		if (tipTapEditor) {
			isBoldActive = tipTapEditor.isActive('bold');
			isItalicActive = tipTapEditor.isActive('italic');
			isUnderlineActive = tipTapEditor.isActive('underline');
		}
	};

	const toggleBold = () => {
		editor?.getTipTapEditor()?.chain().focus().toggleBold().run();
	};

	const toggleItalic = () => {
		editor?.getTipTapEditor()?.chain().focus().toggleItalic().run();
	};

	const toggleUnderline = () => {
		editor?.getTipTapEditor()?.chain().focus().toggleUnderline().run();
	};

	const undoAction = () => {
		editor?.getTipTapEditor()?.chain().focus().undo().run();
	};

	const redoAction = () => {
		editor?.getTipTapEditor()?.chain().focus().redo().run();
	};

	// TODO
	// It is very strange that this function is in here
	// It should really be somewhere with the comments extension code
	const addCommentAction = () => {
		const tipTapEditor = editor?.getTipTapEditor();
		if (!tipTapEditor) return;

		const { state } = tipTapEditor;
		const { selection } = state;

		if (selection.empty) {
			return;
		}

		const commentId = uuidv4();

		editor.getCommentsYArray().push([
			{
				id: commentId,
				text: '',
				author: 'User', // Replace with actual user info
				timestamp: Date.now(),
				pending: true
			}
		]);

		tipTapEditor.commands.addComment(commentId);
	};

	onMount(async () => {
		updateToolbarState();
		await tick(); // TODO this is also really a hack to wait until the editor is available
		editor?.getTipTapEditor()?.on('selectionUpdate', updateToolbarState);
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
		border-radius: 200px;
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
