<script lang="ts">
  import { ORDER_STATUS_LABELS, type OrderStatus } from '$lib/validations/orders';

  export let status: OrderStatus;

  const statusColors: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    ready: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
  };

  $: label = ORDER_STATUS_LABELS[status];
  $: colorClass = statusColors[status];
</script>

<span
  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {colorClass}"
>
  {label}
</span>
