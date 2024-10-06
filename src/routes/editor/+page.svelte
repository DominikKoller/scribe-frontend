<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { registeredTokens, anonymousTokens } from '$lib/stores/auth';
	import Header from '$lib/Header.svelte';
	import { graphQL } from '$lib/graphQL';
	import TrashIcon from '$lib/assets/Delete Icon.svg';
	import DocumentIcon from '$lib/assets/Document Icon.svg';
	import { DataHandler, Datatable } from '@vincjo/datatables';
	import Th from './Th.svelte';
	import { formatDistanceToNow } from 'date-fns';

	interface Document {
		id: string;
		title: string;
		createdAt: Date | undefined;
		updatedAt: Date | undefined;
	}

	let documents: Document[] = [];
	let newTitle = '';
	let handler = new DataHandler<Document>([], { rowsPerPage: 10 });
	let showDeletePopup = false;
	let documentToDelete: Document | null = null;
	const rows = handler.getRows();

	$: {
		handler.setRows(documents);
		handler.sort('updatedAt', 'desc');
	}

	onMount(async () => {
		if (!$registeredTokens && !$anonymousTokens) {
			goto('/login');
		} else {
			await fetchDocumentTitles();
		}
	});

	const fetchDocumentTitles = async () => {
		try {
			const query = `
                query Documents {
                    documents {
                        id
                        title
                        createdAt
                        updatedAt
                    }
                }
            `;
			const result = await graphQL(query);
			documents = result.documents.map((document: any) => ({
				...document,
				createdAt: isValidDate(document.createdAt) ? new Date(document.createdAt) : undefined,
				updatedAt: isValidDate(document.updatedAt) ? new Date(document.updatedAt) : undefined
			}));

			function isValidDate(dateString: string): boolean {
				const date = new Date(dateString);
				return !isNaN(date.getTime());
			}
		} catch (error) {
			console.error('Error fetching documents:', error);
		}
	};

	const newDocument = async () => {
		try {
			const mutation = `
                mutation CreateDocument($title: String!) {
                    createDocument(title: $title) {
                        id
                    }
                }
            `;
			const result = await graphQL(mutation, { title: 'Untitled Document' });
			newTitle = '';
			goto(`/editor/${result.createDocument.id}`);
		} catch (error) {
			console.error('Error creating document:', error);
		}
	};

	const confirmDeleteDocument = (document: Document) => {
		documentToDelete = document;
		showDeletePopup = true;
	};

	const cancelDelete = () => {
		showDeletePopup = false;
		documentToDelete = null;
	};

	const deleteDocument = async () => {
		if (documentToDelete) {
			try {
				const mutation = `
                    mutation DeleteDocument($id: ID!) {
                        deleteDocument(id: $id)
                    }
                `;
				await graphQL(mutation, { id: documentToDelete.id });
				documents = documents.filter((document) => document.id !== documentToDelete!.id);
				showDeletePopup = false;
				documentToDelete = null;
			} catch (error) {
				console.error('Error deleting document:', error);
			}
		}
	};
</script>

<Header
	showLogin={$registeredTokens === null}
	showSignUp={$registeredTokens === null}
	showTry={false}
	showDontHaveAccountText={false}
	showAlreadyHaveAccountText={false}
	showUsername={true}
	showLogoutButton={$registeredTokens !== null}
/>

<div class="background"></div>

<div class="content-container">
	<div class="title">
		<h1>Your Documents</h1>
		<button class="new-document-button" on:click={newDocument} aria-labelledby="New Document">
			<svg
				viewBox="0 0 40 40"
				width="100%"
				height="100%"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<circle cx="20" cy="20" r="19" stroke="white" />
				<line x1="20" y1="10" x2="20" y2="30" stroke="white" />
				<line x1="10" y1="20" x2="30" y2="20" stroke="white" />
			</svg>
		</button>
	</div>

	<div class="documents-list">
		<Datatable {handler} search={false} rowsPerPage={false} rowCount={false} pagination={false}>
			<table>
				<thead>
					<tr>
						<Th {handler} orderBy="title">Name</Th>
						<Th {handler} orderBy="updatedAt">Modified</Th>
						<Th {handler} orderBy="createdAt">Created</Th>
						<Th {handler}></Th>
					</tr>
				</thead>
				<tbody>
					{#each $rows as document (document.id)}
						<tr class="document-row">
							<td on:click={() => goto(`/editor/${document.id}`)}>
								<img src={DocumentIcon} alt="Document Icon" class="document-icon" />
								{document.title}
							</td>
							<td on:click={() => goto(`/editor/${document.id}`)}>
								{document.updatedAt
									? formatDistanceToNow(document.updatedAt, { addSuffix: true })
									: ''}
							</td>
							<td on:click={() => goto(`/editor/${document.id}`)}>
								{document.createdAt
									? formatDistanceToNow(document.createdAt, { addSuffix: true })
									: ''}
							</td>
							<td>
								<button
									on:click|stopPropagation={() => confirmDeleteDocument(document)}
									class="trash-icon"
									aria-labelledby="Delete Document"
								>
									<img src={TrashIcon} alt="Delete" />
								</button>
							</td>
						</tr>
					{/each}
					{#if $rows.length === 0}
						<tr class="empty-tr">
							<td class="empty-td" colspan="4">You don't have any documents yet. Go create some!</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</Datatable>
	</div>

	{#if showDeletePopup}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="popup-overlay" on:click={cancelDelete}>
			<div class="delete-popup" on:click|stopPropagation>
				<p>Are you sure you want to delete this document?</p>
				<button on:click={cancelDelete}>Cancel</button>
				<button class="delete-button" on:click={deleteDocument}>Delete</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: #1f1f1f;
		z-index: -1;
	}

	.content-container {
		margin-top: 70px;
		padding: 20px;
		color: #d6d6d6;
		font-family: 'Sansation', sans-serif;
	}

	.title {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.title h1 {
		margin: 0;
	}

	.new-document-button {
		background: transparent;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: background 0.3s;
		padding: 0;
	}

	.new-document-button:hover {
		background: linear-gradient(45deg, #ff0080, #ff8c00, #40e0d0);
	}

	.documents-list {
		margin-top: 20px;
		background: #2a2a2a;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	table {
		width: 100%;
		border-collapse: separate;
		border-spacing: 0;
		color: #d6d6d6;

		padding-left: 15px;
		padding-right: 15px;
		padding-bottom: 5px;
	}

	thead {
		background: #2a2a2a;
	}

	tbody td {
		padding: 10px;
		border-bottom: 1px solid #3a3a3a;
		cursor: pointer;
	}

	tbody tr {
		transition: background 0.2s;
	}

	tbody tr:hover {
		background: #3a3a3a;
	}

	.document-icon {
		width: 24px;
		vertical-align: middle;
		margin-right: 8px;
	}

	.trash-icon {
		width: 20px;
		opacity: 0;
		transition: opacity 0.2s;
		cursor: pointer;

		/* reset button styles */
		background: none;
		border: none;
		padding: 0;
	}

	tbody tr:hover .trash-icon {
		opacity: 1;
	}

	.trash-icon:hover {
		filter: invert(31%) sepia(86%) saturate(5940%) hue-rotate(357deg) brightness(103%)
			contrast(106%);
	}

	.popup-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}

	.delete-popup {
		background: #fff;
		padding: 20px;
		border-radius: 8px;
		color: #000;
		max-width: 300px;
		text-align: center;
	}

	.delete-popup p {
		margin-bottom: 20px;
	}

	.delete-popup button {
		margin: 5px;
		padding: 10px 20px;
		border: none;
		cursor: pointer;
		border-radius: 4px;
	}

	.delete-button {
		background: #ff4d4d;
		color: #fff;
	}

	.delete-button:hover {
		background: #ff1a1a;
	}

	.delete-popup button:hover:not(.delete-button) {
		background: #f0f0f0;
	}

	/* TODO minor this kind of thing could be avoided if we built our own Datatable component */
	/* See https://vincjo.fr/datatables/examples/basic */
	.documents-list :global(footer) {
		border-top: none;
	}

	.empty-td {
		color: #aaa;
		text-align: center;
		padding: 20px;
		/* reset hovering styles */
		cursor: default;
	}
	.empty-tr:hover {
		/* reset hovering styles */
		background: transparent;
	}
</style>
