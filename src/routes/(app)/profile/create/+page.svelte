<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button, Input, Form, Card } from '$lib/components/ui';

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

	// Vérifier si l'utilisateur est authentifié au chargement
	onMount(async () => {
		try {
			const response = await fetch('/api/styliste/profile');
			if (response.ok) {
				// Profil existe déjà, rediriger vers dashboard
				goto('/dashboard');
			}
		} catch (err) {
			// Profil n'existe pas, c'est normal
		}
	});

	async function handleCreateProfile() {
		loading = true;
		error = null;

		try {
			const response = await fetch('/api/styliste/profile', {
				method: 'POST',
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
				success = 'Profil créé avec succès ! Redirection...';
				setTimeout(() => goto('/dashboard'), 1500);
			} else {
				error = result.error?.message || 'Erreur lors de la création du profil';
			}
		} catch (err) {
			error = 'Erreur réseau. Veuillez réessayer.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Créer mon profil - Styliste.com</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8 px-4">
	<div class="max-w-2xl mx-auto">
		<div class="mb-8">
			<h1 class="text-2xl font-bold text-gray-900">Créez votre profil professionnel</h1>
			<p class="mt-2 text-gray-600">
				Complétez les informations de votre salon pour finaliser votre inscription.
			</p>
		</div>

		<Card padding="lg">
			<Form bind:error bind:success onsubmit={handleCreateProfile}>
				<div class="space-y-4">
					<!-- Nom du salon -->
					<Input
						type="text"
						name="salon_name"
						label="Nom du salon"
						placeholder="Mon Atelier de Couture"
						bind:value={salonName}
						required
						maxlength={100}
					/>

					<!-- Description -->
					<Input
						type="textarea"
						name="description"
						label="Description (optionnelle)"
						placeholder="Présentez votre salon et vos services..."
						bind:value={description}
						rows={4}
						maxlength={500}
					/>

					<!-- Téléphone -->
					<Input
						type="tel"
						name="phone"
						label="Numéro de téléphone professionnel"
						placeholder="+229 XX XX XX XX"
						bind:value={phone}
						required
						autocomplete="tel"
					/>

					<!-- Email -->
					<Input
						type="email"
						name="email"
						label="Email professionnel (optionnel)"
						placeholder="contact@monsalon.com"
						bind:value={email}
						autocomplete="email"
					/>

					<!-- Adresse -->
					<Input
						type="text"
						name="address"
						label="Adresse (optionnelle)"
						placeholder="123 Rue des Tailleurs"
						bind:value={address}
						maxlength={200}
					/>

					<!-- Ville -->
					<Input
						type="text"
						name="city"
						label="Ville (optionnelle)"
						placeholder="Cotonou"
						bind:value={city}
						maxlength={100}
					/>

					<!-- Pays -->
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

				<div class="mt-6">
					<Button type="submit" fullWidth {loading}>
						Créer mon profil
					</Button>
				</div>
			</Form>
		</Card>
	</div>
</div>
