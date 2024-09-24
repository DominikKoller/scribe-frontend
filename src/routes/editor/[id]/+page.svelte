<!-- src/routes/editor/[id]/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Header from '$lib/Header.svelte';
	import Editor from '$lib/TipTapEditor/Editor.svelte';
	import { authToken } from '$lib/stores/auth';
	import { goto } from '$app/navigation';

	let documentId = $page.params.id;

	onMount(async () => {
		if (!$authToken) {
			goto('/login');
		}
	});

	/*
	// needs to be reworked
	// we still want to be able to request llm comments
	// but it will work differently now with shared state editor
	async function requestLLMComments() {
		try {
			if (isDirty) {
				await save();
			}
			const response = await api.post(`/llm/${documentId}/addComments`);
			const data = response.data;
			if (data.success && documentData) {
				documentData.content.comments = data.comments;

				if (editorRef) {
					editorRef.updateContent(documentData.content);
				}

				isDirty = true;
			}
		} catch (error) {
			console.error('Error running LLM:', error);
		}
	}
	*/
</script>

<Header>
	<svelte:fragment slot="header-content">
		<a href="/editor">Back</a>
		<input type="text" class="document-title" placeholder="Document title not working ATM" />
	</svelte:fragment>
</Header>

<div class="editor-page">
	<!-- 
		<button on:click={requestLLMComments}>LLM Comment</button>
	-->
	<Editor {documentId} />
</div>

<style>
	.editor-page {
		margin-top: 70px; /* Adjust based on header height */
		padding: 20px;
	}

	.document-title {
		font-size: 20px;
		font-weight: bold;
		border: none;
		background: none;
		outline: none;
		width: 100%;
	}
</style>
