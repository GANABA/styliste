<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Button, Input, Form, Card, Spinner } from '$lib/components/ui';

	let client = $state<any>(null);
	let pageLoading = $state(true);

	// Données du formulaire
	let name = $state('');
	let phone = $state('');
	let email = $state('');
	let notes = $state('');

	let loading = $state(false);
	let error = $state<string | null>(null);
	let success = $state<string | null>(null);

	const clientId = $derived($page.params.id);

	onMount(async () => {
		await loadClient();
	});

	async function loadClient() {
		pageLoading = true;
		error = null;

		try {
			const response = await fetch(`/api/clients/${clientId}`);
			const result = await response.json();

			if (response.ok && result.data) {
				client = result.data.client;
				// Pré-remplir le formulaire
				name = client.name || '';
				phone = client.phone || '';
				email = client.email || '';
				notes = client.notes || '';
			} else if (response.status === 404) {
				error = 'Client non trouvé';
			} else {
				error = result.error?.message || 'Erreur lors du chargement du client';
			}
		} catch (err) {
			error = 'Erreur réseau. Veuillez réessayer.';
		} finally {
			pageLoading = false;
		}
	}

	async function handleUpdateClient() {
		loading = true;
		error = null;

		try {
			const response = await fetch(`/api/clients/${clientId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name,
					phone,
					email: email || undefined,
					notes: notes || undefined
				})
			});

			const result = await response.json();

			if (response.ok && result.data) {
				success = 'Client mis à jour avec succès ! Redirection...';
				setTimeout(() => goto(`/clients/${clientId}`), 1500);
			} else {
				error = result.error?.message || 'Erreur lors de la mise à jour du client';
			}
		} catch (err) {
			error = 'Erreur réseau. Veuillez réessayer.';
		} finally {
			loading = false;
		}
	}

	function cancelEdit() {
		goto(`/clients/${clientId}`);
	}
</script>

<svelte:head>
	<title>{client ? `Modifier ${client.name} - Styliste.com` : 'Modifier client - Styliste.com'}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8 px-4">
	<div class="max-w-2xl mx-auto">
		<!-- Header -->
		<div class="mb-8">
			<a href="/clients/{clientId}" class="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
				<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
				</svg>
				Retour aux détails
			</a>
			<h1 class="text-2xl font-bold text-gray-900">
				{client ? `Modifier ${client.name}` : 'Modifier le client'}
			</h1>
		</div>

		{#if pageLoading}
			<div class="py-12">
				<Spinner size="lg" text="Chargement du client..." />
			</div>
		{:else if error && !client}
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
			<Card padding="lg">
				<Form bind:error bind:success onsubmit={handleUpdateClient}>
					<div class="space-y-4">
						<!-- Nom -->
						<Input
							type="text"
							name="name"
							label="Nom complet"
							bind:value={name}
							required
							maxlength={100}
						/>

						<!-- Téléphone -->
						<Input
							type="tel"
							name="phone"
							label="Numéro de téléphone"
							bind:value={phone}
							required
							autocomplete="tel"
						/>

						<!-- Email -->
						<Input
							type="email"
							name="email"
							label="Email (optionnel)"
							bind:value={email}
							autocomplete="email"
						/>

						<!-- Notes -->
						<Input
							type="textarea"
							name="notes"
							label="Notes (optionnelles)"
							bind:value={notes}
							rows={4}
							maxlength={1000}
						/>
					</div>

					<div class="mt-6 flex gap-3">
						<Button
							type="button"
							variant="secondary"
							onclick={cancelEdit}
						>
							Annuler
						</Button>
						<Button type="submit" {loading}>
							Enregistrer les modifications
						</Button>
					</div>
				</Form>
			</Card>
		{/if}
	</div>
</div>
