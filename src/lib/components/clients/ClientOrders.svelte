<script lang="ts">
  import OrderStatusBadge from '$lib/components/orders/OrderStatusBadge.svelte';
  import { formatCurrency } from '$lib/helpers/orders';
  import { format } from 'date-fns';
  import { fr } from 'date-fns/locale';
  import type { OrderStatus } from '$lib/validations/orders';

  export let clientId: string;
  export let clientName: string;
  export let orders: Array<{
    id: string;
    orderNumber: string;
    garmentType: string;
    description: string | null;
    price: string | null;
    currency: string;
    status: string;
    dueDate: string | null;
    createdAt: Date;
  }> = [];
</script>

<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold text-gray-900">Commandes</h2>
    <a
      href="/orders/new?clientId={clientId}&clientName={encodeURIComponent(clientName)}"
      class="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700"
    >
      Nouvelle commande
    </a>
  </div>

  {#if orders.length === 0}
    <div class="text-center py-8">
      <svg
        class="mx-auto h-10 w-10 text-gray-400"
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
      <p class="mt-2 text-sm text-gray-500">Aucune commande pour ce client</p>
      <a
        href="/orders/new?clientId={clientId}&clientName={encodeURIComponent(clientName)}"
        class="mt-3 inline-block text-sm text-blue-600 hover:underline"
      >
        Créer la première commande
      </a>
    </div>
  {:else}
    <ul class="divide-y divide-gray-100">
      {#each orders as order}
        <li class="py-3 hover:bg-gray-50 transition-colors">
          <a href="/orders/{order.id}" class="block">
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{order.orderNumber}</p>
                <p class="text-sm text-gray-600 truncate">{order.garmentType}</p>
                {#if order.description}
                  <p class="text-xs text-gray-500 mt-1 line-clamp-1">{order.description}</p>
                {/if}
              </div>
              <div class="flex flex-col items-end space-y-1 ml-4">
                <OrderStatusBadge status={order.status as OrderStatus} />
                {#if order.price}
                  <p class="text-sm font-medium text-gray-900">
                    {formatCurrency(order.price, order.currency)}
                  </p>
                {/if}
                {#if order.dueDate}
                  <p class="text-xs text-gray-500">
                    {format(new Date(order.dueDate), 'd MMM', { locale: fr })}
                  </p>
                {/if}
              </div>
            </div>
          </a>
        </li>
      {/each}
    </ul>

    {#if orders.length > 3}
      <div class="mt-4 text-center">
        <a
          href="/orders?search={encodeURIComponent(clientName)}"
          class="text-sm text-blue-600 hover:underline"
        >
          Voir toutes les commandes ({orders.length})
        </a>
      </div>
    {/if}
  {/if}
</div>
