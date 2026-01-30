<script lang="ts">
	import { Card } from '$lib/components/ui';
</script>

<svelte:head>
	<title>Tableau de bord - Styliste.com</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8 px-4">
	<div class="max-w-7xl mx-auto">
		<h1 class="text-3xl font-bold text-gray-900 mb-8">Tableau de bord</h1>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			<!-- Statistiques -->
			<Card>
				<div class="text-center">
					<p class="text-sm text-gray-600">Clients</p>
					<p class="text-3xl font-bold text-gray-900 mt-2">-</p>
				</div>
			</Card>

			<Card>
				<div class="text-center">
					<p class="text-sm text-gray-600">Commandes</p>
					<p class="text-3xl font-bold text-gray-900 mt-2">-</p>
				</div>
			</Card>

			<Card>
				<div class="text-center">
					<p class="text-sm text-gray-600">Mesures</p>
					<p class="text-3xl font-bold text-gray-900 mt-2">-</p>
				</div>
			</Card>
		</div>

		<!-- Navigation rapide -->
		<Card title="Navigation rapide">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<a href="/clients" class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
					<h3 class="font-medium text-gray-900">Mes clients</h3>
					<p class="text-sm text-gray-600 mt-1">Gérer mes fiches clients</p>
				</a>

				<a href="/profile" class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
					<h3 class="font-medium text-gray-900">Mon profil</h3>
					<p class="text-sm text-gray-600 mt-1">Modifier mes informations professionnelles</p>
				</a>
			</div>
		</Card>
	</div>
</div>
