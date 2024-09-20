<script lang="ts">
	import { onDestroy } from 'svelte';
	import { TextSelection } from 'prosemirror-state';
	import { commentsPluginKey } from './commentsPlugin';
	import type { EditorView } from 'prosemirror-view';
    import type { Comment } from '$lib/types';

	export let editorView: EditorView;
	export let commentsStore;

	let comments: Comment[] = [];

	const unsubscribe = commentsStore.subscribe((value: Comment[]) => {
		comments = value;
	});

	onDestroy(() => {
		unsubscribe();
	});

	function goToComment(comment: Comment) {
		const { state, dispatch } = editorView;
		dispatch(
			state.tr
				.setSelection(TextSelection.create(state.doc, comment.from, comment.to))
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
</script>

// src/lib/Comments.svelte

<div class="comments-sidebar">
	<h3>Comments</h3>
	{#each comments as comment}
		<div
			class="comment-item"
			on:click={() => goToComment(comment)}
			on:keydown={(e) => e.key === 'Enter' && goToComment(comment)}
			tabindex="0"
			role="button"
		>
			<p>{comment.text}</p>
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
		cursor: pointer;
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
</style>
