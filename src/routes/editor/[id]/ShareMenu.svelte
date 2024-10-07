<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher, tick } from 'svelte';
	import { browser } from '$app/environment';
	import { graphQL } from '$lib/graphQL';

	export let documentId: string;

	let inviteEmail = '';
	let inviteStatus: '' | 'SENT' | 'FAILED' = '';
	let inviteWarning: '' | 'NO_EMAIL' | 'INVALID_EMAIL' = '';

	let shareMenuElement: HTMLElement;
	const dispatch = createEventDispatcher();

	function handleClickOutside(event: Event) {
		const target = event.target as Node;
		if (shareMenuElement && !shareMenuElement.contains(target)) {
			dispatch('close');
		}
	}

	onMount(async () => {
		if (browser) {
            // this is a hack, otherwise the click event listener fires with the same event that opened the menu (also tick does not seem to work?)
            await new Promise((resolve) => setTimeout(resolve, 10));
			document.addEventListener('click', handleClickOutside);
		}
	});

	onDestroy(() => {
		if (browser) {
			document.removeEventListener('click', handleClickOutside);
		}
	});

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
					dispatch('close');
				}, 2000);
			} else {
				inviteStatus = 'FAILED';
			}
		} catch (error) {
			console.error('Error sending invite:', error);
			inviteStatus = 'FAILED';
		}
	}
</script>

<div class="share-menu" bind:this={shareMenuElement}>
	{#if inviteStatus === ''}
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

<style>
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
</style>
