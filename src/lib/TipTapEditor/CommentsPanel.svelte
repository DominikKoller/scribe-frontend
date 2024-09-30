<!-- src/lib/TipTapEditor/CommentsPanel.svelte -->
<script lang="ts">
	import CommentItem from '$lib/TipTapEditor/CommentItem.svelte';
	import { Editor as TipTapEditor } from '@tiptap/core';
	import { Array as YArray } from 'yjs';
	import type { CommentType } from '$lib/TipTapEditor/Types';
	import { type Writable } from 'svelte/store';

	export let editor: TipTapEditor;
	export let commentsYArray: YArray<CommentType>;
	export let commentsStore: Writable<CommentType[]>;
	export let selectedCommentIdStore: Writable<string | null>;

	function highlightCommentText(commentId: string) {
		selectedCommentIdStore.set(commentId);
	}

	function removeComment(commentId: string) {
		editor.commands.removeComment(commentId);

		const index = commentsYArray.toArray().findIndex((comment) => comment.id === commentId);
		if (index !== -1) {
			commentsYArray.delete(index, 1);
		}
	}

	function finalizePendingComment(commentId: string, text: string) {
		const index = commentsYArray.toArray().findIndex((comment) => comment.id === commentId);
		if (index !== -1) {
			const comment = commentsYArray.get(index);
			commentsYArray.delete(index, 1);
			commentsYArray.insert(index, [
				{
					...comment,
					text,
					pending: false
				}
			]);
		}
	}
</script>

<div class="comments-section">
	{#each $commentsStore as comment}
		<CommentItem
			{comment}
			isSelected={$selectedCommentIdStore === comment.id}
			on:select={(e) => highlightCommentText(e.detail.id)}
			on:finalize={(e) => finalizePendingComment(e.detail.id, e.detail.text)}
			on:cancel={(e) => removeComment(e.detail.id)}
			on:remove={(e) => removeComment(e.detail.id)}
		/>
	{/each}
</div>

<style>
	.comments-section {
		width: 320px;
        flex-shrink: 0;
		padding: 16px;
		border-left: 1px solid #a2a2a2;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
</style>
