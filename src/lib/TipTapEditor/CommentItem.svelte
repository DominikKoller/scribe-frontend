<!-- src/lib/TipTapEditor/CommentItem.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { CommentType } from './Types';

	export let comment: CommentType;
	export let isSelected = false;

	let isEditing = comment.pending || false;
	let editText = comment.text;

	const dispatch = createEventDispatcher();

	function handleFinalize() {
		dispatch('finalize', { id: comment.id, text: editText });
		isEditing = false;
	}

	function handleCancel() {
		dispatch('cancel', { id: comment.id });
	}

	function handleRemove() {
		dispatch('remove', { id: comment.id });
	}

	function handleClick() {
		dispatch('select', { id: comment.id });
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="comment" class:selected={isSelected} on:click={handleClick}>
	<strong>{comment.author}</strong>
	{#if isEditing}
		<textarea bind:value={editText} class="comment-input"></textarea>
		<div class="comment-buttons">
			<button class="cancel-button" on:click|stopPropagation={handleCancel}> Cancel </button>
			<button
				class="comment-button"
				on:click|stopPropagation={handleFinalize}
				disabled={!editText.trim()}
			>
				Comment
			</button>
		</div>
	{:else}
		<p>{comment.text}</p>
		<button class="delete-button" on:click|stopPropagation={handleRemove}> Delete </button>
	{/if}
</div>

<style>
	.comment {
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(60, 64, 67, 0.15);
		padding: 12px;
		margin-bottom: 10px;
		background-color: #fff;
		position: relative;
	}

	.comment-input {
		width: 100%;
		border: 1px solid black;
		border-radius: 8px;
		padding: 8px;
		box-sizing: border-box;
		resize: vertical;
		min-height: 60px;
	}

	.comment-buttons {
		display: flex;
		justify-content: flex-end;
		margin-top: 8px;
	}

	.comment-button {
		background-color: #1a73e8;
		color: white;
		border: none;
		padding: 6px 12px;
		border-radius: 4px;
		cursor: pointer;
		margin-left: 8px;
	}

	.comment-button:disabled {
		background-color: #e0e0e0;
		color: #9e9e9e;
		cursor: not-allowed;
	}

	.cancel-button {
		color: #1a73e8;
		border: none;
		padding: 6px 12px;
		cursor: pointer;
	}

	.delete-button {
		position: absolute;
		top: 8px;
		right: 8px;
		background: none;
		border: none;
		color: #9e9e9e;
		cursor: pointer;
	}

	.comment.selected {
		border: 1px solid #1a73e8;
	}
</style>
