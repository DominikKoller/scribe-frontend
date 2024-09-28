<!-- src/routes/editor/[id]/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Header from '$lib/Header.svelte';
	import Editor from '$lib/TipTapEditor/Editor.svelte';
	import { authToken } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { graphQL } from '$lib/graphQL';

	let documentId = $page.params.id;

	onMount(async () => {
		if (!$authToken) {
			goto('/login');
		}
	});

	async function requestLLMComments() {
		try {
			// const response = await api.post(`/llm/${documentId}/addComments`);
			const mutation = `
				mutation RunLLMOnDocument($id: ID!) {
					runLLMOnDocument(id: $id)
				}
			`;
			const response = await graphQL(mutation, { id: documentId });
			console.log(response);
			// TODO handle response
			/*
			const data = response.data;
			if (data.success) {
				console.log('Comments added');
			} else {
				console.error('Error adding comments');
			}
			*/
		} catch (error) {
			console.error('Error running LLM:', error);
		}
	}
</script>

<Header>
	<svelte:fragment slot="header-content">
		<a href="/editor">Back</a>
		<input type="text" class="document-title" placeholder="Document title not working ATM" />
	</svelte:fragment>
</Header>

<div class="editor-page">
	
		<button on:click={requestLLMComments}>LLM Comment</button>
	
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
