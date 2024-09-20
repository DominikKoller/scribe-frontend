<!-- src/routes/editor/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import api from '$lib/api';
    import { goto } from '$app/navigation';
    import { authToken } from '$lib/stores/auth';
    import Header from '$lib/Header.svelte';

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

    li {
        margin-bottom: 10px;
    }

    li a {
        text-decoration: none;
        color: #333;
        font-size: 18px;
    }

    li a:hover {
        text-decoration: underline;
    }
</style>
