<script lang="ts">
	import { createEventDispatcher } from 'svelte';

    // TODO this should be in some shared file
	interface CommentType {
		id: string;
		text: string;
		author: string;
		timestamp: number;
		pending?: boolean;
	}

	export let comment: CommentType;
	export let isSelected = false;

	let isEditing = false;
	let editText = comment.text;

	const dispatch = createEventDispatcher();

	if (comment.pending) {
		isEditing = true;
	}

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
	<strong>{comment.author}</strong> ({new Date(comment.timestamp).toLocaleString()})
	{#if isEditing}
		<textarea bind:value={editText}></textarea>
		<button on:click|stopPropagation={handleFinalize}>Comment</button>
		<button on:click|stopPropagation={handleCancel}>Cancel</button>
	{:else}
		<p>{comment.text}</p>
		<button on:click|stopPropagation={handleRemove}>Delete</button>
	{/if}
</div>

<style>
	.comment {
		cursor: pointer;
		padding: 5px;
		border-bottom: 1px solid #ccc;
	}

	.comment.selected {
		background-color: #eef;
	}

	.comment textarea {
		width: 100%;
		min-height: 50px;
	}

	.comment button {
		margin-right: 5px;
	}
</style>
