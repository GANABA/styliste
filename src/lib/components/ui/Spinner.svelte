<script lang="ts">
	interface Props {
		size?: 'sm' | 'md' | 'lg' | 'xl';
		color?: 'primary' | 'white' | 'gray';
		text?: string;
		fullScreen?: boolean;
	}

	let {
		size = 'md',
		color = 'primary',
		text,
		fullScreen = false
	}: Props = $props();

	// Tailles du spinner
	const sizes = {
		sm: 'w-4 h-4',
		md: 'w-8 h-8',
		lg: 'w-12 h-12',
		xl: 'w-16 h-16'
	};

	// Couleurs
	const colors = {
		primary: 'text-blue-600',
		white: 'text-white',
		gray: 'text-gray-600'
	};

	const spinnerClass = $derived(`${sizes[size]} ${colors[color]}`);
</script>

{#if fullScreen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
		<div class="flex flex-col items-center">
			<svg
				class={`${spinnerClass} animate-spin`}
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
			{#if text}
				<p class="mt-4 text-sm text-gray-600">{text}</p>
			{/if}
		</div>
	</div>
{:else}
	<div class="flex items-center justify-center">
		<svg
			class={`${spinnerClass} animate-spin`}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
			<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
		</svg>
		{#if text}
			<span class="ml-3 text-sm text-gray-600">{text}</span>
		{/if}
	</div>
{/if}
