<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		subtitle?: string;
		padding?: 'none' | 'sm' | 'md' | 'lg';
		shadow?: boolean;
		border?: boolean;
		class?: string;
		header?: Snippet;
		footer?: Snippet;
		children: Snippet;
	}

	let {
		title,
		subtitle,
		padding = 'md',
		shadow = true,
		border = true,
		class: className = '',
		header,
		footer,
		children
	}: Props = $props();

	// Classes de padding
	const paddingClasses = {
		none: '',
		sm: 'p-3',
		md: 'p-4 sm:p-6',
		lg: 'p-6 sm:p-8'
	};

	// Classe complète
	const cardClass = $derived(
		`bg-white rounded-lg ${shadow ? 'shadow-md' : ''} ${border ? 'border border-gray-200' : ''} ${paddingClasses[padding]} ${className}`.trim()
	);
</script>

<div class={cardClass}>
	{#if header}
		<div class="mb-4 pb-4 border-b border-gray-200">
			{@render header()}
		</div>
	{:else if title}
		<div class="mb-4 pb-4 border-b border-gray-200">
			<h3 class="text-lg font-semibold text-gray-900">{title}</h3>
			{#if subtitle}
				<p class="mt-1 text-sm text-gray-600">{subtitle}</p>
			{/if}
		</div>
	{/if}

	<div>
		{@render children()}
	</div>

	{#if footer}
		<div class="mt-4 pt-4 border-t border-gray-200">
			{@render footer()}
		</div>
	{/if}
</div>
