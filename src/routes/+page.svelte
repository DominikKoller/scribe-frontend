<!-- src/routes/+page.svelte -->
<script lang="ts">
    import { authToken } from '$lib/stores/auth';
</script>

<div class="content-container">
    <h1>Welcome to Scribe</h1>
    <p>
        {#if $authToken}
            <a href="/editor">My Documents</a>
        {:else}
            <a href="/login">Login</a>
            <a href="/register">Register</a>
        {/if}
    </p>
</div>