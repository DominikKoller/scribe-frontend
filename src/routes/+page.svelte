<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { authToken, anonymousAuthToken } from '$lib/stores/auth';
	import { goto } from '$app/navigation';

	import client from '$lib/apollo';
	import { gql } from '@apollo/client/core';

	let errorMessage = '';

	async function anonymousLogin() {
		try {
			const mutation = gql`
				mutation AnonymousLogin {
					anonymousLogin {
						token
					}
				}
			`;
			const result = await client.mutate({ mutation });
			$anonymousAuthToken = result.data.anonymousLogin.token;
			goto('/editor');
		} catch (error) {
			errorMessage = 'Could not login anonymously';
		}
	}
</script>

<div class="content-container">
	<h1>Welcome to Scribe</h1>
	<p>
		{#if $authToken}
			<a href="/editor">My Documents</a>
		{:else}
			<a href="/login">Login</a>
			<a href="/register">Register</a>
			<button on:click={anonymousLogin}>Continue as guest</button>
		{/if}
	</p>
</div>
