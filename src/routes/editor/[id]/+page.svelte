<!-- src/routes/editor/[id]/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Header from '$lib/Header.svelte';
	import Editor from '$lib/TipTapEditor/Editor.svelte';
	import { authToken } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { graphQL } from '$lib/graphQL';
	import { registeredAuthToken } from '$lib/stores/auth';
	import Toolbar from '$lib/TipTapEditor/Toolbar.svelte';
	import BackIcon from '$lib/assets/MaterialSymbolsArrowCircleLeftOutlineRounded.svg'
	import LLMButtonIcon from '$lib/assets/MaterialSymbolsAutoAwesomeOutline.svg'
	import LLMButtonPendingIcon from '$lib/assets/MaterialSymbolsPendingOutline.svg'

	let documentId = $page.params.id;

	onMount(async () => {
		if (!$authToken) {
			goto('/login');
		}
	});

	let isRequestingLLMComments = false;

	async function requestLLMComments() {
		if (isRequestingLLMComments) {
			return;
		}
		isRequestingLLMComments = true;
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

			// wait before allowing another request
			await new Promise((resolve) => setTimeout(resolve, 2000));
		} catch (error) {
			console.error('Error running LLM:', error);
		} finally {
			isRequestingLLMComments = false;
		}
	}

	let editor: Editor;

	function handleBack() {
		goto('/editor');
	}
</script>

<!-- TODO back button -->
<Header
	showLogin={$registeredAuthToken === null}
	showSignUp={$registeredAuthToken === null}
	showTry={false}
	showDontHaveAccountText={true}
	showAlreadyHaveAccountText={false}
	showUsername={$registeredAuthToken !== null}
>
<div slot="top-left" class="toolbar">
	<button class="back-button" on:click={handleBack} aria-labelledby="Back">
		<img src={BackIcon} alt="Back" />
	</button>
	<Toolbar {editor} />
	<button class="request-llm-comments-button" on:click={requestLLMComments} aria-labelledby="New Document">
		<img src={isRequestingLLMComments ? LLMButtonPendingIcon : LLMButtonIcon} alt="Ask For Comments!" />
	</button>
</div>
</Header>

<div class="background"></div>
<div class="editor-page">
	<Editor {documentId} bind:this={editor}></Editor>
</div>

<style>
	.background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: #1f1f1f;
		z-index: -1;
	}

	.editor-page {
		margin-top: 70px; /* Adjust based on header height */
		padding: 20px;
	}

	.toolbar {
		padding-top: 15px;
		display: flex;
		justify-content: start;
		gap: 10px;
	}

	.request-llm-comments-button {
		background: transparent;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: background 0.3s;
		padding: 0;
	}

	.request-llm-comments-button:hover {
		background: linear-gradient(45deg, #ff0080, #ff8c00, #40e0d0);
	}

	.back-button {
		background: transparent;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: background 0.3s;
		padding: 0;
	}

	.back-button:hover {
		background: linear-gradient(45deg, #ff0080, #ff8c00, #40e0d0);
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
