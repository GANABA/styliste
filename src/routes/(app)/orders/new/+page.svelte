<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import OrderForm from '$lib/components/orders/OrderForm.svelte';

  let clientId = '';
  let clientName = '';
  let clients: any[] = [];
  let loadingClients = true;

  let garmentType = '';
  let customGarmentType = '';
  let description = '';
  let price: number | undefined = undefined;
  let dueDate = '';
  let notes = '';
  let loading = false;
  let errors: Record<string, string[]> = {};

  $: preFilledClientId = $page.url.searchParams.get('clientId') || '';
  $: preFilledClientName = $page.url.searchParams.get('clientName') || '';

  async function loadClients() {
    loadingClients = true;
    try {
      const res = await fetch('/api/clients');
      if (!res.ok) throw new Error('Erreur lors du chargement des clients');
      const data = await res.json();
      clients = data.data?.clients || [];
    } catch (err) {
      console.error(err);
    } finally {
      loadingClients = false;
    }
  }

  async function handleSubmit() {
    errors = {};
    loading = true;

    try {
      const finalGarmentType =
        garmentType === 'Autre' && customGarmentType ? customGarmentType : garmentType;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          garmentType: finalGarmentType,
          description: description || undefined,
          price: price || undefined,
          dueDate: dueDate || undefined,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.errors) {
          errors = data.errors;
        } else {
          alert(data.message || 'Erreur lors de la création de la commande');
        }
        return;
      }

      const newOrder = await res.json();
      alert('Commande créée avec succès !');
      goto(`/orders/${newOrder.id}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      loading = false;
    }
  }

  function handleCancel() {
    goto('/orders');
  }

  onMount(() => {
    if (preFilledClientId && preFilledClientName) {
      clientId = preFilledClientId;
      clientName = preFilledClientName;
    } else {
      loadClients();
    }
  });
</script>

<svelte:head>
  <title>Nouvelle commande - Styliste.com</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-gray-900">Nouvelle commande</h1>
    <p class="mt-1 text-sm text-gray-600">Créer une commande pour un client</p>
  </div>

  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    {#if !preFilledClientId}
      <!-- Sélection du client -->
      <div class="mb-6">
        <label for="client-select" class="block text-sm font-medium text-gray-700 mb-1">
          Client <span class="text-red-500">*</span>
        </label>
        {#if loadingClients}
          <p class="text-sm text-gray-500">Chargement des clients...</p>
        {:else}
          <select
            id="client-select"
            bind:value={clientId}
            on:change={(e) => {
              const selected = clients.find((c) => c.id === e.currentTarget.value);
              clientName = selected ? selected.name : '';
            }}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 {errors.clientId
              ? 'border-red-500'
              : ''}"
          >
            <option value="">Sélectionner un client</option>
            {#each clients as client}
              <option value={client.id}>{client.name}</option>
            {/each}
          </select>
          {#if errors.clientId}
            <p class="mt-1 text-sm text-red-500">{errors.clientId[0]}</p>
          {/if}
        {/if}
      </div>
    {/if}

    <!-- Formulaire de commande -->
    <OrderForm
      {clientId}
      {clientName}
      bind:garmentType
      bind:customGarmentType
      bind:description
      bind:price
      bind:dueDate
      bind:notes
      {loading}
      {errors}
      submitLabel="Créer la commande"
      on:submit={handleSubmit}
      on:cancel={handleCancel}
    />
  </div>
</div>
