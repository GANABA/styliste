<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let { data, children } = $props();

	let mobileMenuOpen = $state(false);

	const navigation = [
		{ name: 'Tableau de bord', href: '/dashboard', icon: 'home' },
		{ name: 'Clients', href: '/clients', icon: 'users' },
		{ name: 'Profil', href: '/profile', icon: 'user' }
	];

	function isActive(href: string) {
		return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
	}

	async function handleSignout() {
		try {
			await fetch('/api/auth/signout', { method: 'POST' });
			goto('/signin');
		} catch (err) {
			console.error('Erreur déconnexion:', err);
		}
	}

	function getIcon(icon: string) {
		const icons: Record<string, string> = {
			home: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>',
			users: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>',
			user: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>'
		};
		return icons[icon] || '';
	}
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Desktop Sidebar -->
	<div class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
		<div class="flex flex-col flex-grow bg-white border-r border-gray-200">
			<!-- Logo -->
			<div class="flex items-center flex-shrink-0 px-6 py-5 border-b border-gray-200">
				<h1 class="text-xl font-bold text-gray-900">Styliste.com</h1>
			</div>

			<!-- User info -->
			{#if data.profile}
				<div class="px-6 py-4 border-b border-gray-200">
					<div class="flex items-center">
						<div class="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
							<span class="text-white font-medium text-sm">
								{data.profile.salonName.charAt(0).toUpperCase()}
							</span>
						</div>
						<div class="ml-3 flex-1 min-w-0">
							<p class="text-sm font-medium text-gray-900 truncate">
								{data.profile.salonName}
							</p>
							{#if data.profile.city}
								<p class="text-xs text-gray-500 truncate">{data.profile.city}</p>
							{/if}
						</div>
					</div>
				</div>
			{/if}

			<!-- Navigation -->
			<nav class="flex-1 px-3 py-4 space-y-1">
				{#each navigation as item}
					<a
						href={item.href}
						class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors {isActive(item.href)
							? 'bg-blue-50 text-blue-600'
							: 'text-gray-700 hover:bg-gray-50'}"
					>
						<svg
							class="mr-3 flex-shrink-0 h-5 w-5 {isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							{@html getIcon(item.icon)}
						</svg>
						{item.name}
					</a>
				{/each}
			</nav>

			<!-- Signout button -->
			<div class="flex-shrink-0 px-3 py-4 border-t border-gray-200">
				<button
					type="button"
					onclick={handleSignout}
					class="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
				>
					<svg
						class="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
					</svg>
					Déconnexion
				</button>
			</div>
		</div>
	</div>

	<!-- Mobile header -->
	<div class="lg:hidden">
		<div class="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
			<h1 class="text-lg font-bold text-gray-900">Styliste.com</h1>
			<button
				type="button"
				onclick={() => mobileMenuOpen = !mobileMenuOpen}
				class="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100"
				aria-label="Ouvrir le menu"
			>
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
				</svg>
			</button>
		</div>

		<!-- Mobile menu -->
		{#if mobileMenuOpen}
			<div
				class="fixed inset-0 z-40 bg-gray-600 bg-opacity-75"
				onclick={() => mobileMenuOpen = false}
				onkeydown={(e) => e.key === 'Escape' && (mobileMenuOpen = false)}
				role="button"
				tabindex="0"
				aria-label="Fermer le menu"
			></div>
			<div class="fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-xl">
				<div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
					<h2 class="text-lg font-semibold text-gray-900">Menu</h2>
					<button
						type="button"
						onclick={() => mobileMenuOpen = false}
						class="p-2 rounded-lg text-gray-400 hover:text-gray-500"
						aria-label="Fermer le menu"
					>
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
						</svg>
					</button>
				</div>

				{#if data.profile}
					<div class="px-4 py-4 border-b border-gray-200">
						<div class="flex items-center">
							<div class="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
								<span class="text-white font-medium text-sm">
									{data.profile.salonName.charAt(0).toUpperCase()}
								</span>
							</div>
							<div class="ml-3">
								<p class="text-sm font-medium text-gray-900">{data.profile.salonName}</p>
								{#if data.profile.city}
									<p class="text-xs text-gray-500">{data.profile.city}</p>
								{/if}
							</div>
						</div>
					</div>
				{/if}

				<nav class="px-3 py-4 space-y-1">
					{#each navigation as item}
						<a
							href={item.href}
							onclick={() => mobileMenuOpen = false}
							class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors {isActive(item.href)
								? 'bg-blue-50 text-blue-600'
								: 'text-gray-700 hover:bg-gray-50'}"
						>
							<svg
								class="mr-3 flex-shrink-0 h-5 w-5 {isActive(item.href) ? 'text-blue-600' : 'text-gray-400'}"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								{@html getIcon(item.icon)}
							</svg>
							{item.name}
						</a>
					{/each}
				</nav>

				<div class="px-3 py-4 border-t border-gray-200">
					<button
						type="button"
						onclick={handleSignout}
						class="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50"
					>
						<svg
							class="mr-3 flex-shrink-0 h-5 w-5 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
						</svg>
						Déconnexion
					</button>
				</div>
			</div>
		{/if}
	</div>

	<!-- Main content -->
	<div class="lg:pl-64">
		<main>
			{@render children()}
		</main>
	</div>
</div>
