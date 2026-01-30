<script lang="ts">
  import { formatMeasurementType, formatMeasurementValue, type MeasurementUnit } from '$lib/validations/measurements';
  import { formatDistance } from 'date-fns';
  import { fr } from 'date-fns/locale';

  export let measurement: {
    id: string;
    measurementType: string;
    value: string;
    unit: string;
    notes: string | null;
    takenAt: Date | string;
  };

  export let onEdit: ((id: string) => void) | undefined = undefined;
  export let compact: boolean = false;

  $: takenAtDate = typeof measurement.takenAt === 'string'
    ? new Date(measurement.takenAt)
    : measurement.takenAt;

  $: timeAgo = formatDistance(takenAtDate, new Date(), {
    addSuffix: true,
    locale: fr
  });
</script>

{#if compact}
  <!-- Version compacte pour les listes -->
  <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
    <div class="flex-1">
      <p class="text-sm font-medium text-gray-900">
        {formatMeasurementType(measurement.measurementType)}
      </p>
      <p class="text-xs text-gray-500">{timeAgo}</p>
    </div>
    <div class="text-right">
      <p class="text-lg font-semibold text-blue-600">
        {formatMeasurementValue(parseFloat(measurement.value), measurement.unit as MeasurementUnit)}
      </p>
    </div>
  </div>
{:else}
  <!-- Version carte complète -->
  <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1">
        <h3 class="text-base font-semibold text-gray-900">
          {formatMeasurementType(measurement.measurementType)}
        </h3>
        <p class="text-sm text-gray-500">{timeAgo}</p>
      </div>

      <div class="text-right">
        <p class="text-2xl font-bold text-blue-600">
          {formatMeasurementValue(parseFloat(measurement.value), measurement.unit as MeasurementUnit)}
        </p>
      </div>
    </div>

    {#if measurement.notes}
      <div class="mt-3 p-3 bg-gray-50 rounded-lg">
        <p class="text-sm text-gray-700">
          <span class="font-medium">Note :</span> {measurement.notes}
        </p>
      </div>
    {/if}

    {#if onEdit}
      <div class="mt-3 pt-3 border-t border-gray-100">
        <button
          on:click={() => onEdit && onEdit(measurement.id)}
          class="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Modifier
        </button>
      </div>
    {/if}
  </div>
{/if}
