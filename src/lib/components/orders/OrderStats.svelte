<script lang="ts">
  import { formatCurrency } from '$lib/helpers/orders';
  import { format } from 'date-fns';
  import { fr } from 'date-fns/locale';
  import OrderStatusBadge from './OrderStatusBadge.svelte';
  import type { OrderStatus } from '$lib/validations/orders';

  export let stats: {
    pending: number;
    ready: number;
    delivered: number;
    monthlyRevenue: number;
    dueThisWeek: Array<{
      order: {
        id: string;
        orderNumber: string;
        garmentType: string;
        dueDate: string | null;
        status: string;
      };
      client: {
        name: string;
      } | null;
    }>;
  };
</script>

<div class="space-y-6">
  <!-- Compteurs par statut -->
  <div class="grid grid-cols-3 gap-4">
    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <p class="text-sm text-gray-600">En cours</p>
      <p class="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
    </div>

    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <p class="text-sm text-gray-600">Prêt</p>
      <p class="text-3xl font-bold text-blue-600 mt-2">{stats.ready}</p>
    </div>

    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <p class="text-sm text-gray-600">Livré ce mois</p>
      <p class="text-3xl font-bold text-green-600 mt-2">{stats.delivered}</p>
    </div>
  </div>

  <!-- Chiffre d'affaires -->
  <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
    <p class="text-sm text-gray-600 mb-2">Chiffre d'affaires du mois</p>
    <p class="text-2xl font-bold text-gray-900">
      {formatCurrency(stats.monthlyRevenue, 'XOF')}
    </p>
  </div>

  <!-- Commandes à livrer cette semaine -->
  {#if stats.dueThisWeek.length > 0}
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="p-4 border-b border-gray-200">
        <h3 class="text-sm font-medium text-gray-900">À livrer cette semaine</h3>
      </div>
      <ul class="divide-y divide-gray-100">
        {#each stats.dueThisWeek as { order, client }}
          <li class="p-4 hover:bg-gray-50">
            <a href="/orders/{order.id}" class="block">
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{order.orderNumber}</p>
                  {#if client}
                    <p class="text-sm text-gray-500 truncate">{client.name}</p>
                  {/if}
                  <p class="text-xs text-gray-500 mt-1">{order.garmentType}</p>
                </div>
                <div class="flex flex-col items-end space-y-1 ml-4">
                  <OrderStatusBadge status={order.status as OrderStatus} />
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
    </div>
  {/if}
</div>
