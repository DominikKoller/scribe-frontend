<!-- src/routes/editor/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api';
	import { goto } from '$app/navigation';
	import { authToken } from '$lib/stores/auth';
	import Header from '$lib/Header.svelte';

	// TODO move this to types & find a good way of integrating it to existing types
	interface Document {
		_id: string;
		title: string;
	}

	let documents: Document[] = [];
	let newTitle = '';

	onMount(async () => {
		if (!$authToken) {
			goto('/login');
		} else {
			await fetchDocuments();
		}
	});

	const fetchDocuments = async () => {
		try {
			const response = await api.get('/documents');
			documents = response.data;
		} catch (error) {
			console.error('Error fetching documents:', error);
		}
	};

	const createDocument = async () => {
		try {
			if (!newTitle) {
				newTitle = 'Untitled Document';
			}
			const response = await api.post('/documents', {
				title: newTitle,
				content: {}
			});
			newTitle = '';
			goto(`/editor/${response.data._id}`);
		} catch (error) {
			console.error('Error creating document:', error);
		}
	};

	const deleteDocument = async (id: string) => {
		try {
			await api.delete(`/documents/${id}`);
			documents = documents.filter((document) => document._id !== id);
		} catch (error) {
			console.error('Error deleting document:', error);
		}
	};
</script>

<Header />

<div class="content-container">
	<h1>Your Documents</h1>

	<div class="new-document">
		<input type="text" bind:value={newTitle} placeholder="Document Title" />
		<button on:click={createDocument}>Create Document</button>
	</div>

	<ul>
		{#each documents as document}
			<li>
				<a href={`/editor/${document._id}`}>{document.title}</a>
				<button on:click={() => deleteDocument(document._id)}>Delete</button>
			</li>
		{/each}
	</ul>
</div>

<style>
	.new-document {
		display: flex;
		margin-bottom: 20px;
	}

	.new-document input {
		flex: 1;
		padding: 10px;
		border-radius: 6px;
		border: 1px solid #ccc;
		font-size: 16px;
	}

	.new-document button {
		margin-left: 10px;
		padding: 10px 20px;
		border: none;
		border-radius: 6px;
		background-color: #23a6d5;
		color: #fff;
		font-size: 16px;
		cursor: pointer;
	}

	.new-document button:hover {
		background-color: #1b7fab;
	}

	ul {
		list-style-type: none;
		padding: 0;
	}

	ul li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 10px;
	}

	ul li a {
		text-decoration: none;
		color: #333;
		font-size: 18px;
	}

	ul li a:hover {
		text-decoration: underline;
	}

	ul li button {
		padding: 5px 10px;
		background-color: #dc3545;
		color: #fff;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}

	ul li button:hover {
		background-color: #c82333;
	}
</style>
