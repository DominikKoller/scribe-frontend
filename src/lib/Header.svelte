<!-- src/lib/Header.svelte -->
<script lang="ts">
	import { registeredAuthToken } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	// import jwt_decode from 'jwt-decode';

	let username = '';

	function logout() {
		$registeredAuthToken = null;
		goto('/login');
	};

	$: if ($registeredAuthToken) {
		// const decoded: any = jwt_decode($authToken);
		// username = decoded.email || 'User'; // Adjust based on your token's payload
        username = 'User'; // TODO
	} else {
		username = '';
	}
</script>

<header class="header">
	<div class="header-left">
		<slot name="header-content"></slot>
	</div>
	<div class="header-right">
		{#if $registeredAuthToken}
			<span class="user-info">{username}</span>
			<button on:click={logout}>Logout</button>
		{:else}
			<a href="/login">Login</a>
			<a href="/register">Register</a>
		{/if}
	</div>
</header>

<style>
	/* Header styles */
	.header {
		position: fixed;
		width: 100%;
		top: 0;
		background-color: rgba(255, 255, 255, 0.95);
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 20px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		z-index: 1000;
	}

	.header-left {
		display: flex;
		align-items: center;
	}

	.header-right {
		display: flex;
		align-items: center;
	}

	.user-info {
		margin-right: 20px;
		font-weight: bold;
	}

	.header-right button,
	.header-right a {
		padding: 6px 12px;
		border: none;
		border-radius: 6px;
		background-color: #23a6d5;
		color: #fff;
		font-size: 14px;
		cursor: pointer;
		text-decoration: none;
		margin-left: 10px;
	}

	.header-right button:hover,
	.header-right a:hover {
		background-color: #1b7fab;
	}
</style>
