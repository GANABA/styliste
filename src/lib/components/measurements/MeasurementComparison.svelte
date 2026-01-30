<script lang="ts">
  import { formatMeasurementType, formatMeasurementValue, type MeasurementUnit } from '$lib/validations/measurements';

  export let oldMeasurements: Array<{ measurementType: string; value: string; unit: string; takenAt: Date | string }>;
  export let newMeasurements: Array<{ measurementType: string; value: string; unit: string; takenAt: Date | string }>;

  // Créer un map des anciennes mesures par type
  $: oldMap = new Map(
    oldMeasurements.map(m => [m.measurementType, parseFloat(m.value)])
  );

  // Comparer et détecter les changements
  $: changes = newMeasurements
    .map(newM => {
      const oldValue = oldMap.get(newM.measurementType);
      const newValue = parseFloat(newM.value);

      if (oldValue === undefined) {
        return {
          type: newM.measurementType,
          unit: newM.unit,
          oldValue: null,
          newValue,
          change: null,
          isNew: true,
        };
      }

      const change = newValue - oldValue;

      return {
        type: newM.measurementType,
        unit: newM.unit,
        oldValue,
        newValue,
        change,
        isNew: false,
      };
    })
    .filter(c => c.change !== 0 || c.isNew);

  $: hasChanges = changes.length > 0;
</script>

<div class="space-y-4">
  {#if !hasChanges}
    <div class="text-center py-6 bg-gray-50 rounded-lg">
      <p class="text-sm text-gray-600">Aucun changement détecté entre les deux prises de mesures.</p>
    </div>
  {:else}
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h3 class="text-sm font-semibold text-blue-900 mb-2">
        {changes.length} {changes.length > 1 ? 'changements détectés' : 'changement détecté'}
      </h3>
    </div>

    <div class="space-y-3">
      {#each changes as change}
        <div class="bg-white border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h4 class="text-base font-medium text-gray-900">
                {formatMeasurementType(change.type)}
              </h4>

              <div class="mt-2 flex items-center gap-3 text-sm">
                {#if change.isNew}
                  <span class="text-gray-500">Nouvelle mesure</span>
                  <span class="text-green-600 font-semibold">
                    {formatMeasurementValue(change.newValue, change.unit as MeasurementUnit)}
                  </span>
                {:else}
                  <span class="text-gray-500">
                    {formatMeasurementValue(change.oldValue!, change.unit as MeasurementUnit)}
                  </span>
                  <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span class="font-semibold" class:text-green-600={change.change! > 0} class:text-red-600={change.change! < 0}>
                    {formatMeasurementValue(change.newValue, change.unit as MeasurementUnit)}
                  </span>
                {/if}
              </div>
            </div>

            {#if !change.isNew && change.change !== null}
              <div class="text-right">
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  class:bg-green-100={change.change > 0}
                  class:text-green-800={change.change > 0}
                  class:bg-red-100={change.change < 0}
                  class:text-red-800={change.change < 0}
                >
                  {change.change > 0 ? '+' : ''}{change.change.toFixed(1)} {change.unit}
                </span>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
