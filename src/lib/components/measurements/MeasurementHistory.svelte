<script lang="ts">
  import { onMount } from 'svelte';
  import MeasurementCard from './MeasurementCard.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import { formatMeasurementType } from '$lib/validations/measurements';

  export let clientId: string;
  export let measurementType: string | undefined = undefined;
  export let limit: number = 50;

  let measurements: any[] = [];
  let loading = true;
  let error = '';

  // Grouper les mesures par type
  $: groupedMeasurements = measurements.reduce((acc, measurement) => {
    const type = measurement.measurementType;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(measurement);
    return acc;
  }, {} as Record<string, any[]>);

  $: measurementTypes = Object.keys(groupedMeasurements).sort((a, b) =>
    formatMeasurementType(a).localeCompare(formatMeasurementType(b))
  );

  async function loadMeasurements() {
    loading = true;
    error = '';

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });

      if (measurementType) {
        params.append('measurementType', measurementType);
      }

      const response = await fetch(`/api/clients/${clientId}/measurements?${params}`);

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des mesures');
      }

      const data = await response.json();
      measurements = data.measurements;
    } catch (err: any) {
      error = err.message || 'Erreur lors du chargement des mesures';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadMeasurements();
  });

  export function refresh() {
    loadMeasurements();
  }
</script>

<div class="space-y-6">
  {#if loading}
    <div class="flex justify-center py-12">
      <Spinner size="lg" />
    </div>
  {:else if error}
    <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-600">{error}</p>
      <button
        on:click={loadMeasurements}
        class="mt-2 text-sm text-red-700 font-medium hover:underline"
      >
        Réessayer
      </button>
    </div>
  {:else if measurements.length === 0}
    <div class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune mesure enregistrée</h3>
      <p class="mt-1 text-sm text-gray-500">
        Commencez par prendre les mesures de ce client.
      </p>
    </div>
  {:else}
    <!-- Affichage groupé par type de mesure -->
    {#each measurementTypes as type}
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="text-base font-semibold text-gray-900 mb-3">
          {formatMeasurementType(type)}
          <span class="text-sm font-normal text-gray-500 ml-2">
            ({groupedMeasurements[type].length} {groupedMeasurements[type].length > 1 ? 'mesures' : 'mesure'})
          </span>
        </h3>

        <div class="space-y-3">
          {#each groupedMeasurements[type] as measurement}
            <MeasurementCard {measurement} />
          {/each}
        </div>
      </div>
    {/each}

    <!-- Compteur total -->
    <div class="text-center text-sm text-gray-500">
      {measurements.length} {measurements.length > 1 ? 'mesures enregistrées' : 'mesure enregistrée'}
    </div>
  {/if}
</div>
