<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import OrderList from '$lib/components/orders/OrderList.svelte';
  import { ORDER_STATUS_LABELS, type OrderStatus } from '$lib/validations/orders';
  import { onMount } from 'svelte';

  let orders: any[] = [];
  let loading = true;
  let error = '';
  let selectedStatus: string = '';
  let searchQuery: string = '';

  $: statusFilter = $page.url.searchParams.get('status') || '';

  async function loadOrders() {
    loading = true;
    error = '';

    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/orders?${params}`);
      if (!res.ok) throw new Error('Erreur lors du chargement des commandes');

      orders = await res.json();
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function handleStatusFilter(status: string) {
    const url = new URL($page.url);
    if (status) {
      url.searchParams.set('status', status);
    } else {
      url.searchParams.delete('status');
    }
    goto(url.toString());
  }

  function handleSearch() {
    loadOrders();
  }

  onMount(() => {
    selectedStatus = statusFilter;
    loadOrders();
  });

  $: if (statusFilter !== selectedStatus) {
    selectedStatus = statusFilter;
    loadOrders();
  }
</script>

<svelte:head>
  <title>Commandes - Styliste.com</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold text-gray-900">Commandes</h1>
    <a
      href="/orders/new"
      class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      Nouvelle commande
    </a>
  </div>

  <!-- Filtres -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Filtre par statut -->
      <div>
        <label for="status-filter" class="block text-sm font-medium text-gray-700 mb-1">
          Filtrer par statut
        </label>
        <select
          id="status-filter"
          value={selectedStatus}
          on:change={(e) => handleStatusFilter(e.currentTarget.value)}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les statuts</option>
          <option value="pending">{ORDER_STATUS_LABELS.pending}</option>
          <option value="ready">{ORDER_STATUS_LABELS.ready}</option>
          <option value="delivered">{ORDER_STATUS_LABELS.delivered}</option>
        </select>
      </div>

      <!-- Recherche -->
      <div>
        <label for="search" class="block text-sm font-medium text-gray-700 mb-1">
          Rechercher
        </label>
        <form on:submit|preventDefault={handleSearch} class="flex space-x-2">
          <input
            type="text"
            id="search"
            bind:value={searchQuery}
            placeholder="Numéro, client, type de vêtement..."
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Chercher
          </button>
        </form>
      </div>
    </div>
  </div>

  <!-- Liste des commandes -->
  {#if loading}
    <div class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-sm text-gray-500">Chargement...</p>
    </div>
  {:else if error}
    <div class="bg-red-50 border border-red-200 rounded-md p-4">
      <p class="text-sm text-red-800">{error}</p>
    </div>
  {:else}
    <OrderList {orders} emptyMessage="Aucune commande trouvée" />
  {/if}
</div>
