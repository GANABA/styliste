<script lang="ts">
	import { onMount } from 'svelte';
	import { Button, Card, Input, Spinner, Modal } from '$lib/components/ui';

	let clients = $state<any[]>([]);
	let loading = $state(true);
	let searchQuery = $state('');
	let error = $state<string | null>(null);

	// Pagination
	let currentPage = $state(1);
	let hasMore = $state(false);

	// Modal de suppression
	let deleteModalOpen = $state(false);
	let clientToDelete = $state<any>(null);
	let deleting = $state(false);

	onMount(async () => {
		await loadClients();
	});

	async function loadClients(page = 1) {
		loading = true;
		error = null;

		try {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: '20'
			});

			if (searchQuery.trim()) {
				params.append('q', searchQuery.trim());
			}

			const response = await fetch(`/api/clients?${params}`);
			const result = await response.json();

			if (response.ok && result.data) {
				clients = result.data.clients;
				hasMore = result.data.pagination.hasMore;
				currentPage = page;
			} else {
				error = result.error?.message || 'Erreur lors du chargement des clients';
			}
		} catch (err) {
			error = 'Erreur réseau. Veuillez réessayer.';
		} finally {
			loading = false;
		}
	}

	async function handleSearch() {
		await loadClients(1);
	}

	function openDeleteModal(client: any) {
		clientToDelete = client;
		deleteModalOpen = true;
	}

	async function handleDelete() {
		if (!clientToDelete) return;

		deleting = true;

		try {
			const response = await fetch(`/api/clients/${clientToDelete.id}`, {
				method: 'DELETE'
			});

			const result = await response.json();

			if (response.ok) {
				deleteModalOpen = false;
				clientToDelete = null;
				await loadClients(currentPage);
			} else {
				error = result.error?.message || 'Erreur lors de la suppression';
			}
		} catch (err) {
			error = 'Erreur réseau. Veuillez réessayer.';
		} finally {
			deleting = false;
		}
	}
</script>

<svelte:head>
	<title>Mes clients - Styliste.com</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8 px-4">
	<div class="max-w-7xl mx-auto">
		<!-- Header -->
		<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
			<div>
				<h1 class="text-2xl font-bold text-gray-900">Mes clients</h1>
				<p class="text-gray-600 mt-1">{clients.length} client{clients.length > 1 ? 's' : ''}</p>
			</div>
			<Button onclick={() => window.location.href = '/clients/new'}>
				Nouveau client
			</Button>
		</div>

		<!-- Recherche -->
		<Card padding="md" class="mb-6">
			<div class="flex gap-3">
				<div class="flex-1">
					<Input
						type="text"
						name="search"
						placeholder="Rechercher par nom ou téléphone..."
						bind:value={searchQuery}
						oninput={handleSearch}
					/>
				</div>
			</div>
		</Card>

		<!-- Messages d'erreur -->
		{#if error}
			<div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
				{error}
			</div>
		{/if}

		<!-- Liste des clients -->
		{#if loading}
			<div class="py-12">
				<Spinner size="lg" text="Chargement des clients..." />
			</div>
		{:else if clients.length === 0}
			<Card padding="lg">
				<div class="text-center py-12">
					<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
					</svg>
					<h3 class="mt-4 text-lg font-medium text-gray-900">Aucun client</h3>
					<p class="mt-2 text-gray-600">
						{searchQuery ? 'Aucun client ne correspond à votre recherche.' : 'Commencez par ajouter votre premier client.'}
					</p>
					{#if !searchQuery}
						<div class="mt-6">
							<Button onclick={() => window.location.href = '/clients/new'}>
								Ajouter un client
							</Button>
						</div>
					{/if}
				</div>
			</Card>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each clients as client}
					<Card padding="md">
						<div class="flex justify-between items-start mb-3">
							<h3 class="text-lg font-semibold text-gray-900">{client.name}</h3>
							<div class="flex gap-2">
								<button
									type="button"
									onclick={() => window.location.href = `/clients/${client.id}/edit`}
									class="text-blue-600 hover:text-blue-700"
									title="Modifier"
								>
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
									</svg>
								</button>
								<button
									type="button"
									onclick={() => openDeleteModal(client)}
									class="text-red-600 hover:text-red-700"
									title="Supprimer"
								>
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
									</svg>
								</button>
							</div>
						</div>

						<div class="space-y-2 text-sm">
							<div class="flex items-center text-gray-600">
								<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
								</svg>
								{client.phone}
							</div>

							{#if client.email}
								<div class="flex items-center text-gray-600">
									<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
									</svg>
									{client.email}
								</div>
							{/if}
						</div>

						<div class="mt-4 pt-4 border-t border-gray-200">
							<Button
								variant="secondary"
								size="sm"
								fullWidth
								onclick={() => window.location.href = `/clients/${client.id}`}
							>
								Voir les détails
							</Button>
						</div>
					</Card>
				{/each}
			</div>

			<!-- Pagination -->
			{#if hasMore}
				<div class="mt-6 text-center">
					<Button variant="secondary" onclick={() => loadClients(currentPage + 1)}>
						Charger plus
					</Button>
				</div>
			{/if}
		{/if}
	</div>
</div>

<!-- Modal de confirmation de suppression -->
<Modal
	bind:open={deleteModalOpen}
	title="Supprimer ce client ?"
	description={clientToDelete ? `Êtes-vous sûr de vouloir supprimer ${clientToDelete.name} ? Cette action est irréversible.` : ''}
	confirmText="Supprimer"
	cancelText="Annuler"
	variant="danger"
	loading={deleting}
	onconfirm={handleDelete}
	oncancel={() => {
		deleteModalOpen = false;
		clientToDelete = null;
	}}
/>
