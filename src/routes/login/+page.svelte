<!-- src/routes/login/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
    import Header from '$lib/Header.svelte';
	import { login } from '$lib/utils/userUtils';

	let email = '';
	let password = '';
	let errorMessage = '';

	async function handleLogin() {
		try {
			await login(email, password);
			goto('/editor');
		} catch (error) {
			errorMessage = 'Invalid email or password';
		}
	}
</script>

<svelte:head>
  <title>Scribe Login</title>
</svelte:head>

<!-- my strange solution for a whole page background without setting global css -->
<!-- unfortunately when setting whole page css, this is not reliably deleted when navigating to another page -->
<div class="background"></div>

<Header
	showLogin={false}
	showSignUp={true}
	showTry={false}
	showDontHaveAccountText={true}
	showAlreadyHaveAccountText={false}
	showUsername={false}
/>

<div class="page-container">
	<div class="content-container">
		<div class="left-side">
			<h1>Log In</h1>
		</div>
		<div class="right-side">
			{#if errorMessage}
				<p class="error-message">{errorMessage}</p>
			{/if}

			<form on:submit|preventDefault={handleLogin}>
				<div class="input-container">
					<input type="email" bind:value={email} placeholder="Email" required />
					<label for="email">Email</label>
				</div>
				<div class="input-container">
					<input type="password" bind:value={password} placeholder="Password" required />
					<label for="password">Password</label>
				</div>
				<button type="submit">Log In</button>
			</form>
		</div>
	</div>
</div>

<style>
	.background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: radial-gradient(100% 50% ellipse at bottom, rgb(52, 0, 116), black);
		z-index: -1;
	}

	/* Reset default styles */
	* {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	.page-container {
		height: 100%;
		width: 100%;
		left: 0;
		right:0;
		top: 0;

		padding: 40px;
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		color: white;

		font-family: 'Sansation', sans-serif;
	}

	.content-container {
		display: flex;
		background-color: #1b1b1b; /* Gray container */
		border-radius: 30px;
		width: 800px;
		overflow: hidden;
		padding: 40px;
		gap: 40px;
	}

	.left-side {
		flex: 0;
		flex-shrink: 1;
		display: flex;
		/* text should be at top left */
		align-items: flex-start;
		justify-content: center;
		white-space: nowrap;
		font-family: 'Julius Sans One', sans-serif;
	}

	.right-side {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 30px;
	}

	.input-container {
		position: relative;
	}

	input {
		width: 100%;
		padding: 20px 15px;
		border: 1px solid #dddddd;
		border-radius: 10px;
		background: transparent;
		color: #fff;
		font-size: 16px;
	}

	input:focus {
		outline: none;
		border-color: rgb(88, 88, 221);
	}

	label {
		position: absolute;
		left: 15px;
		transform: translateY(-50%);
		background-color: #1b1b1b; /* Match container background */
		color: #888;
		padding: 0 5px;
		transition: 0.2s ease all;
		pointer-events: none;
		font-size: 12px;
		display: none;
	}

	input:not(:placeholder-shown) + label {
		display: inline;
	}

	input:focus + label {
		color: rgb(88, 88, 221);
	}

	button {
		align-self: flex-end;
		padding: 15px 30px;
		background: linear-gradient(45deg, #383ac1, #1da2b1, #15c6da);
		border: none;
		border-radius: 10px;
		color: #fff;
		font-size: 16px;
		cursor: pointer;
		background-size: 200% 200%;
		background-position: 0% 100%;
		transition: background-position 0.5s ease;
	}

	button:hover {
		background-position: 100% 0%;
	}

	.error-message {
		color: red;
		margin-bottom: 20px;
	}
</style>
