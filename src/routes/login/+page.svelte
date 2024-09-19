<script lang="ts">
    import { authToken } from '$lib/stores/auth';
    import api from '$lib/api';
    import { goto } from '$app/navigation';

    let email = '';
    let password = '';
    let errorMessage = '';

    const login = async () => {
        try {
            const response = await api.post('/users/login', { email, password });
            authToken.set(response.data.token);
            goto('/editor');
        } catch (error) {
            errorMessage = 'Invalid email or password';
        }
    };
</script>

<h1>Login</h1>
{#if errorMessage}
<p style="color: red;">{errorMessage}</p>
{/if}

<form on:submit|preventDefault={login}>
    <label>
        Email:
        <input type="email" bind:value={email} />
    </label>
    <label>
        Password:
        <input type="password" bind:value={password} />
    </label>
    <button type="submit">Login</button>
</form>

<p>
Don't have an account? <a href="/register">Register here</a>.
</p>