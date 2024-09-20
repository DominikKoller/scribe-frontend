<!-- src/lib/Comments.svelte -->
<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { TextSelection } from 'prosemirror-state';
	import { commentsPluginKey } from './commentsPlugin';
	import type { EditorView } from 'prosemirror-view';
	import type { Comment } from '$lib/types';
	import type { Readable } from 'svelte/store';

	export let editorView: EditorView;

	export let commentsStore: Readable<{
		comments: Comment[];
		activeCommentId: string | null;
	}>;

	let comments: Comment[] = [];
	let activeCommentId: string | null = null;

	const unsubscribe = commentsStore.subscribe((value) => {
		comments = value.comments;
		activeCommentId = value.activeCommentId;
	});

	onMount(() => {
		comments = $commentsStore?.comments || [];
		activeCommentId = $commentsStore?.activeCommentId;
	});

	onDestroy(() => {
		unsubscribe();
	});

	function goToComment(comment: Comment) {
		const { state, dispatch } = editorView;
		dispatch(
			state.tr
				// enable if you want the comment text to be selected when clicked
				// .setSelection(TextSelection.create(state.doc, comment.from, comment.to))
				.setMeta(commentsPluginKey, { type: 'setActiveComment', id: comment.id })
				.scrollIntoView()
		);
		editorView.focus();
	}

	function deleteComment(commentId: string) {
		const { state, dispatch } = editorView;
		dispatch(
			state.tr.setMeta(commentsPluginKey, {
				type: 'delete',
				id: commentId
			})
		);
	}

	function updateCommentText(commentId: string, newText: string) {
		const { state, dispatch } = editorView;
		dispatch(
			state.tr.setMeta(commentsPluginKey, {
				type: 'updateText',
				id: commentId,
				text: newText
			})
		);
	}
</script>

<div class="comments-sidebar">
	<h3>Comments</h3>
	{#each comments as comment}
		<div
			class="comment-item {comment.id === activeCommentId ? 'active' : ''}"
			on:click={() => goToComment(comment)}
			on:keydown={(e) => e.key === 'Enter' && goToComment(comment)}
			tabindex="0"
			role="button"
		>
			<p>{comment.text}</p>
			<textarea
				bind:value={comment.text}
				on:input={(e) =>
					updateCommentText(comment.id, (e.target as HTMLTextAreaElement).value ?? '')}
				on:click|stopPropagation
			></textarea>
			<button on:click|stopPropagation={() => deleteComment(comment.id)}>Delete</button>
		</div>
	{/each}
</div>

<style>
	.comments-sidebar {
		width: 300px;
		background: #f9f9f9;
		border-left: 1px solid #ccc;
		overflow-y: auto;
		padding: 10px;
	}

	.comment-item {
		margin-bottom: 10px;
		padding: 10px;
		background-color: #fff;
		border-radius: 6px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		cursor: pointer;
	}

	.comment-item.active {
		background-color: #d0f0fd;
	}

	.comment-item:hover {
		background-color: #f1f1f1;
	}

	.comment-item p {
		margin: 0 0 5px 0;
	}

	.comment-item button {
		padding: 5px 10px;
		background-color: #dc3545;
		color: #fff;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}

	.comment-item button:hover {
		background-color: #c82333;
	}

	.comment-item textarea {
		width: 100%;
		resize: vertical;
		margin-bottom: 5px;
	}
</style>
