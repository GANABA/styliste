<script lang="ts">
	interface Props {
		src: string;
		alt: string;
		width?: number;
		height?: number;
		lazy?: boolean;
		class?: string;
		objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
	}

	let {
		src,
		alt,
		width,
		height,
		lazy = true,
		class: className = '',
		objectFit = 'cover'
	}: Props = $props();

	const objectFitClass = {
		cover: 'object-cover',
		contain: 'object-contain',
		fill: 'object-fill',
		none: 'object-none',
		'scale-down': 'object-scale-down'
	};
</script>

<img
	{src}
	{alt}
	{width}
	{height}
	loading={lazy ? 'lazy' : 'eager'}
	decoding="async"
	class={`${objectFitClass[objectFit]} ${className}`}
/>
