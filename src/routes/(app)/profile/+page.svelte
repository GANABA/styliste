<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button, Input, Form, Card, Spinner } from '$lib/components/ui';

	let editMode = $state(false);
	let profileLoading = $state(true);

	// Données du profil
	let profile = $state<any>(null);

	// Données du formulaire
	let salonName = $state('');
	let description = $state('');
	let phone = $state('');
	let email = $state('');
	let address = $state('');
	let city = $state('');
	let country = $state('BJ');

	let loading = $state(false);
	let error = $state<string | null>(null);
	let success = $state<string | null>(null);

	// Charger le profil au montage
	onMount(async () => {
		await loadProfile();
	});

	async function loadProfile() {
		profileLoading = true;
		try {
			const response = await fetch('/api/styliste/profile');

			if (response.status === 404) {
				// Profil n'existe pas, rediriger vers création
				goto('/profile/create');
				return;
			}

			if (!response.ok) {
				throw new Error('Erreur lors du chargement du profil');
			}

			const result = await response.json();
			if (result.data) {
				profile = result.data.profile;
				// Pré-remplir le formulaire
				salonName = profile.salonName || '';
				description = profile.description || '';
				phone = profile.phone || '';
				email = profile.email || '';
				address = profile.address || '';
				city = profile.city || '';
				country = profile.country || 'BJ';
			}
		} catch (err) {
			error = 'Erreur lors du chargement du profil';
		} finally {
			profileLoading = false;
		}
	}

	async function handleUpdateProfile() {
		loading = true;
		error = null;

		try {
			const response = await fetch('/api/styliste/profile', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					salon_name: salonName,
					description: description || undefined,
					phone,
					email: email || undefined,
					address: address || undefined,
					city: city || undefined,
					country
				})
			});

			const result = await response.json();

			if (response.ok && result.data) {
				success = 'Profil mis à jour avec succès !';
				editMode = false;
				await loadProfile();
			} else {
				error = result.error?.message || 'Erreur lors de la mise à jour du profil';
			}
		} catch (err) {
			error = 'Erreur réseau. Veuillez réessayer.';
		} finally {
			loading = false;
		}
	}

	async function handleSignout() {
		try {
			await fetch('/api/auth/signout', { method: 'POST' });
			goto('/signin');
		} catch (err) {
			console.error('Erreur déconnexion:', err);
		}
	}

	function cancelEdit() {
		editMode = false;
		// Réinitialiser les valeurs du formulaire
		if (profile) {
			salonName = profile.salonName || '';
			description = profile.description || '';
			phone = profile.phone || '';
			email = profile.email || '';
			address = profile.address || '';
			city = profile.city || '';
			country = profile.country || 'BJ';
		}
		error = null;
		success = null;
	}
</script>

<svelte:head>
	<title>Mon profil - Styliste.com</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8 px-4">
	<div class="max-w-2xl mx-auto">
		<div class="flex justify-between items-center mb-8">
			<h1 class="text-2xl font-bold text-gray-900">Mon profil professionnel</h1>
			<Button variant="secondary" onclick={handleSignout}>
				Déconnexion
			</Button>
		</div>

		{#if profileLoading}
			<div class="py-12">
				<Spinner size="lg" text="Chargement du profil..." />
			</div>
		{:else if profile}
			<Card padding="lg">
				{#if !editMode}
					<!-- Mode affichage -->
					<div class="space-y-6">
						<div>
							<h3 class="text-sm font-medium text-gray-500">Nom du salon</h3>
							<p class="mt-1 text-lg text-gray-900">{profile.salonName}</p>
						</div>

						{#if profile.description}
							<div>
								<h3 class="text-sm font-medium text-gray-500">Description</h3>
								<p class="mt-1 text-gray-900">{profile.description}</p>
							</div>
						{/if}

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<h3 class="text-sm font-medium text-gray-500">Téléphone</h3>
								<p class="mt-1 text-gray-900">{profile.phone}</p>
							</div>

							{#if profile.email}
								<div>
									<h3 class="text-sm font-medium text-gray-500">Email</h3>
									<p class="mt-1 text-gray-900">{profile.email}</p>
								</div>
							{/if}

							{#if profile.address}
								<div>
									<h3 class="text-sm font-medium text-gray-500">Adresse</h3>
									<p class="mt-1 text-gray-900">{profile.address}</p>
								</div>
							{/if}

							{#if profile.city}
								<div>
									<h3 class="text-sm font-medium text-gray-500">Ville</h3>
									<p class="mt-1 text-gray-900">{profile.city}</p>
								</div>
							{/if}

							<div>
								<h3 class="text-sm font-medium text-gray-500">Pays</h3>
								<p class="mt-1 text-gray-900">{profile.country}</p>
							</div>
						</div>

						<div class="pt-4 border-t">
							<Button onclick={() => editMode = true}>
								Modifier mon profil
							</Button>
						</div>
					</div>
				{:else}
					<!-- Mode édition -->
					<Form bind:error bind:success onsubmit={handleUpdateProfile}>
						<div class="space-y-4">
							<Input
								type="text"
								name="salon_name"
								label="Nom du salon"
								bind:value={salonName}
								required
								maxlength={100}
							/>

							<Input
								type="textarea"
								name="description"
								label="Description (optionnelle)"
								bind:value={description}
								rows={4}
								maxlength={500}
							/>

							<Input
								type="tel"
								name="phone"
								label="Téléphone professionnel"
								bind:value={phone}
								required
							/>

							<Input
								type="email"
								name="email"
								label="Email professionnel (optionnel)"
								bind:value={email}
							/>

							<Input
								type="text"
								name="address"
								label="Adresse (optionnelle)"
								bind:value={address}
								maxlength={200}
							/>

							<Input
								type="text"
								name="city"
								label="Ville (optionnelle)"
								bind:value={city}
								maxlength={100}
							/>

							<div>
								<label for="country" class="block text-sm font-medium text-gray-700 mb-1">
									Pays <span class="text-red-500">*</span>
								</label>
								<select
									id="country"
									name="country"
									bind:value={country}
									required
									class="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								>
									<option value="BJ">Bénin</option>
									<option value="TG">Togo</option>
									<option value="CI">Côte d'Ivoire</option>
									<option value="SN">Sénégal</option>
									<option value="ML">Mali</option>
									<option value="BF">Burkina Faso</option>
									<option value="NE">Niger</option>
									<option value="GH">Ghana</option>
									<option value="NG">Nigeria</option>
									<option value="CM">Cameroun</option>
								</select>
							</div>
						</div>

						<div class="mt-6 flex gap-3">
							<Button type="button" variant="secondary" onclick={cancelEdit}>
								Annuler
							</Button>
							<Button type="submit" {loading}>
								Enregistrer les modifications
							</Button>
						</div>
					</Form>
				{/if}
			</Card>
		{/if}
	</div>
</div>
