<script lang="ts">
	import { onMount } from 'svelte';
	import { Card, Spinner } from '$lib/components/ui';
	import OrderStats from '$lib/components/orders/OrderStats.svelte';

	let stats: any = null;
	let loading = true;
	let error = '';

	onMount(async () => {
		await loadStats();
	});

	async function loadStats() {
		loading = true;
		error = '';

		try {
			const res = await fetch('/api/orders/stats');
			if (!res.ok) throw new Error('Erreur lors du chargement des statistiques');

			stats = await res.json();
		} catch (err: any) {
			error = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Tableau de bord - Styliste.com</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8 px-4">
	<div class="max-w-7xl mx-auto">
		<h1 class="text-3xl font-bold text-gray-900 mb-8">Tableau de bord</h1>

		<!-- Statistiques des commandes -->
		{#if loading}
			<div class="py-12">
				<Spinner size="lg" text="Chargement des statistiques..." />
			</div>
		{:else if error}
			<div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
				<p class="text-sm text-red-800">{error}</p>
			</div>
		{:else if stats}
			<OrderStats {stats} />
		{/if}

		<!-- Navigation rapide -->
		<Card title="Navigation rapide" class="mt-8">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<a
					href="/clients"
					class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
				>
					<h3 class="font-medium text-gray-900">Mes clients</h3>
					<p class="text-sm text-gray-600 mt-1">Gérer mes fiches clients</p>
				</a>

				<a
					href="/orders"
					class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
				>
					<h3 class="font-medium text-gray-900">Mes commandes</h3>
					<p class="text-sm text-gray-600 mt-1">Gérer mes commandes en cours</p>
				</a>

				<a
					href="/profile"
					class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
				>
					<h3 class="font-medium text-gray-900">Mon profil</h3>
					<p class="text-sm text-gray-600 mt-1">Modifier mes informations professionnelles</p>
				</a>
			</div>
		</Card>
	</div>
</div>
