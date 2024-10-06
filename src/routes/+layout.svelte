<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../global.css';
	import { tryFetchUserData } from '$lib/utils/userUtils';
	import { onMount } from 'svelte';

	onMount(() => {
		tryFetchUserData();
	});

</script>

<main>
	<slot />
</main>