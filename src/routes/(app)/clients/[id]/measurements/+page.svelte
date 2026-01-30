<script lang="ts">
  import { page } from '$app/stores';
  import MeasurementHistory from '$lib/components/measurements/MeasurementHistory.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  $: clientId = $page.params.id;
  $: clientName = data.client.name;

  let historyComponent: MeasurementHistory;

  function refreshHistory() {
    historyComponent?.refresh();
  }
</script>

<svelte:head>
  <title>Mesures - {clientName}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-6">
      <a
        href="/clients/{clientId}"
        class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Retour au client
      </a>

      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Historique des mesures</h1>
          <p class="mt-2 text-gray-600">Client : {clientName}</p>
        </div>

        <div class="flex gap-3">
          <button
            on:click={refreshHistory}
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <a
            href="/clients/{clientId}/measurements/new?name={encodeURIComponent(clientName)}"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Prendre mesures
          </a>
        </div>
      </div>
    </div>

    <!-- Historique -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <MeasurementHistory bind:this={historyComponent} {clientId} />
    </div>
  </div>
</div>
