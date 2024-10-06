<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { graphQL } from '$lib/graphQL';
	import smallLogo from '$lib/assets/Logo Small.png';
	import Header from '$lib/Header.svelte';

	let errorMessage = '';

	const comments = [
		'Great start. Consider adding a short convincing fact, for example the 90% admissions rate for students using Scribe.',
		'Good point! Help students write their own essays, instead of generating texts for them. You could add that it’s free to try!'
	];

	const highlightColours = [
		'rgba(7, 176, 125, 1)', // Default color for highlight 1
		'rgba(7, 166, 176, 1)' // Default color for highlight 2
	];

	const selectedHighlightColours = [
		'rgba(219,143,45,1)', // Selected color for highlight 1
		'rgba(219,143,45,1)' // Selected color for highlight 2
	];

	let selectedCommentIndex: number | null = null;

	function selectComment(event: Event) {
		const index = (event.currentTarget as HTMLElement)?.dataset?.index;
		selectedCommentIndex = Number(index);
		event.stopPropagation();
	}

	function deselectComment() {
		selectedCommentIndex = null;
	}
</script>

<!-- my strange solution for a whole page background without setting global css -->
<!-- unfortunately when setting whole page css, this is not reliably deleted when navigating to another page -->
<div class="background"></div>
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="page-container" on:click={deselectComment}>
	<Header
		showLogin={true}
		showSignUp={true}
		showTry={true}
		showDontHaveAccountText={false}
		showAlreadyHaveAccountText={false}
		showUsername={false}
	/>
	<div class="content-container">
		<div class="main-texts">
			<p>
				Your <span
					class="highlight"
					data-index="0"
					on:click={selectComment}
					style="background-color: {selectedCommentIndex === 0
						? selectedHighlightColours[0]
						: highlightColours[0]}">personal tutor for college applications.</span
				>
			</p>
			<p>
				Write <span
					class="highlight"
					data-index="1"
					on:click={selectComment}
					style="background-color: {selectedCommentIndex === 1
						? selectedHighlightColours[1]
						: highlightColours[1]}">your own text.</span
				> Get world-class feedback instantly.
			</p>
		</div>
		<div class="comments">
			{#each comments as comment, index}
				<div
					class="comment {selectedCommentIndex === index ? 'selected' : ''}"
					data-index={index}
					on:click={selectComment}
				>
					<div class="comment-header">
						<div class="profile-picture">
							<img src={smallLogo} alt="Scribe Icon" />
						</div>
						<div class="header-texts">
							<span class="username">Scribe</span>
							<span class="time">Just now</span>
						</div>
					</div>
					<div class="comment-body">
						{comment}
					</div>
				</div>
			{/each}
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
	.content-container {
		display: flex;
		gap: 30px;
		font-family: 'Julius Sans One', sans-serif;
		font-weight: 400;
		font-style: normal;

		font-size: 50px;

		padding-left: 50px;
		padding-right: 50px;
		padding-top: 100px;

		box-sizing: border-box;
		max-width: 1100px;
		margin: 0 auto;
	}
	.main-texts {
		flex: 1;
		color: white;
	}

	.highlight {
		cursor: pointer;
	}
	.comments {
		width: 300px;
		display: flex;
		flex-direction: column;
		gap: 30px;
	}
	.comment {
		background-color: white;
		border-radius: 10px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		padding: 15px;
		max-width: 200px;
		margin: 0px auto;
		font-family: 'Sansation', sans-serif;
		transition: transform 0.2s;
	}
	.comment.selected {
		transform: scale(1.1);
	}
	.comment-header {
		display: flex;
		align-items: center;
		margin-bottom: 10px;
	}
	.profile-picture {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		margin-right: 10px;
	}
	.profile-picture img {
		width: 100%;
	}

	.header-texts {
		display: flex;
		flex-direction: column;
	}
	.username {
		font-weight: bold;
		font-size: 20px;
	}
	.time {
		font-size: 16px;
		color: #666;
	}
	.comment-body {
		font-size: 16px;
		line-height: 1.5;
		color: #333;
	}
</style>
