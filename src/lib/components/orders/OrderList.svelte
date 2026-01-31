<script lang="ts">
  import OrderCard from './OrderCard.svelte';
  import type { OrderStatus } from '$lib/validations/orders';

  export let orders: Array<{
    order: {
      id: string;
      orderNumber: string;
      garmentType: string;
      description: string | null;
      price: string | null;
      currency: string;
      status: string;
      dueDate: string | null;
      createdAt: Date;
    };
    client: {
      name: string;
    } | null;
  }> = [];

  export let emptyMessage: string = 'Aucune commande trouvée';
</script>

{#if orders.length === 0}
  <div class="text-center py-12">
    <svg
      class="mx-auto h-12 w-12 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
    <p class="mt-2 text-sm text-gray-500">{emptyMessage}</p>
  </div>
{:else}
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each orders as { order, client }}
      <OrderCard {order} {client} />
    {/each}
  </div>
{/if}
