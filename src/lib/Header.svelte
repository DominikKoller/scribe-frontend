<!-- src/lib/Header.svelte -->

<script lang="ts">
	import { registeredTokens, anonymousTokens } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import Logo from '$lib/assets/Logo.png';
	import { anonymousLogin, fetchUserData, userData } from './utils/userUtils';

	let username = '';

	let errorMessage = ''; // do something with this? or make it a button state

	async function handleTry() {
		try {
			await fetchUserData();
			if (!$userData) {
				await anonymousLogin();
			}
			goto('/editor');
		} catch (error) {
			errorMessage = 'Failed to log in anonymously';
		}
	}

	function logout() {
		$registeredTokens = null;
		goto('/login');
	}

	$: if ($registeredTokens) {
		username = 'User'; // TODO: Fetch the username from the store or API
	} else {
		username = '';
	}

	// Control visibility of the buttons and text
	export let showLogin = true;
	export let showSignUp = true;
	export let showTry = true;
	export let showDontHaveAccountText = false;
	export let showAlreadyHaveAccountText = false;
	export let showUsername = false;
</script>

<header class="header">
	<div class="header-top">
		<slot name="top-left">
			<a class="header-left" href="/">
				<img src={Logo} alt="Logo" class="logo" />
				<span class="site-name">Scribe</span>
			</a>
		</slot>
		<div class="header-right">
			{#if $registeredTokens && showUsername}
				{#if $userData}
					<span class="user-info">{$userData.email}</span>
				{/if}
				<button class="logout-button" on:click={logout}>Logout</button>
			{:else}
				{#if showAlreadyHaveAccountText}
					<span class="info-text">Already have an account?</span>
				{/if}
				{#if showLogin}
					<a class="login-button" href="/login">Log In</a>
				{/if}
				{#if showDontHaveAccountText}
					<span class="info-text">Don't have an account yet?</span>
				{/if}
				{#if showSignUp}
					<a class="signup-button" href="/signup">Sign Up</a>
				{/if}
				{#if showTry}
					<button class="try-button" on:click={handleTry}>Try</button>
				{/if}
			{/if}
		</div>
	</div>
	<div class="header-bottom">
		<slot name="bottom"></slot>
	</div>
</header>

<style>
	/* Header styles */
	.header {
		position: fixed;
		width: 100%;
		top: 0;
		left: 0;
		display: flex;
		flex-direction: column;
		padding: 10px 20px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		z-index: 1000;
		box-sizing: border-box;
		backdrop-filter: blur(20px);
	}

	.header-top {
		display: flex;
		justify-content: space-between;
		width: 100%;
	}

	.header-left {
		display: flex;
		align-items: center;
	}

	a.header-left {
		text-decoration: none;
	}

	.logo {
		height: 40px;
		margin-right: 10px;
	}

	.site-name {
		font-size: 24px;
		font-weight: bold;
		color: white;
		font-family: 'Julius Sans One', sans-serif;
	}

	.header-right {
		display: flex;
		align-items: center;
		font-family: 'Sansation', sans-serif;
	}

	.user-info {
		margin-right: 20px;
		font-weight: bold;
		color: white;
	}

	/* Button styles */
	.login-button {
		background-color: transparent;
		color: white;
		text-decoration: none;
		padding: 6px 12px;
		border: none;
		cursor: pointer;
		margin-left: 10px;
	}

	.login-button:hover {
		text-decoration: underline;
	}

	.logout-button {
		background-color: transparent;
		color: white;
		text-decoration: none;
		padding: 6px 12px;
		border: none;
		cursor: pointer;
		margin-left: 10px;
	}

	.logout-button:hover {
		text-decoration: underline;
	}

	.signup-button {
		position: relative;
		color: white;
		margin-left: 10px;
		padding: 8px 14px; /* note in this case you need to add the 2px border to the padding */
		cursor: pointer;
		text-decoration: none;
	}

	/* For why this is necessary see
	https://dev.to/afif/border-with-gradient-and-radius-387f
	*/
	.signup-button::before {
		content: '';
		position: absolute;
		inset: 0;

		border: 2px solid transparent;
		border-radius: 6px;

		background: linear-gradient(45deg, #ff0080, #ff8c00, #40e0d0) border-box;
		-webkit-mask:
			linear-gradient(#fff 0 0) padding-box,
			linear-gradient(#fff 0 0);
		mask:
			linear-gradient(#fff 0 0) padding-box,
			linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
	}

	.signup-button:hover {
		background: linear-gradient(45deg, #ff0080, #ff8c00, #40e0d0) border-box;
		border-radius: 6px;
	}

	.try-button {
		color: white;
		border: 2px solid white;
		padding: 6px 12px;
		border-radius: 6px;
		text-decoration: none;
		margin-left: 10px;
		cursor: pointer;
		/* reset button styles */
		background-color: transparent;
	}

	.info-text {
		color: white;
		margin-right: 10px;
		font-size: 14px;
	}

	.try-button:hover {
		background-color: white;
		color: #000;
	}
</style>
