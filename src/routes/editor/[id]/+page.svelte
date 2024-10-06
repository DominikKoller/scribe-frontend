<!-- src/routes/editor/[id]/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Header from '$lib/Header.svelte';
	import Editor from '$lib/TipTapEditor/Editor.svelte';
	import { registeredTokens, anonymousTokens } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { graphQL } from '$lib/graphQL';
	import {} from '$lib/stores/auth';
	import Toolbar from '$lib/TipTapEditor/Toolbar.svelte';
	import BackIcon from '$lib/assets/MaterialSymbolsArrowCircleLeftOutlineRounded.svg';
	import LLMButtonIcon from '$lib/assets/MaterialSymbolsAutoAwesomeOutline.svg';
	import LLMButtonPendingIcon from '$lib/assets/MaterialSymbolsPendingOutline.svg';
	import { writable } from 'svelte/store';

	let documentId = $page.params.id;

	onMount(async () => {
		if (!$registeredTokens && !$anonymousTokens) {
			goto('/login');
		}
	});

	let isRequestingLLMComments = false;
	let inputElement: HTMLInputElement;

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
			// TODO handle response better
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

	let documentNameStore = writable('');

	function handleBack() {
		goto('/editor');
	}

	function handleDocumentNameChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input) {
			return;
		}
		$documentNameStore = input.value;
	}
</script>

<Header
	showLogin={$registeredTokens === null}
	showSignUp={$registeredTokens === null}
	showTry={false}
	showDontHaveAccountText={false}
	showAlreadyHaveAccountText={false}
	showUsername={true}
	showLogoutButton={$registeredTokens !== null}
>
	<div slot="top-left" class="toolbar">
		<button class="back-button" on:click={handleBack} aria-labelledby="Back">
			<img src={BackIcon} alt="Back" />
		</button>

		<input
			type="text"
			placeholder="Document Name"
			class="document-title"
			on:input={handleDocumentNameChange}
			bind:this={inputElement}
			value={$documentNameStore}
		/>

		<Toolbar {editor} />
		<button
			class="request-llm-comments-button"
			on:click={requestLLMComments}
			aria-labelledby="New Document"
		>
			<img
				src={isRequestingLLMComments ? LLMButtonPendingIcon : LLMButtonIcon}
				alt="Ask For Comments!"
			/>
		</button>
	</div>
</Header>

<div class="background"></div>
<div class="editor-page">
	<Editor {documentId} bind:this={editor} nameStore={documentNameStore}></Editor>
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
		margin-top: 100px; /* Adjust based on header height */
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
		color: white;
	}
</style>
