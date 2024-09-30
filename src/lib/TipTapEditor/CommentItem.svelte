<!-- src/lib/TipTapEditor/CommentItem.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { CommentType } from './Types';
	import { formatDistanceToNow } from 'date-fns';

	export let comment: CommentType;
	export let profilePicture: string = '';
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
	<div class="comment-header">
		{#if profilePicture}
			<div class="profile-picture">
				<img src={profilePicture} alt="Profile" />
			</div>
		{/if}
		<div class="header-texts">
			<span class="username">{comment.author}</span>
			<span class="time">{comment.timestamp
				? formatDistanceToNow(comment.timestamp, { addSuffix: true })
				: ''}</span>
		</div>
		<button class="delete-button" on:click|stopPropagation={handleRemove}> Delete </button>
	</div>

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
	<div class="comment-body">
		{comment.text}
	</div>
	{/if}
</div>

<style>
	.comment {
		background-color: rgb(219, 223, 230);
		border-radius: 10px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		padding: 15px;
		max-width: 200px;
		margin: 0px auto;
		font-family: 'Sansation', sans-serif;
		transition:
			transform 0.2s ease,
			background-color 0.2s ease;
		position: relative;
	}

	.comment-header {
		display: flex;
		align-items: center;
		margin-bottom: 10px;
	}
	.profile-picture {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		margin-right: 10px;
	}
	.profile-picture img {
		width: 100%;
	}

	.header-texts {
		display: flex;
		flex-direction: column;
	}
	.username {
		font-weight: bold;
		font-size: 20px;
	}
	.time {
		font-size: 16px;
		color: #666;
	}
	.comment-body {
		font-size: 16px;
		line-height: 1.5;
		color: #333;
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
		background-color: rgb(255, 255, 255);
		transform: scale(1.1) translateX(-10px);
	}
</style>
