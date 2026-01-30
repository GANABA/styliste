<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, Input, Form, Card } from '$lib/components/ui';

	let mode = $state<'phone' | 'email'>('phone');
	let step = $state<'signup' | 'verify'>('signup');

	// Formulaire téléphone
	let phone = $state('');
	let otpCode = $state('');

	// Formulaire email
	let email = $state('');
	let password = $state('');

	let loading = $state(false);
	let error = $state<string | null>(null);
	let success = $state<string | null>(null);

	// Inscription avec téléphone (étape 1 : envoi OTP)
	async function handlePhoneSignup() {
		loading = true;
		error = null;

		try {
			const response = await fetch('/api/auth/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ phone })
			});

			const result = await response.json();

			if (response.ok && result.data) {
				success = result.data.message;
				step = 'verify';
			} else {
				error = result.error?.message || 'Erreur lors de l\'inscription';
			}
		} catch (err) {
			error = 'Erreur réseau. Veuillez réessayer.';
		} finally {
			loading = false;
		}
	}

	// Vérification du code OTP (étape 2)
	async function handleVerifyOtp() {
		loading = true;
		error = null;

		try {
			const response = await fetch('/api/auth/verify-otp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ phone, token: otpCode })
			});

			const result = await response.json();

			if (response.ok && result.data) {
				success = 'Connexion réussie ! Redirection...';
				setTimeout(() => goto('/profile/create'), 1500);
			} else {
				error = result.error?.message || 'Code invalide';
			}
		} catch (err) {
			error = 'Erreur réseau. Veuillez réessayer.';
		} finally {
			loading = false;
		}
	}

	// Inscription avec email
	async function handleEmailSignup() {
		loading = true;
		error = null;

		try {
			const response = await fetch('/api/auth/signup/email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			const result = await response.json();

			if (response.ok && result.data) {
				success = result.data.message;
			} else {
				error = result.error?.message || 'Erreur lors de l\'inscription';
			}
		} catch (err) {
			error = 'Erreur réseau. Veuillez réessayer.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Inscription - Styliste.com</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
	<div class="max-w-md w-full">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-gray-900">Styliste.com</h1>
			<p class="mt-2 text-gray-600">Créez votre compte professionnel</p>
		</div>

		<Card padding="lg">
			{#if step === 'signup'}
				<!-- Sélection du mode d'inscription -->
				<div class="flex gap-2 mb-6">
					<button
						type="button"
						class="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors {mode === 'phone' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
						onclick={() => mode = 'phone'}
					>
						Téléphone
					</button>
					<button
						type="button"
						class="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors {mode === 'email' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
						onclick={() => mode = 'email'}
					>
						Email
					</button>
				</div>

				{#if mode === 'phone'}
					<Form bind:error bind:success onsubmit={handlePhoneSignup}>
						<Input
							type="tel"
							name="phone"
							label="Numéro de téléphone"
							placeholder="+229 XX XX XX XX"
							bind:value={phone}
							required
							autocomplete="tel"
						/>

						<Button type="submit" fullWidth {loading}>
							Recevoir le code de vérification
						</Button>
					</Form>
				{:else}
					<Form bind:error bind:success onsubmit={handleEmailSignup}>
						<Input
							type="email"
							name="email"
							label="Adresse email"
							placeholder="votre@email.com"
							bind:value={email}
							required
							autocomplete="email"
						/>

						<Input
							type="password"
							name="password"
							label="Mot de passe"
							placeholder="Minimum 8 caractères"
							bind:value={password}
							required
							autocomplete="new-password"
						/>

						<Button type="submit" fullWidth {loading}>
							Créer mon compte
						</Button>
					</Form>
				{/if}
			{:else}
				<!-- Vérification OTP -->
				<div class="mb-6">
					<button
						type="button"
						onclick={() => step = 'signup'}
						class="flex items-center text-sm text-gray-600 hover:text-gray-900"
					>
						<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
						</svg>
						Retour
					</button>
				</div>

				<Form bind:error bind:success onsubmit={handleVerifyOtp}>
					<p class="text-sm text-gray-600 mb-4">
						Un code à 6 chiffres a été envoyé au <strong>{phone}</strong>
					</p>

					<Input
						type="text"
						name="otp"
						label="Code de vérification"
						placeholder="000000"
						bind:value={otpCode}
						required
						maxlength={6}
					/>

					<Button type="submit" fullWidth {loading}>
						Vérifier le code
					</Button>
				</Form>
			{/if}

			<div class="mt-6 text-center text-sm text-gray-600">
				Vous avez déjà un compte ?
				<a href="/signin" class="text-blue-600 hover:text-blue-700 font-medium">
					Se connecter
				</a>
			</div>
		</Card>
	</div>
</div>
