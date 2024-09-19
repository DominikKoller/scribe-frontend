<script lang="ts">
    import { onMount } from 'svelte';
    import api from '$lib/api';
    import { page } from '$app/stores';
    import { get } from 'svelte/store';
    import Editor from '$lib/Editor.svelte';

    // TODO find a good place for this!
    type DocumentData = {
        title: string;
        content: string;
    }

    let documentId = get(page).params.id;
    let documentData: DocumentData | null = null;

    onMount(async () => {
        try {
            const response = await api.get(`/documents/${documentId}`);
            documentData = response.data;
        } catch (error) {
            console.error('Error fetching document:', error);
        }
    });

    const saveContent = async (content: string) => {
        try {
            await api.put(`/documents/${documentId}`, {
                title: documentData?.title ?? '',
                content,
            });
            alert('Document saved successfully');
        } catch (error) {
            console.error('Error saving document:', error);
        }
    };
</script>

{#if documentData}
    <h1>{documentData.title}</h1>
    <Editor content="{documentData.content}" onSave={saveContent} />
{:else}
    <p>Loading document...</p>
{/if}