<!-- frontend/src/lib/Editor.svelte -->
<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { EditorState } from 'prosemirror-state';
    import { EditorView } from 'prosemirror-view';
    import { keymap } from 'prosemirror-keymap';
    import { baseKeymap, toggleMark } from 'prosemirror-commands';
    import { history, undo, redo } from 'prosemirror-history';
    import { mySchema } from './schema';
    import { type MarkType } from 'prosemirror-model';
    import 'prosemirror-view/style/prosemirror.css';

    export let content: any = null;

    let editorView: EditorView | null = null;
    let editorContainer: HTMLDivElement | null = null;

    const icons = {
        bold: '𝐁',
        italic: '𝑰',
        underline: 'U̲',
        undo: '↺',
        redo: '↻'
    };

    onMount(() => {
        const state = EditorState.create({
            doc: content ? mySchema.nodeFromJSON(content) : undefined,
            schema: mySchema,
            plugins: [
                history(),
                keymap({
                    'Mod-b': toggleMark(mySchema.marks.strong),
                    'Mod-i': toggleMark(mySchema.marks.em),
                    'Mod-u': toggleMark(mySchema.marks.underline),
                    'Mod-z': undo,
                    'Mod-y': redo,
                }),
                keymap(baseKeymap)
            ]
        });

        editorView = new EditorView(editorContainer!, {
            state,
            dispatchTransaction(transaction) {
                const newState = editorView!.state.apply(transaction);
                editorView!.updateState(newState);
                content = newState.doc.toJSON();
                updateToolbarState();
            }
        });

        updateToolbarState();
    });

    onDestroy(() => {
        editorView?.destroy();
    });

    // Toolbar Actions
    const toggleMarkAction = (mark: MarkType) => () => {
        if (editorView) {
            const { state, dispatch } = editorView;
            toggleMark(mark)(state, dispatch);
            editorView.focus();
        }
    };

    const undoAction = () => {
        if (editorView) {
            undo(editorView.state, editorView.dispatch);
            editorView.focus();
        }
    };

    const redoAction = () => {
        if (editorView) {
            redo(editorView.state, editorView.dispatch);
            editorView.focus();
        }
    };

    // Update Toolbar State
    let isBoldActive = false;
    let isItalicActive = false;
    let isUnderlineActive = false;

    const updateToolbarState = () => {
        if (editorView) {
            const { state } = editorView;
            const { from, $from, to, empty } = state.selection;

            if (empty) {
                isBoldActive = !!mySchema.marks.strong.isInSet(state.storedMarks || $from.marks());
                isItalicActive = !!mySchema.marks.em.isInSet(state.storedMarks || $from.marks());
                isUnderlineActive = !!mySchema.marks.underline?.isInSet(state.storedMarks || $from.marks());
            } else {
                isBoldActive = state.doc.rangeHasMark(from, to, mySchema.marks.strong);
                isItalicActive = state.doc.rangeHasMark(from, to, mySchema.marks.em);
                isUnderlineActive = mySchema.marks.underline
                    ? state.doc.rangeHasMark(from, to, mySchema.marks.underline)
                    : false;
            }
        }
    };
</script>

<div class="editor-toolbar">
    <button class={isBoldActive ? 'active' : ''} on:click={toggleMarkAction(mySchema.marks.strong)}>
        {icons.bold}
    </button>
    <button class={isItalicActive ? 'active' : ''} on:click={toggleMarkAction(mySchema.marks.em)}>
        {icons.italic}
    </button>
    <button class={isUnderlineActive ? 'active' : ''} on:click={toggleMarkAction(mySchema.marks.underline)}>
        {icons.underline}
    </button>
    <button on:click={undoAction}>{icons.undo}</button>
    <button on:click={redoAction}>{icons.redo}</button>
</div>

<div class="editor" bind:this={editorContainer}></div>

<style>
    .editor {
        min-height: 600px;
        font-size: 16px;
    }

    .editor-toolbar {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
        position: sticky;
        top: 80px; /* Adjust based on header height */
        background-color: rgba(255, 255, 255, 0.9);
        padding: 10px;
        z-index: 999;
        border-bottom: 1px solid #ccc;
    }

    .editor-toolbar button {
        padding: 6px 10px;
        font-size: 16px;
        background: none;
        border: none;
        cursor: pointer;
        border-radius: 4px;
    }

    .editor-toolbar button.active {
        background-color: #ddd;
    }

    .editor-toolbar button:hover {
        background-color: #eee;
    }

    /* ProseMirror content styling */
    :global(.ProseMirror) {
        outline: none;
        white-space: pre-wrap;
        min-height: 600px;
    }

    :global(.ProseMirror p) {
        margin: 0;
    }

    :global(.ProseMirror strong) {
        font-weight: bold;
    }

    :global(.ProseMirror em) {
        font-style: italic;
    }

    :global(.ProseMirror u) {
        text-decoration: underline;
    }

    /* Headings */
    :global(.ProseMirror h1) {
        font-size: 2em;
        margin: 0.67em 0;
    }

    :global(.ProseMirror h2) {
        font-size: 1.5em;
        margin: 0.75em 0;
    }
</style>