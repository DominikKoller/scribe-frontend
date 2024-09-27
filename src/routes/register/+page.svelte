<!-- src/routes/register/+page.svelte -->
<script lang="ts">
    import { registeredAuthToken } from '$lib/stores/auth';
    import api from '$lib/api';
    import { goto } from '$app/navigation';

    let email = '';
    let password = '';
    let errorMessage = '';
    
    async function register() {
        try {
            const response = await api.post('/users/register', { email, password });
            $registeredAuthToken = response.data.token;
            goto('/editor');
        } catch (error) {
            errorMessage = 'Registration failed';
        }
    };
</script>

<div class="content-container">
    <h1>Register</h1>
    {#if errorMessage}
        <p class="error-message">{errorMessage}</p>
    {/if}

    <form on:submit|preventDefault={register}>
        <label>
            Email:
            <input type="email" bind:value={email} required />
        </label>
        <label>
            Password:
            <input type="password" bind:value={password} required />
        </label>
        <button type="submit">Register</button>
    </form>
    <p>
        Already have an account? <a href="/login">Login here</a>.
    </p>
</div>