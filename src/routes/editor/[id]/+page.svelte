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

	const saveContent = async () => {
		try {
			await api.put(`/documents/${documentId}`, {
				title: documentData?.title ?? '',
				content: documentData?.content ?? { doc: null, comments: [] },
			});
			alert('Document saved successfully');
		} catch (error) {
			console.error('Error saving document:', error);
		}
	};

	const saveTitle = async () => {
		try {
			await api.put(`/documents/${documentId}`, {
				title: documentData?.title ?? '',
				content: documentData?.content ?? { doc: null, comments: [] },
			});
		} catch (error) {
			console.error('Error saving title:', error);
		}
	};
</script>

<Header>
	<svelte:fragment slot="header-content">
        <a href="/editor">Back</a>
		{#if documentData}
			<input
				type="text"
				class="document-title"
				bind:value={documentData.title}
				on:blur={saveTitle}
				placeholder="Untitled Document"
			/>
			<button on:click={saveContent}> Save</button>
		{/if}
	</svelte:fragment>
</Header>

{#if documentData}
	<div class="editor-page">
		<div class="editor-container">
			<Editor bind:content={documentData.content} />
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
</style>
