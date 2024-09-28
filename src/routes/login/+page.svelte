<!-- src/routes/login/+page.svelte -->
<script lang="ts">
	import { registeredAuthToken } from '$lib/stores/auth';
    import { graphQL } from '$lib/graphQL';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let errorMessage = '';

	const login = async () => {
		try {
			const mutation = `
				mutation Login($email: String!, $password: String!) {
					login(email: $email, password: $password) {
						token
					}
				}
			`;
            const result = await graphQL(mutation, { email, password });
			$registeredAuthToken = result.login.token;
			goto('/editor');
		} catch (error) {
			errorMessage = 'Invalid email or password';
		}
	};
</script>

<div class="content-container">
	<h1>Login</h1>
	{#if errorMessage}
		<p class="error-message">{errorMessage}</p>
	{/if}

	<form on:submit|preventDefault={login}>
		<label>
			Email:
			<input type="email" bind:value={email} required />
		</label>
		<label>
			Password:
			<input type="password" bind:value={password} required />
		</label>
		<button type="submit">Login</button>
	</form>

	<p>
		Don't have an account? <a href="/register">Register here</a>.
	</p>
</div>
