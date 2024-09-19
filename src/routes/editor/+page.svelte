<!-- src/routes/editor/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import api from '$lib/api';
    import { goto } from '$app/navigation';
    import { authToken } from '$lib/stores/auth';

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
            const response = await api.post('/documents', { 
                title: newTitle,
                content: {},
            });
            newTitle = '';
            documents.push(response.data);
        } catch (error) {
            console.error('Error creating document:', error);
        }
    };
</script>

<h1>Your Documents</h1>

<input type="text" bind:value={newTitle} placeholder="Document Title" />
<button on:click={createDocument}>Create Document</button>

<ul>
    {#each documents as document}
        <li>
            <a href={`/editor/${document._id}`}>{document.title}</a>
        </li>
    {/each}
</ul>