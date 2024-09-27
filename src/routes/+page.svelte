<!-- src/routes/+page.svelte -->
<script lang="ts">
    import { authToken } from '$lib/stores/auth';
    import { goto } from '$app/navigation';
    import api from '$lib/api';

    let errorMessage = "";

    async function anonymousLogin() {
        try {
            const response = await api.post('/users/anonymousLogin');
            authToken.set(response.data.token);
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