<script lang="ts">
	import type { DataHandler } from '@vincjo/datatables';

	interface Document {
		id: string;
		title: string;
		createdAt: Date | undefined;
		updatedAt: Date | undefined;
	}

	export let handler: DataHandler<Document> | undefined = undefined;
	export let orderBy: keyof Document | undefined = undefined;

	const identifier = orderBy?.toString();
	const sorted = handler?.getSort();

	function handleClick() {
		if (!orderBy || !handler) 
			return;
		handler.sort(orderBy);
	}
</script>

<th on:click={handleClick} class:active={$sorted !== undefined && $sorted.identifier === identifier}>
	<div class="flex">
		<strong>
			<slot />
		</strong>
		{#if $sorted !== undefined && $sorted.identifier === identifier}
			{#if $sorted?.direction === 'asc'}
				<span class="sort-arrow">↑</span>
			{:else if $sorted?.direction === 'desc'}
				<span class="sort-arrow">↓</span>
			{/if}
		{/if}
	</div>
</th>

<style>
	th {
		background: inherit;
		margin: 0;
		padding: 10px 10px 13px;
		border-bottom: 1px solid #888888;
		user-select: none;
		color: #d6d6d6;
		font-weight: bold;
	}
	th {
		cursor: pointer;
	}
	/*
	th.active {
		color: #1e90ff;
	}
		*/
	th div.flex {
		padding: 0;
		display: flex;
		align-items: center;
	}
	.sort-arrow {
		margin-left: 5px;
		color: #1e90ff;
	}
</style>
