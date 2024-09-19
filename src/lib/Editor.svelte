<!-- frontend/src/lib/Editor.svelte -->
<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { EditorState } from 'prosemirror-state';
    import { EditorView } from 'prosemirror-view';
    import { Schema } from 'prosemirror-model';
    import { schema as basicSchema } from 'prosemirror-schema-basic';
    import 'prosemirror-view/style/prosemirror.css';

    export let content: any = null;
    export let onSave: (content: any) => void;

    let editorView: EditorView | null = null;
    let editorContainer: HTMLDivElement | null = null;

    onMount(() => {
        const state = EditorState.create({
            schema: basicSchema,
            ...(content && { doc: basicSchema.nodeFromJSON(content) }),
        });

        editorView = new EditorView(editorContainer!, {
            state,
        });
    });

    onDestroy(() => {
        editorView?.destroy();
    });

    const saveDocument = () => {
        if (editorView) {
            const doc = editorView.state.doc.toJSON();
            onSave(doc);
        }
    };
</script>

<style>
    #editor {
        border: 1px solid #ccc;
        min-height: 200px;
        padding: 10px;
    }
</style>

<div class="editor" bind:this="{editorContainer}"></div>
<button on:click="{saveDocument}">Save</button>