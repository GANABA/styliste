<script lang="ts">
  import { GARMENT_TYPES } from '$lib/validations/orders';

  export let value: string = '';
  export let customValue: string = '';
  export let error: string = '';

  $: isOther = value === 'Autre';
  $: if (!isOther) {
    customValue = '';
  }
</script>

<div>
  <label for="garment-type" class="block text-sm font-medium text-gray-700 mb-1">
    Type de vêtement <span class="text-red-500">*</span>
  </label>
  <select
    id="garment-type"
    bind:value
    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 {error
      ? 'border-red-500'
      : ''}"
  >
    <option value="">Sélectionner un type</option>
    {#each GARMENT_TYPES as type}
      <option value={type}>{type}</option>
    {/each}
  </select>

  {#if isOther}
    <input
      type="text"
      bind:value={customValue}
      placeholder="Préciser le type de vêtement"
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
    />
  {/if}

  {#if error}
    <p class="mt-1 text-sm text-red-500">{error}</p>
  {/if}
</div>
