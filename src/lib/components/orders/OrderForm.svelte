<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import GarmentTypeSelector from './GarmentTypeSelector.svelte';

  export let clientId: string = '';
  export let clientName: string = '';
  export let garmentType: string = '';
  export let customGarmentType: string = '';
  export let description: string = '';
  export let price: number | undefined = undefined;
  export let dueDate: string = '';
  export let notes: string = '';
  export let submitLabel: string = 'Créer la commande';
  export let loading: boolean = false;
  export let errors: Record<string, string[]> = {};

  const dispatch = createEventDispatcher();

  function handleSubmit(e: Event) {
    e.preventDefault();
    dispatch('submit');
  }

  $: finalGarmentType =
    garmentType === 'Autre' && customGarmentType ? customGarmentType : garmentType;
</script>

<form on:submit={handleSubmit} class="space-y-6">
  <!-- Client (read-only si pré-rempli) -->
  {#if clientName}
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1"> Client </label>
      <input
        type="text"
        value={clientName}
        disabled
        class="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
      />
    </div>
  {/if}

  <!-- Type de vêtement -->
  <GarmentTypeSelector
    bind:value={garmentType}
    bind:customValue={customGarmentType}
    error={errors.garmentType?.[0] || ''}
  />

  <!-- Description -->
  <div>
    <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
      Description
    </label>
    <textarea
      id="description"
      bind:value={description}
      rows="3"
      placeholder="Détails de la commande, couleurs, tissus..."
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 {errors.description
        ? 'border-red-500'
        : ''}"
    />
    {#if errors.description}
      <p class="mt-1 text-sm text-red-500">{errors.description[0]}</p>
    {/if}
  </div>

  <!-- Prix -->
  <div>
    <label for="price" class="block text-sm font-medium text-gray-700 mb-1"> Prix (FCFA) </label>
    <input
      type="number"
      id="price"
      bind:value={price}
      min="0"
      step="100"
      placeholder="Ex: 15000"
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 {errors.price
        ? 'border-red-500'
        : ''}"
    />
    {#if errors.price}
      <p class="mt-1 text-sm text-red-500">{errors.price[0]}</p>
    {/if}
  </div>

  <!-- Date de livraison prévue -->
  <div>
    <label for="due-date" class="block text-sm font-medium text-gray-700 mb-1">
      Date de livraison prévue
    </label>
    <input
      type="date"
      id="due-date"
      bind:value={dueDate}
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 {errors.dueDate
        ? 'border-red-500'
        : ''}"
    />
    {#if errors.dueDate}
      <p class="mt-1 text-sm text-red-500">{errors.dueDate[0]}</p>
    {/if}
  </div>

  <!-- Notes -->
  <div>
    <label for="notes" class="block text-sm font-medium text-gray-700 mb-1"> Notes </label>
    <textarea
      id="notes"
      bind:value={notes}
      rows="2"
      placeholder="Notes internes..."
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 {errors.notes
        ? 'border-red-500'
        : ''}"
    />
    {#if errors.notes}
      <p class="mt-1 text-sm text-red-500">{errors.notes[0]}</p>
    {/if}
  </div>

  <!-- Submit -->
  <div class="flex items-center space-x-3">
    <button
      type="submit"
      disabled={loading}
      class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {loading ? 'En cours...' : submitLabel}
    </button>
    <button
      type="button"
      on:click={() => dispatch('cancel')}
      class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
    >
      Annuler
    </button>
  </div>
</form>
