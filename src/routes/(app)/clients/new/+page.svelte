<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, Input, Form, Card } from '$lib/components/ui';

	let name = $state('');
	let phone = $state('');
	let email = $state('');
	let notes = $state('');

	let loading = $state(false);
	let error = $state<string | null>(null);
	let success = $state<string | null>(null);

	async function handleCreateClient() {
		loading = true;
		error = null;

		try {
			const response = await fetch('/api/clients', {
				method: 'POST',
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
				success = 'Client créé avec succès ! Redirection...';
				setTimeout(() => goto('/clients'), 1500);
			} else {
				error = result.error?.message || 'Erreur lors de la création du client';
			}
		} catch (err) {
			error = 'Erreur réseau. Veuillez réessayer.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Nouveau client - Styliste.com</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8 px-4">
	<div class="max-w-2xl mx-auto">
		<!-- Header -->
		<div class="mb-8">
			<a href="/clients" class="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
				<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
				</svg>
				Retour à la liste
			</a>
			<h1 class="text-2xl font-bold text-gray-900">Nouveau client</h1>
			<p class="mt-2 text-gray-600">Ajoutez un nouveau client à votre carnet d'adresses</p>
		</div>

		<Card padding="lg">
			<Form bind:error bind:success onsubmit={handleCreateClient}>
				<div class="space-y-4">
					<!-- Nom -->
					<Input
						type="text"
						name="name"
						label="Nom complet"
						placeholder="Jean Dupont"
						bind:value={name}
						required
						maxlength={100}
					/>

					<!-- Téléphone -->
					<Input
						type="tel"
						name="phone"
						label="Numéro de téléphone"
						placeholder="+229 XX XX XX XX"
						bind:value={phone}
						required
						autocomplete="tel"
					/>

					<!-- Email -->
					<Input
						type="email"
						name="email"
						label="Email (optionnel)"
						placeholder="jean@example.com"
						bind:value={email}
						autocomplete="email"
					/>

					<!-- Notes -->
					<Input
						type="textarea"
						name="notes"
						label="Notes (optionnelles)"
						placeholder="Informations complémentaires, préférences, remarques..."
						bind:value={notes}
						rows={4}
						maxlength={1000}
					/>
				</div>

				<div class="mt-6 flex gap-3">
					<Button
						type="button"
						variant="secondary"
						onclick={() => goto('/clients')}
					>
						Annuler
					</Button>
					<Button type="submit" {loading}>
						Créer le client
					</Button>
				</div>
			</Form>
		</Card>
	</div>
</div>
