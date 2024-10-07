<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher, tick } from 'svelte';
	import { browser } from '$app/environment';
	import { graphQL } from '$lib/graphQL';

	export let documentId: string;

	let status: '' | 'SENT' | 'FAILED' = '';

	let snapshotMenuElement: HTMLElement;
	const dispatch = createEventDispatcher();

	function handleClickOutside(event: Event) {
		const target = event.target as Node;
		if (snapshotMenuElement && !snapshotMenuElement.contains(target)) {
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
		try {
			const mutation = `
          mutation CreateDocumentSnapshot($documentId: ID!) {
            createDocumentSnapshot(documentId: $documentId)
          }
        `;
			const response = await graphQL(mutation, { documentId });
			if (response.createDocumentSnapshot) {
				status = 'SENT';
				setTimeout(() => {
					dispatch('close');
				}, 2000);
			} else {
				status = 'FAILED';
			}
		} catch (error) {
			console.error('Error sending invite:', error);
			status = 'FAILED';
		}
	}
</script>

<div class="snapshot-menu" bind:this={snapshotMenuElement}>
	{#if status === ''}
		<div class="snapshot-menu-content">
            <p>Are you sure you want to capture a snapshot of this document for finetuning?</p>
			<button on:click={sendInvite}>Capture Snapshot</button>
		</div>
	{:else if status === 'SENT'}
		<p class="success">Snapshot captured!</p>
	{:else if status === 'FAILED'}
		<p class="error">Failed to capture snapshot</p>
	{/if}
</div>

<style>
	.snapshot-menu {
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

	.snapshot-menu-content {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.snapshot-menu button {
		padding: 8px;
		border-radius: 20px;
		border: none;
		background-color: #104d9e;
		color: #fff;
		cursor: pointer;
	}

	.snapshot-menu button:hover {
		background-color: #1a73e8;
	}

	.snapshot-menu p {
		color: #fff;
		margin: 0;
	}

	.snapshot-menu .error {
		color: #ff6767;
	}

	.snapshot-menu .success {
		color: #68ef68;
	}
</style>
