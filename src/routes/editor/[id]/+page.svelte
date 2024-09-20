<!-- src/routes/editor/[id]/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import Header from '$lib/Header.svelte';
	import Editor from '$lib/Editor.svelte';
	import { authToken } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import type { DocumentData } from '$lib/types';
	// import jwt_decode from 'jwt-decode';

	let documentId = get(page).params.id;
	let documentData: DocumentData | null = null;

	let editorRef: Editor;

	let isDirty = false;

	onMount(async () => {
		if (!$authToken) {
			goto('/login');
		} else {
			try {
				const response = await api.get(`/documents/${documentId}`);
				documentData = response.data;
			} catch (error) {
				console.error('Error fetching document:', error);
			}
		}
	});

	const save = async () => {
		try {
			await api.put(`/documents/${documentId}`, {
				title: documentData?.title ?? '',
				content: documentData?.content ?? { doc: null, comments: [] }
			});
			isDirty = false;
		} catch (error) {
			console.error('Error saving document:', error);
		}
	};

	function handleContentChange(event: CustomEvent) {
		if (!documentData) {
			documentData = {
				title: '',
				content: { doc: null, comments: [] }
			};
		}
		documentData.content = event.detail;
		isDirty = true;
	}

	function handleTitleChange() {
		isDirty = true;
	}

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
</script>

<Header>
	<svelte:fragment slot="header-content">
		<a href="/editor">Back</a>
		{#if documentData}
			<input
				type="text"
				class="document-title"
				bind:value={documentData.title}
				on:input={handleTitleChange}
				placeholder="Untitled Document"
			/>
			<button on:click={save} class:is-saved={!isDirty}>
				{isDirty ? 'Save' : 'All changes saved'}
			</button>
		{/if}
	</svelte:fragment>
</Header>

{#if documentData}
	<div class="editor-page">
		<button on:click={requestLLMComments}>LLM Comment</button>
		<div class="editor-container">
			<Editor
				bind:this={editorRef}
				content={documentData.content}
				on:contentChange={handleContentChange}
			/>
		</div>
	</div>
{:else}
	<p>Loading document...</p>
{/if}

<style>
	.editor-page {
		margin-top: 70px; /* Adjust based on header height */
		padding: 20px;
	}

	.editor-container {
		background-color: #fff;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		max-width: 1000px;
		margin: 20px auto;
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

	button {
		margin-left: 10px;
		padding: 5px 10px;
		background-color: #007bff;
		color: #fff;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}

	button:hover {
		background-color: #0056b3;
	}

	button.is-saved {
		background-color: grey;
		cursor: default;
	}

	button.is-saved:hover {
		background-color: grey;
	}
</style>
