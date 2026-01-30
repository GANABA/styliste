<script lang="ts">
  import { createMeasurementSchema, type CreateMeasurementInput, MEASUREMENT_UNITS } from '$lib/validations/measurements';
  import MeasurementTypeSelector from './MeasurementTypeSelector.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';

  export let clientId: string;
  export let onSuccess: (() => void) | undefined = undefined;

  let measurementType = '';
  let value = '';
  let unit: 'cm' | 'in' = 'cm';
  let notes = '';
  let loading = false;
  let error = '';
  let success = false;

  async function handleSubmit() {
    error = '';
    success = false;
    loading = true;

    try {
      // Valider les données avec Zod
      const data: CreateMeasurementInput = {
        clientId,
        measurementType: measurementType.trim(),
        value: parseFloat(value),
        unit,
        notes: notes.trim() || undefined,
      };

      const validatedData = createMeasurementSchema.parse(data);

      // Envoyer au serveur
      const response = await fetch(`/api/clients/${clientId}/measurements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          measurementType: validatedData.measurementType,
          value: validatedData.value,
          unit: validatedData.unit,
          notes: validatedData.notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création de la mesure');
      }

      // Succès
      success = true;

      // Réinitialiser le formulaire
      measurementType = '';
      value = '';
      notes = '';

      // Callback de succès
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 500);
      }
    } catch (err: any) {
      if (err.name === 'ZodError') {
        error = err.errors.map((e: any) => e.message).join(', ');
      } else {
        error = err.message || 'Erreur lors de la création de la mesure';
      }
    } finally {
      loading = false;
    }
  }

  function handleTypeSelect(type: string) {
    measurementType = type;
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
  <!-- Type de mesure -->
  <div>
    <label for="measurementType" class="block text-sm font-medium text-gray-700 mb-2">
      Type de mesure *
    </label>
    <MeasurementTypeSelector
      bind:value={measurementType}
      onSelect={handleTypeSelect}
      required
    />
  </div>

  <!-- Valeur et unité -->
  <div class="grid grid-cols-2 gap-4">
    <div>
      <label for="value" class="block text-sm font-medium text-gray-700 mb-2">
        Valeur *
      </label>
      <input
        type="number"
        id="value"
        bind:value
        step="0.1"
        min="0"
        max="500"
        required
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Ex: 85.5"
      />
    </div>

    <div>
      <label for="unit" class="block text-sm font-medium text-gray-700 mb-2">
        Unité *
      </label>
      <select
        id="unit"
        bind:value={unit}
        required
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {#each MEASUREMENT_UNITS as unitOption}
          <option value={unitOption}>{unitOption}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Notes -->
  <div>
    <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
      Notes (optionnel)
    </label>
    <textarea
      id="notes"
      bind:value={notes}
      rows="3"
      maxlength="500"
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Ajouter des notes ou observations..."
    />
    <p class="text-xs text-gray-500 mt-1">{notes.length}/500 caractères</p>
  </div>

  <!-- Messages d'erreur et succès -->
  {#if error}
    <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-600">{error}</p>
    </div>
  {/if}

  {#if success}
    <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
      <p class="text-sm text-green-600">✓ Mesure enregistrée avec succès</p>
    </div>
  {/if}

  <!-- Bouton submit -->
  <button
    type="submit"
    disabled={loading || !measurementType || !value}
    class="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
  >
    {#if loading}
      <Spinner size="sm" />
      Enregistrement...
    {:else}
      Enregistrer la mesure
    {/if}
  </button>
</form>
