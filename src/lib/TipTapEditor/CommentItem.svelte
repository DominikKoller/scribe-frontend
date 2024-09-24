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
    /* Add your comment item styles here */
  </style>
  