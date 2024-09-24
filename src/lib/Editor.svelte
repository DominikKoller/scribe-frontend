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
	import { Node as PNode } from 'prosemirror-model';

	export let documentId: string;

	let editor: Editor;
	let ydoc: Y.Doc;
	let provider: HocuspocusProvider;
	let editorContainer: HTMLDivElement;

	interface CommentType {
		id: string;
		text: string;
		author: string;
		timestamp: number;
	}

	export const commentsStore: Writable<any[]> = writable([]);

	let selectedCommentId: string | null = null;

	// TODO this should be moved to a plugin file!
	let commentDecorationPlugin: Plugin;

	function createCommentDecorationPlugin() {
		const pluginKey = new PluginKey('commentDecorations');
		return new Plugin({
			key: pluginKey,
			state: {
				init(_, { doc }) {
					return DecorationSet.empty;
				},
				apply(tr, oldDecorationSet, oldState, newState) {
					const decorations = getCommentDecorations(newState.doc);
					return DecorationSet.create(newState.doc, decorations);
				}
			},
			props: {
				decorations(state) {
					return this.getState(state);
				}
			}
		});
	}

	function getCommentDecorations(doc: PNode) {
		const decorations: Decoration[] = [];
		doc.descendants((node: PNode, pos: number) => {
			if (node.isText) {
				const marks = node.marks;
				const commentMark = marks.find((mark) => mark.type.name === 'comment');
				if (commentMark) {
					const commentId = commentMark.attrs.commentId;
					const className =
						commentId === selectedCommentId ? 'comment-mark selected' : 'comment-mark';
					decorations.push(Decoration.inline(pos, pos + node.nodeSize, { class: className }));
				}
			}
		});
		return decorations;
	}

	function updateCommentDecorations() {
		/* this was old, theoretically more performant code
		// but it was not actually working:
		const decorations = getCommentDecorations(editor.state.doc);
		editor.view.dispatch(
			editor.view.state.tr.setMeta(commentDecorationPlugin, {
				add: DecorationSet.create(editor.view.state.doc, decorations)
			})
		);
		*/
		editor.view.dispatch(editor.view.state.tr);
	}

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
				Comment
			]
		});

		commentDecorationPlugin = createCommentDecorationPlugin();
		editor.registerPlugin(commentDecorationPlugin);

		editor.on('comment:select', (commentId) => {
			selectedCommentId = commentId;
			updateCommentDecorations();
		});

		editor.view.dom.addEventListener('click', (event) => {
			const target = event.target as Element;
			if (target && !target.closest('.comment-mark')) {
				selectedCommentId = null;
				updateCommentDecorations();
			}
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
				timestamp: Date.now()
			}
		]);

		editor.chain().focus().setMark('comment', { id: commentId }).run();
	};

	onDestroy(() => {
		provider?.destroy();
		editor?.destroy();
	});

	// Function to highlight text associated with a comment
	const highlightCommentText = (commentId: string) => {
		selectedCommentId = commentId;
		updateCommentDecorations();

		// Optionally, set the selection to the comment
		const { state } = editor;
		const { doc } = state;
		let from: number | null = null;
		let to: number | null = null;

		doc.descendants((node, pos) => {
			if (node.isText) {
				const marks = node.marks;
				const commentMark = marks.find(
					(mark) => mark.type.name === 'comment' && mark.attrs.commentId === commentId
				);
				if (commentMark) {
					from = pos;
					to = pos + node.nodeSize;
					return false; // Stop iteration
				}
			}
		});

		if (from !== null && to !== null) {
			editor.chain().setTextSelection({ from, to }).focus().run();
		}
	};

	// Function to remove a comment
	const removeComment = (commentId: string) => {
		if (!confirm('Are you sure you want to delete this comment?')) return;

		// Remove the comment mark from the document
		// editor.chain().focus().unsetMark('comment', { commentId }).run();
		editor.commands.removeComment(commentId);

		// Remove the comment from the Yjs array
		const commentsYArray: Y.Array<CommentType> = ydoc.getArray('comments');
		const index = commentsYArray.toArray().findIndex((comment) => comment.id === commentId);
		if (index !== -1) {
			commentsYArray.delete(index, 1);
		}
	};
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

<div class="editor-wrapper">
	<div class="editor" bind:this={editorContainer}></div>
</div>

<div class="comments-section">
	<h3>Comments</h3>
	{#each $commentsStore as comment}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="comment"
			class:selected={selectedCommentId === comment.id}
			on:click={() => highlightCommentText(comment.id)}
		>
			<strong>{comment.author}</strong> ({new Date(comment.timestamp).toLocaleString()})
			<p>{comment.text}</p>
			<button on:click={() => removeComment(comment.id)}>Delete</button>
		</div>
	{/each}
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
