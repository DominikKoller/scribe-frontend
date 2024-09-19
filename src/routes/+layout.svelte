<script lang="ts">
    import { authToken } from '$lib/stores/auth';
    import { goto } from '$app/navigation';

    const logout = () => {
        authToken.set(null);
        goto('/login');
    };
</script>
<nav>
    <a href="/">Home</a>
    {#if $authToken}
        <a href="/editor">My Documents</a>
        <button on:click={logout}>Logout</button>
    {:else} 
        <a href="/login">Login</a>
        <a href="/register">Register</a>
    {/if}
</nav>

<slot />