<!-- frontend/src/lib/Editor.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { EditorState, type Transaction } from 'prosemirror-state';
	import { EditorView } from 'prosemirror-view';
	import { keymap } from 'prosemirror-keymap';
	import { baseKeymap, toggleMark } from 'prosemirror-commands';
	import { history, undo, redo } from 'prosemirror-history';
	import { mySchema } from './schema';
	import { Node, type MarkType } from 'prosemirror-model';
	import 'prosemirror-view/style/prosemirror.css';

	import { collab, receiveTransaction, sendableSteps, getVersion } from 'prosemirror-collab';
	import { Step } from 'prosemirror-transform';
	import io from 'socket.io-client';
	import { type Socket } from 'socket.io-client';
	import { authToken } from '$lib/stores/auth';

	import { createCommentsPlugin, commentsPluginKey } from './commentsPlugin';
	import { writable } from 'svelte/store';
	import Comments from '$lib/Comments.svelte';

	import { PUBLIC_SOCKET_IO_URL } from '$env/static/public';

	export let documentId: string; // Receive from parent or route

	let editorView: EditorView | null = null;
	let editorContainer: HTMLDivElement | null = null;
	let socket: Socket;

	const icons = {
		bold: '𝐁',
		italic: '𝑰',
		underline: 'U̲',
		undo: '↺',
		redo: '↻',
		comment: '💬'
	};

	type Comment = {
		id: string;
		from: number;
		to: number;
		text: string;
	};

	const commentsStore = writable<{
		comments: Comment[];
		activeCommentId: string | null;
	}>({
		comments: [],
		activeCommentId: null
	});

	onMount(() => {
		// Initialize Socket.io
		socket = io(PUBLIC_SOCKET_IO_URL, {
			auth: {
				token: $authToken,
			},
		});

		socket.emit('join-document', { documentId, $authToken });

		socket.on('init-document', ({ content, version }) => {
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
						'Mod-y': redo
					}),
					keymap(baseKeymap),
					collab({ version }),
					createCommentsPlugin()
				]
			});

			if (!editorView) {
				editorView = new EditorView(editorContainer!, {
					state,
					dispatchTransaction
				});
			} else {
				editorView.updateState(state);
			}

			updateCommentsFromDoc(state.doc);

			updateToolbarState();
		});

		socket.on('receive-steps', ({ steps, version, clientIDs }) => {
			if (!editorView) {
				console.error('No editor view found to apply steps');
				return;
			}
			const state = editorView.state;
			const newSteps = steps.map((step: Step) => Step.fromJSON(mySchema, step));

			const oldVersion = getVersion(state);
			
			editorView.dispatch(
				receiveTransaction(
					state,
					newSteps,
					clientIDs
				)
			)
			const newVersion = getVersion(editorView.state);

			// TODO THIS HAPPENS AND I DON'T KNOW WHY
			if(newVersion < oldVersion || newVersion !== version) {
				console.log("SOMETHING WENT WRONG IN VERSIONING");
				// print all the steps
				steps.forEach((step: Step) => {
					console.log(step);
				});
			}
			
			updateCommentsFromDoc(editorView.state.doc);
			updateToolbarState();
		});

		socket.on('version-mismatch', ({ serverVersion }) => {
			if (!editorView) {
				console.error('No editor view found to handle version mismatch');
				return;
			}
			const state = editorView.state;
			socket.emit('get-steps', { documentId, fromVersion: getVersion(state) });
		});

		socket.on('error', (message) => {
			console.error('Socket error:', message);
		});
	});

	onDestroy(() => {
		editorView?.destroy();
		socket?.disconnect();
	});

	function dispatchTransaction(transaction: Transaction) {
		if (!editorView) {
			console.error('No editor view found to dispatch transaction');
			return;
		}

		const newState = editorView.state.apply(transaction);
		editorView.updateState(newState);

		const sendable = sendableSteps(newState);
		if (sendable) {
			socket.emit('submit-steps', {
				documentId,
				version: sendable.version,
				steps: sendable.steps.map((step) => step.toJSON()),
				clientID: sendable.clientID 
			});
		}

		updateCommentsFromDoc(newState.doc);
		updateToolbarState();
	}

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

	const generateUniqueCommentId = () => {
		// TODO replace with UUID
		return `comment-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
	};

	const addCommentAction = () => {
		if (editorView) {
			const { state, dispatch } = editorView;
			const { from, to } = state.selection;

			if (from !== to) {
				const commentId = generateUniqueCommentId();
				dispatch(
					state.tr.addMark(from, to, mySchema.marks.comment.create({ id: commentId, text: '' }))
				);
				editorView.focus();
			}
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

	function updateCommentsFromDoc(doc: Node) {
		const comments: Comment[] = [];
		doc.descendants((node, pos) => {
			if (node.isText) {
				const marks = node.marks;
				marks.forEach((mark) => {
					if (mark.type === mySchema.marks.comment) {
						const comment = {
							id: mark.attrs.id,
							from: pos,
							to: pos + (node.text?.length || 0),
							text: mark.attrs.text || ''
						};
						comments.push(comment);
					}
				});
			}
		});

		if (!editorView) {
			console.error('No editor view found to update comments');
			return;
		}
		
		const pluginState = commentsPluginKey.getState(editorView.state);
		commentsStore.set({
			comments: comments,
			activeCommentId: pluginState.activeCommentId
		});
	}
</script>

<div class="editor-toolbar">
	<button class={isBoldActive ? 'active' : ''} on:click={toggleMarkAction(mySchema.marks.strong)}>
		{icons.bold}
	</button>
	<button class={isItalicActive ? 'active' : ''} on:click={toggleMarkAction(mySchema.marks.em)}>
		{icons.italic}
	</button>
	<button
		class={isUnderlineActive ? 'active' : ''}
		on:click={toggleMarkAction(mySchema.marks.underline)}
	>
		{icons.underline}
	</button>
	<button on:click={undoAction}>{icons.undo}</button>
	<button on:click={redoAction}>{icons.redo}</button>
	<button on:click={addCommentAction}>{icons.comment}</button>
</div>

<div class="editor-wrapper">
	<div class="editor" bind:this={editorContainer}></div>
	{#if editorView}
		<Comments {editorView} {commentsStore} />
	{/if}
</div>

<style>
	.editor-wrapper {
		display: flex;
	}

	.editor {
		flex: 1; /* Editor takes available space */
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

	:global(.ProseMirror .comment) {
		background-color: rgba(255, 255, 0, 0.5);
		cursor: pointer;
	}

	:global(.ProseMirror .comment.active-comment) {
		background-color: rgba(173, 216, 230, 0.5);
	}
</style>
