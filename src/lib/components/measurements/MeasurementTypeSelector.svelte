<script lang="ts">
  import { STANDARD_MEASUREMENT_TYPES, formatMeasurementType } from '$lib/validations/measurements';

  export let value: string = '';
  export let onSelect: ((type: string) => void) | undefined = undefined;
  export let required: boolean = false;

  let showDropdown = false;
  let searchQuery = value;
  let filteredTypes: readonly string[] = STANDARD_MEASUREMENT_TYPES;

  // Synchroniser searchQuery avec value lors des changements externes
  $: if (value !== searchQuery) {
    searchQuery = value;
  }

  // Filtrer les types selon la recherche
  $: {
    if (searchQuery.trim() === '') {
      filteredTypes = STANDARD_MEASUREMENT_TYPES;
    } else {
      const query = searchQuery.toLowerCase();
      filteredTypes = STANDARD_MEASUREMENT_TYPES.filter(type => {
        const displayName = formatMeasurementType(type).toLowerCase();
        return displayName.includes(query) || type.includes(query);
      });
    }
  }

  function selectType(type: string) {
    // Mettre à jour à la fois value et searchQuery
    value = type;
    searchQuery = type;
    showDropdown = false;

    // Appeler le callback
    if (onSelect) {
      onSelect(type);
    }
  }

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;
    searchQuery = newValue;
    value = newValue;
    showDropdown = true;
  }

  function handleFocus() {
    showDropdown = true;
  }

  function handleBlur() {
    // Délai pour permettre le clic sur une option
    setTimeout(() => {
      showDropdown = false;
    }, 300);
  }
</script>

<div class="relative">
  <!-- Input avec autocomplete -->
  <input
    type="text"
    bind:value={searchQuery}
    on:input={handleInput}
    on:focus={handleFocus}
    on:blur={handleBlur}
    {required}
    placeholder="Sélectionner ou saisir un type de mesure"
    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    autocomplete="off"
  />

  <!-- Dropdown avec suggestions -->
  {#if showDropdown && filteredTypes.length > 0}
    <div class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
      {#each filteredTypes as type}
        <button
          type="button"
          on:click={() => selectType(type)}
          class="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
        >
          <span class="text-sm font-medium text-gray-900">
            {formatMeasurementType(type)}
          </span>
          <span class="text-xs text-gray-500 ml-2">
            ({type})
          </span>
        </button>
      {/each}
    </div>
  {/if}

  <!-- Suggestions rapides (quand le champ est vide) -->
  {#if searchQuery.trim() === ''}
    <div class="mt-2">
      <p class="text-xs text-gray-500 mb-2">Suggestions rapides :</p>
      <div class="flex flex-wrap gap-2">
        {#each STANDARD_MEASUREMENT_TYPES.slice(0, 6) as type}
          <button
            type="button"
            on:click={() => selectType(type)}
            class="px-3 py-1 text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 rounded-full transition-colors"
          >
            {formatMeasurementType(type)}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>
