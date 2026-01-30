<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		onsubmit: (event: SubmitEvent) => void | Promise<void>;
		error?: string | null;
		success?: string | null;
		loading?: boolean;
		children: Snippet;
	}

	let {
		onsubmit,
		error = $bindable(null),
		success = $bindable(null),
		loading = false,
		children
	}: Props = $props();

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		// Réinitialiser les messages
		error = null;
		success = null;

		try {
			await onsubmit(event);
		} catch (err) {
			console.error('Form submission error:', err);
			if (!error) {
				error = 'Une erreur est survenue lors de la soumission du formulaire.';
			}
		}
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	{#if error}
		<div class="p-4 bg-red-50 border border-red-200 rounded-lg">
			<div class="flex items-start">
				<svg class="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
				</svg>
				<p class="ml-3 text-sm text-red-800">{error}</p>
			</div>
		</div>
	{/if}

	{#if success}
		<div class="p-4 bg-green-50 border border-green-200 rounded-lg">
			<div class="flex items-start">
				<svg class="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
				</svg>
				<p class="ml-3 text-sm text-green-800">{success}</p>
			</div>
		</div>
	{/if}

	{@render children()}
</form>
