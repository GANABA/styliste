<script lang="ts">
  import {
    ORDER_STATUSES,
    ORDER_STATUS_LABELS,
    canTransitionTo,
    type OrderStatus,
  } from '$lib/validations/orders';

  export let currentStatus: OrderStatus;
  export let value: OrderStatus;
  export let disabled: boolean = false;

  $: availableStatuses = ORDER_STATUSES.filter((status) =>
    canTransitionTo(currentStatus, status)
  );
</script>

<div>
  <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
    Changer le statut
  </label>
  <select
    id="status"
    bind:value
    {disabled}
    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
  >
    <option value={currentStatus}>{ORDER_STATUS_LABELS[currentStatus]} (actuel)</option>
    {#each availableStatuses as status}
      <option value={status}>{ORDER_STATUS_LABELS[status]}</option>
    {/each}
  </select>
</div>
