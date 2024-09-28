<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { authToken, anonymousAuthToken } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import api from '$lib/api';

	import client from '$lib/apollo';
	import { gql } from '@apollo/client/core';

	let errorMessage = '';

	async function anonymousLogin() {
		try {
			const response = await api.post('/users/anonymousLogin');
			anonymousAuthToken.set(response.data.token);
			goto('/editor');
		} catch (error) {
			errorMessage = 'Could not login anonymously';
		}
	}

	async function apolloTest() {
		const query = gql`
			query Hello {
				hello
			}
		`;

		try {
			const result = await client.query({ query });
			console.log(result);
		} catch (error) {
			console.error(error);
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
            <button on:click={apolloTest}>Apollo Test</button>
		{/if}
	</p>
</div>
