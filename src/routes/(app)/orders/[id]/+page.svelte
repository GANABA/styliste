<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import OrderStatusBadge from '$lib/components/orders/OrderStatusBadge.svelte';
  import OrderStatusSelector from '$lib/components/orders/OrderStatusSelector.svelte';
  import { formatCurrency } from '$lib/helpers/orders';
  import { format } from 'date-fns';
  import { fr } from 'date-fns/locale';
  import type { OrderStatus } from '$lib/validations/orders';

  let order: any = null;
  let client: any = null;
  let loading = true;
  let error = '';
  let showDeleteConfirm = false;
  let deleting = false;
  let updatingStatus = false;
  let newStatus: OrderStatus;

  $: orderId = $page.params.id;
  $: if (order) {
    newStatus = order.status as OrderStatus;
  }

  async function loadOrder() {
    loading = true;
    error = '';

    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) throw new Error('Commande non trouvée');

      const data = await res.json();
      order = data.order;
      client = data.client;
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function handleStatusChange() {
    if (newStatus === order.status) return;

    updatingStatus = true;
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erreur lors du changement de statut');
      }

      order = await res.json();
      alert('Statut mis à jour avec succès');
    } catch (err: any) {
      alert(err.message);
      newStatus = order.status;
    } finally {
      updatingStatus = false;
    }
  }

  async function handleDelete() {
    deleting = true;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erreur lors de la suppression');
      }

      alert('Commande supprimée avec succès');
      goto('/orders');
    } catch (err: any) {
      alert(err.message);
    } finally {
      deleting = false;
      showDeleteConfirm = false;
    }
  }

  onMount(() => {
    loadOrder();
  });
</script>

<svelte:head>
  <title>{order ? order.orderNumber : 'Commande'} - Styliste.com</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {#if loading}
    <div class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-sm text-gray-500">Chargement...</p>
    </div>
  {:else if error}
    <div class="bg-red-50 border border-red-200 rounded-md p-4">
      <p class="text-sm text-red-800">{error}</p>
      <a href="/orders" class="text-sm text-blue-600 hover:underline mt-2 inline-block">
        Retour aux commandes
      </a>
    </div>
  {:else if order}
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
        {#if client}
          <a href="/clients/{client.id}" class="text-sm text-blue-600 hover:underline">
            {client.name}
          </a>
        {/if}
      </div>
      <OrderStatusBadge status={order.status} />
    </div>

    <!-- Détails -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      <!-- Informations générales -->
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations</h2>
        <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt class="text-sm font-medium text-gray-500">Type de vêtement</dt>
            <dd class="mt-1 text-sm text-gray-900">{order.garmentType}</dd>
          </div>
          {#if order.price}
            <div>
              <dt class="text-sm font-medium text-gray-500">Prix</dt>
              <dd class="mt-1 text-sm font-semibold text-gray-900">
                {formatCurrency(order.price, order.currency)}
              </dd>
            </div>
          {/if}
          {#if order.dueDate}
            <div>
              <dt class="text-sm font-medium text-gray-500">Date de livraison prévue</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {format(new Date(order.dueDate), 'd MMMM yyyy', { locale: fr })}
              </dd>
            </div>
          {/if}
          <div>
            <dt class="text-sm font-medium text-gray-500">Créée le</dt>
            <dd class="mt-1 text-sm text-gray-900">
              {format(new Date(order.createdAt), 'd MMMM yyyy à HH:mm', { locale: fr })}
            </dd>
          </div>
        </dl>
      </div>

      <!-- Description -->
      {#if order.description}
        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Description</h2>
          <p class="text-sm text-gray-700 whitespace-pre-wrap">{order.description}</p>
        </div>
      {/if}

      <!-- Notes -->
      {#if order.notes}
        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
          <p class="text-sm text-gray-700 whitespace-pre-wrap">{order.notes}</p>
        </div>
      {/if}

      <!-- Mesures snapshot -->
      {#if order.measurementsSnapshot && Object.keys(order.measurementsSnapshot).length > 0}
        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Mesures (snapshot)</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            {#each Object.entries(order.measurementsSnapshot) as [type, data]}
              {#if type !== 'taken_at'}
                <div class="bg-gray-50 p-2 rounded">
                  <p class="text-xs text-gray-600">{type.replace(/_/g, ' ')}</p>
                  <p class="text-sm font-medium text-gray-900">
                    {data.value}
                    {data.unit}
                  </p>
                </div>
              {/if}
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- Actions -->
    <div class="mt-6 space-y-4">
      <!-- Changer le statut -->
      {#if order.status !== 'delivered'}
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <OrderStatusSelector
            currentStatus={order.status}
            bind:value={newStatus}
            disabled={updatingStatus}
          />
          {#if newStatus !== order.status}
            <button
              on:click={handleStatusChange}
              disabled={updatingStatus}
              class="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {updatingStatus ? 'Mise à jour...' : 'Mettre à jour le statut'}
            </button>
          {/if}
        </div>
      {/if}

      <!-- Boutons d'action -->
      <div class="flex flex-wrap gap-3">
        <a
          href="/orders/{orderId}/edit"
          class="flex-1 text-center bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 {order.status ===
          'delivered'
            ? 'opacity-50 cursor-not-allowed pointer-events-none'
            : ''}"
        >
          Modifier
        </a>
        <button
          on:click={() => (showDeleteConfirm = true)}
          disabled={order.status === 'delivered'}
          class="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Supprimer
        </button>
        <a
          href="/orders"
          class="flex-1 text-center border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
        >
          Retour
        </a>
      </div>
    </div>

    <!-- Modale de confirmation de suppression -->
    {#if showDeleteConfirm}
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md mx-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Confirmer la suppression</h3>
          <p class="text-sm text-gray-700 mb-6">
            Êtes-vous sûr de vouloir supprimer cette commande ? Cette action ne peut pas être
            annulée.
          </p>
          <div class="flex space-x-3">
            <button
              on:click={handleDelete}
              disabled={deleting}
              class="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400"
            >
              {deleting ? 'Suppression...' : 'Supprimer'}
            </button>
            <button
              on:click={() => (showDeleteConfirm = false)}
              class="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>
