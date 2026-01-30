<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Button, Card, Spinner, Modal } from '$lib/components/ui';
	import MeasurementCard from '$lib/components/measurements/MeasurementCard.svelte';

	let client = $state<any>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	// Mesures
	let latestMeasurements = $state<any[]>([]);
	let measurementsLoading = $state(false);

	// Modal de suppression
	let deleteModalOpen = $state(false);
	let deleting = $state(false);

	const clientId = $derived($page.params.id);

	onMount(async () => {
		await loadClient();
		await loadLatestMeasurements();
	});

	async function loadClient() {
		loading = true;
		error = null;

		try {
			const response = await fetch(`/api/clients/${clientId}`);
			const result = await response.json();

			if (response.ok && result.data) {
				client = result.data.client;
			} else if (response.status === 404) {
				error = 'Client non trouvé';
			} else {
				error = result.error?.message || 'Erreur lors du chargement du client';
			}
		} catch (err) {
			error = 'Erreur réseau. Veuillez réessayer.';
		} finally {
			loading = false;
		}
	}

	async function loadLatestMeasurements() {
		measurementsLoading = true;

		try {
			const response = await fetch(`/api/clients/${clientId}/measurements/latest`);
			const result = await response.json();

			if (response.ok) {
				latestMeasurements = result.measurements || [];
			}
		} catch (err) {
			console.error('Erreur lors du chargement des mesures:', err);
		} finally {
			measurementsLoading = false;
		}
	}

	async function handleDelete() {
		deleting = true;

		try {
			const response = await fetch(`/api/clients/${clientId}`, {
				method: 'DELETE'
			});

			const result = await response.json();

			if (response.ok) {
				deleteModalOpen = false;
				goto('/clients');
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
	<title>{client ? `${client.name} - Styliste.com` : 'Client - Styliste.com'}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8 px-4">
	<div class="max-w-4xl mx-auto">
		<!-- Header -->
		<div class="mb-8">
			<a href="/clients" class="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
				<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
				</svg>
				Retour à la liste
			</a>
		</div>

		{#if loading}
			<div class="py-12">
				<Spinner size="lg" text="Chargement du client..." />
			</div>
		{:else if error}
			<Card padding="lg">
				<div class="text-center py-12">
					<svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
					<h3 class="mt-4 text-lg font-medium text-gray-900">Erreur</h3>
					<p class="mt-2 text-gray-600">{error}</p>
					<div class="mt-6">
						<Button onclick={() => goto('/clients')}>
							Retour à la liste
						</Button>
					</div>
				</div>
			</Card>
		{:else if client}
			<!-- Actions -->
			<div class="flex gap-3 mb-6">
				<Button onclick={() => goto(`/clients/${clientId}/edit`)}>
					Modifier
				</Button>
				<Button variant="danger" onclick={() => deleteModalOpen = true}>
					Supprimer
				</Button>
			</div>

			<!-- Informations du client -->
			<Card title="Informations du client" padding="lg">
				<div class="space-y-6">
					<div>
						<h3 class="text-sm font-medium text-gray-500">Nom complet</h3>
						<p class="mt-1 text-lg text-gray-900">{client.name}</p>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<h3 class="text-sm font-medium text-gray-500">Téléphone</h3>
							<p class="mt-1 text-gray-900">{client.phone}</p>
						</div>

						{#if client.email}
							<div>
								<h3 class="text-sm font-medium text-gray-500">Email</h3>
								<p class="mt-1 text-gray-900">{client.email}</p>
							</div>
						{/if}
					</div>

					{#if client.notes}
						<div>
							<h3 class="text-sm font-medium text-gray-500">Notes</h3>
							<p class="mt-1 text-gray-900 whitespace-pre-wrap">{client.notes}</p>
						</div>
					{/if}

					<div class="pt-6 border-t border-gray-200">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
							<div>
								<span class="font-medium">Créé le :</span>
								{new Date(client.createdAt).toLocaleDateString('fr-FR', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
							</div>
							{#if client.updatedAt && client.updatedAt !== client.createdAt}
								<div>
									<span class="font-medium">Modifié le :</span>
									{new Date(client.updatedAt).toLocaleDateString('fr-FR', {
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									})}
								</div>
							{/if}
						</div>
					</div>
				</div>
			</Card>

			<!-- Section Mesures -->
			<Card title="Mesures" padding="lg" class="mt-6">
				{#if measurementsLoading}
					<div class="py-6">
						<Spinner size="md" text="Chargement des mesures..." />
					</div>
				{:else if latestMeasurements.length === 0}
					<div class="text-center py-8">
						<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
						</svg>
						<h3 class="mt-2 text-sm font-medium text-gray-900">Aucune mesure enregistrée</h3>
						<p class="mt-1 text-sm text-gray-500">Commencez par prendre les mesures de ce client.</p>
						<div class="mt-4">
							<Button onclick={() => goto(`/clients/${clientId}/measurements/new?name=${encodeURIComponent(client.name)}`)}>
								Prendre mesures
							</Button>
						</div>
					</div>
				{:else}
					<div class="space-y-4">
						<!-- Compteur et actions -->
						<div class="flex items-center justify-between pb-4 border-b border-gray-200">
							<p class="text-sm text-gray-600">
								{latestMeasurements.length} {latestMeasurements.length > 1 ? 'types de mesures enregistrés' : 'type de mesure enregistré'}
							</p>
							<div class="flex gap-2">
								<Button size="sm" onclick={() => goto(`/clients/${clientId}/measurements?name=${encodeURIComponent(client.name)}`)}>
									Voir historique
								</Button>
								<Button size="sm" onclick={() => goto(`/clients/${clientId}/measurements/new?name=${encodeURIComponent(client.name)}`)}>
									+ Prendre mesures
								</Button>
							</div>
						</div>

						<!-- Liste des dernières mesures -->
						<div class="space-y-2">
							{#each latestMeasurements.slice(0, 5) as measurement}
								<MeasurementCard {measurement} compact={true} />
							{/each}
						</div>

						{#if latestMeasurements.length > 5}
							<div class="pt-4 text-center">
								<a
									href="/clients/{clientId}/measurements?name={encodeURIComponent(client.name)}"
									class="text-sm text-blue-600 hover:text-blue-700 font-medium"
								>
									Voir toutes les mesures ({latestMeasurements.length})
								</a>
							</div>
						{/if}
					</div>
				{/if}
			</Card>

			<!-- Sections futures (Commandes, Rendez-vous) -->
			<div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
				<Card padding="md">
					<div class="text-center">
						<p class="text-sm text-gray-600">Commandes</p>
						<p class="text-2xl font-bold text-gray-900 mt-2">-</p>
						<p class="text-xs text-gray-500 mt-1">À venir</p>
					</div>
				</Card>

				<Card padding="md">
					<div class="text-center">
						<p class="text-sm text-gray-600">Rendez-vous</p>
						<p class="text-2xl font-bold text-gray-900 mt-2">-</p>
						<p class="text-xs text-gray-500 mt-1">À venir</p>
					</div>
				</Card>
			</div>
		{/if}
	</div>
</div>

<!-- Modal de confirmation de suppression -->
<Modal
	bind:open={deleteModalOpen}
	title="Supprimer ce client ?"
	description={client ? `Êtes-vous sûr de vouloir supprimer ${client.name} ? Cette action est irréversible et supprimera également toutes les données associées (mesures, commandes, etc.).` : ''}
	confirmText="Supprimer définitivement"
	cancelText="Annuler"
	variant="danger"
	loading={deleting}
	onconfirm={handleDelete}
	oncancel={() => deleteModalOpen = false}
/>
