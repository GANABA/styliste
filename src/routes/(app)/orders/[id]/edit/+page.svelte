<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import OrderForm from '$lib/components/orders/OrderForm.svelte';

  let order: any = null;
  let client: any = null;
  let loadingOrder = true;

  let garmentType = '';
  let customGarmentType = '';
  let description = '';
  let price: number | undefined = undefined;
  let dueDate = '';
  let notes = '';
  let loading = false;
  let errors: Record<string, string[]> = {};

  $: orderId = $page.params.id;

  async function loadOrder() {
    loadingOrder = true;
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) throw new Error('Commande non trouvée');

      const data = await res.json();
      order = data.order;
      client = data.client;

      // Pré-remplir le formulaire
      garmentType = order.garmentType;
      description = order.description || '';
      price = order.price ? parseFloat(order.price) : undefined;
      dueDate = order.dueDate || '';
      notes = order.notes || '';
    } catch (err: any) {
      alert(err.message);
      goto('/orders');
    } finally {
      loadingOrder = false;
    }
  }

  async function handleSubmit() {
    if (!order) return;
    if (order.status === 'delivered') {
      alert('Impossible de modifier une commande livrée');
      return;
    }

    errors = {};
    loading = true;

    try {
      const finalGarmentType =
        garmentType === 'Autre' && customGarmentType ? customGarmentType : garmentType;

      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          garmentType: finalGarmentType,
          description: description || undefined,
          price: price || undefined,
          dueDate: dueDate || null,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.errors) {
          errors = data.errors;
        } else {
          alert(data.message || 'Erreur lors de la modification de la commande');
        }
        return;
      }

      alert('Commande modifiée avec succès !');
      goto(`/orders/${orderId}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      loading = false;
    }
  }

  function handleCancel() {
    goto(`/orders/${orderId}`);
  }

  onMount(() => {
    loadOrder();
  });
</script>

<svelte:head>
  <title>Modifier la commande - Styliste.com</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {#if loadingOrder}
    <div class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-sm text-gray-500">Chargement...</p>
    </div>
  {:else if order}
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Modifier la commande</h1>
      <p class="mt-1 text-sm text-gray-600">{order.orderNumber}</p>
    </div>

    {#if order.status === 'delivered'}
      <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
        <p class="text-sm text-yellow-800">
          Cette commande est livrée et ne peut pas être modifiée.
        </p>
        <a href="/orders/{orderId}" class="text-sm text-blue-600 hover:underline mt-2 inline-block">
          Retour aux détails
        </a>
      </div>
    {:else}
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <OrderForm
          clientId={order.clientId}
          clientName={client?.name || ''}
          bind:garmentType
          bind:customGarmentType
          bind:description
          bind:price
          bind:dueDate
          bind:notes
          {loading}
          {errors}
          submitLabel="Enregistrer les modifications"
          on:submit={handleSubmit}
          on:cancel={handleCancel}
        />
      </div>
    {/if}
  {/if}
</div>
