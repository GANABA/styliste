<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import MeasurementForm from '$lib/components/measurements/MeasurementForm.svelte';

  $: clientId = $page.params.id;
  $: clientName = $page.url.searchParams.get('name') || 'Client';

  function handleSuccess() {
    goto(`/clients/${clientId}/measurements`);
  }
</script>

<svelte:head>
  <title>Nouvelle mesure - {clientName}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
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

      <h1 class="text-3xl font-bold text-gray-900">Prendre mesures</h1>
      <p class="mt-2 text-gray-600">Client : {clientName}</p>
    </div>

    <!-- Formulaire -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <MeasurementForm {clientId} onSuccess={handleSuccess} />
    </div>

    <!-- Info box -->
    <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-blue-800">Conseil</h3>
          <div class="mt-2 text-sm text-blue-700">
            <ul class="list-disc pl-5 space-y-1">
              <li>Prenez les mesures avec le client debout et détendu</li>
              <li>Utilisez un mètre-ruban souple</li>
              <li>Notez toute particularité dans le champ "Notes"</li>
              <li>Vous pouvez enregistrer plusieurs mesures à la suite</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
