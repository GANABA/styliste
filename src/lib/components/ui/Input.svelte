<script lang="ts">
	interface Props {
		type?: 'text' | 'tel' | 'email' | 'password' | 'textarea';
		name: string;
		label?: string;
		placeholder?: string;
		value?: string;
		error?: string;
		disabled?: boolean;
		required?: boolean;
		rows?: number;
		maxlength?: number;
		autocomplete?: string | undefined;
		oninput?: (event: Event) => void;
		onblur?: (event: FocusEvent) => void;
	}

	let {
		type = 'text',
		name,
		label,
		placeholder,
		value = $bindable(''),
		error,
		disabled = false,
		required = false,
		rows = 4,
		maxlength,
		autocomplete,
		oninput,
		onblur
	}: Props = $props();

	// Classes de base pour les inputs
	const baseInputClasses = 'block w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors';

	// Classes conditionnelles pour les erreurs
	const inputClass = $derived(
		error
			? `${baseInputClasses} border-red-500 focus:ring-red-500`
			: `${baseInputClasses} border-gray-300`
	);
</script>

<div class="w-full">
	{#if label}
		<label for={name} class="block text-sm font-medium text-gray-700 mb-1">
			{label}
			{#if required}
				<span class="text-red-500">*</span>
			{/if}
		</label>
	{/if}

	{#if type === 'textarea'}
		<textarea
			id={name}
			{name}
			{placeholder}
			{disabled}
			{required}
			{rows}
			{maxlength}
			class={inputClass}
			bind:value
			oninput={oninput}
			onblur={onblur}
		></textarea>
	{:else}
		<input
			id={name}
			{type}
			{name}
			{placeholder}
			{disabled}
			{required}
			{maxlength}
			autocomplete={autocomplete as any}
			class={inputClass}
			bind:value
			oninput={oninput}
			onblur={onblur}
		/>
	{/if}

	{#if error}
		<p class="mt-1 text-sm text-red-600">{error}</p>
	{/if}

	{#if maxlength && value}
		<p class="mt-1 text-xs text-gray-500 text-right">
			{value.length}/{maxlength}
		</p>
	{/if}
</div>
