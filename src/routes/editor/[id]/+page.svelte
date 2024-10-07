<!-- src/routes/editor/[id]/+page.svelte -->
<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
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
	import shareIcon from '$lib/assets/MaterialSymbolsShare.svg';
	import { writable } from 'svelte/store';
	import { browser } from '$app/environment';

	let documentId = $page.params.id;

	onMount(async () => {
		if (!$registeredTokens && !$anonymousTokens) {
			goto('/login');
		}
		document.addEventListener('click', handleClickOutside);
	});

	onDestroy(() => {
		if(browser) {
			document.removeEventListener('click', handleClickOutside);
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

	// Share menu. TODO put this in a component
	let shareMenuVisible = false;
	let inviteEmail = '';
	let inviteStatus: '' | 'SENT' | 'FAILED' = '';
	let inviteWarning: '' | 'NO_EMAIL' | 'INVALID_EMAIL' = '';

	function toggleShareMenu() {
		shareMenuVisible ? hideShareMenu() : showShareMenu();
	}

	function hideShareMenu() {
		shareMenuVisible = false;
		inviteStatus = '';
		inviteWarning = '';
		inviteEmail = '';
	}

	function showShareMenu() {
		shareMenuVisible = true;
		inviteStatus = '';
		inviteWarning = '';
		inviteEmail = '';
	}

	async function sendInvite() {
		if (!inviteEmail) {
			inviteWarning = 'NO_EMAIL';
			return;
		}

		try {
			const mutation = `
			mutation InviteUserToDocument($documentId: ID!, $email: String!) {
				inviteUserToDocument(documentId: $documentId, email: $email)
				}
				`;
			const response = await graphQL(mutation, { documentId, email: inviteEmail });
			if (response.inviteUserToDocument) {
				inviteStatus = 'SENT';
				setTimeout(() => {
					hideShareMenu();
				}, 2000);
			} else {
				inviteStatus = 'FAILED';
			}
		} catch (error) {
			console.error('Error sending invite:', error);
			inviteStatus = 'FAILED';
		}
	}

	function handleClickOutside(event: Event) {
		const target = event.target as Node;
		if (
			shareMenuVisible &&
			!shareMenuElement.contains(target) &&
			!shareButtonElement.contains(target)
		) {
			shareMenuVisible = false;
			inviteStatus = '';
			inviteEmail = '';
		}
	}

	let shareMenuElement: HTMLElement;
	let shareButtonElement: HTMLElement;
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
	<div slot="top-right">
		<div class="share-container">
			<button
				class="invite-user-button"
				on:click={toggleShareMenu}
				aria-labelledby="Invite User"
				bind:this={shareButtonElement}
			>
				<img src={shareIcon} alt="Share" />
			</button>

			<!-- Share Menu TODO make this a component -->
			{#if shareMenuVisible}
				<div class="share-menu" bind:this={shareMenuElement}>
					{#if inviteStatus === ""}
					<div class="share-menu-content">
						<input type="email" placeholder="Enter email" bind:value={inviteEmail} required />
						{#if inviteWarning === 'NO_EMAIL'}
							<p class="inviteWarning">Please enter an email</p>
						{:else if inviteWarning === 'INVALID_EMAIL'}
							<p class="inviteWarning">Please enter a valid email</p>
						{/if}
						<button on:click={sendInvite}>Send</button>
					</div>
					{:else if inviteStatus === 'SENT'}
						<p class="success">Invite sent!</p>
					{:else if inviteStatus === 'FAILED'}
						<p class="error">Failed to send invite</p>
					{/if}
				</div>
			{/if}
		</div>
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

	/* SHARE MENU STYLES */
	.share-container {
		position: relative;
		padding-right: 20px;
	}

	.share-menu {
		position: absolute;
		display: flex;
		flex-direction: column;

		top: calc(100% + 10px);
		right: 0;

		margin-top: 5px;
		background-color: #2a2a2a;
		border-radius: 16px;
		padding: 25px;
		z-index: 1000;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		width: 300px;
	}

	.share-menu-content {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.share-menu input {
		padding: 10px 15px;
		border-radius: 20px;
		border: 1px solid #555;
		background-color: #1f1f1f;
		color: #fff;
	}

	.share-menu input::placeholder {
		color: #aaa;
	}

	.share-menu button {
		padding: 8px;
		border-radius: 20px;
		border: none;
		background-color: #104d9e;
		color: #fff;
		cursor: pointer;
	}

	.share-menu button:hover {
		background-color: #1a73e8;
	}

	.share-menu p {
		color: #fff;
		margin: 0;
	}

	.share-menu .error {
		color: #ff6767;
	}

	.share-menu .success {
		color: #68ef68;
	}

	.invite-user-button {
		background-color: transparent;
		border: none;
		color: #fff;
		font-size: 16px;
		cursor: pointer;
	}

	.invite-user-button:hover {
		text-decoration: underline;
	}

	.share-container {
		position: relative;
	}
</style>
