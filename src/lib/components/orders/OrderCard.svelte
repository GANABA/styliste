<script lang="ts">
  import { formatCurrency } from '$lib/helpers/orders';
  import { format } from 'date-fns';
  import { fr } from 'date-fns/locale';
  import OrderStatusBadge from './OrderStatusBadge.svelte';
  import type { OrderStatus } from '$lib/validations/orders';

  export let order: {
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

  export let client: {
    name: string;
  } | null = null;

  export let href: string = `/orders/${order.id}`;
</script>

<a
  {href}
  class="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
>
  <div class="flex items-start justify-between mb-2">
    <div class="flex-1">
      <p class="text-sm font-medium text-gray-900">{order.orderNumber}</p>
      {#if client}
        <p class="text-sm text-gray-600">{client.name}</p>
      {/if}
    </div>
    <OrderStatusBadge status={order.status as OrderStatus} />
  </div>

  <div class="space-y-1">
    <p class="text-sm font-medium text-gray-900">{order.garmentType}</p>
    {#if order.description}
      <p class="text-sm text-gray-600 line-clamp-2">{order.description}</p>
    {/if}
  </div>

  <div class="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
    <div class="flex flex-col">
      {#if order.price}
        <p class="text-sm font-semibold text-gray-900">
          {formatCurrency(order.price, order.currency)}
        </p>
      {/if}
      {#if order.dueDate}
        <p class="text-xs text-gray-500">
          Livraison : {format(new Date(order.dueDate), 'd MMM yyyy', { locale: fr })}
        </p>
      {/if}
    </div>
    <p class="text-xs text-gray-500">
      Créée le {format(new Date(order.createdAt), 'd MMM yyyy', { locale: fr })}
    </p>
  </div>
</a>
