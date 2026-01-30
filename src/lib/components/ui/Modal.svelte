<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from './Button.svelte';

	interface Props {
		open?: boolean;
		title: string;
		description?: string;
		confirmText?: string;
		cancelText?: string;
		variant?: 'default' | 'danger';
		loading?: boolean;
		onconfirm?: () => void | Promise<void>;
		oncancel?: () => void;
		children?: Snippet;
	}

	let {
		open = $bindable(false),
		title,
		description,
		confirmText = 'Confirmer',
		cancelText = 'Annuler',
		variant = 'default',
		loading = false,
		onconfirm,
		oncancel,
		children
	}: Props = $props();

	function handleCancel() {
		if (!loading) {
			open = false;
			oncancel?.();
		}
	}

	async function handleConfirm() {
		if (onconfirm && !loading) {
			await onconfirm();
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleCancel();
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape' && !loading) {
			handleCancel();
		}
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 overflow-y-auto"
		aria-labelledby="modal-title"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop -->
		<div
			class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
			onclick={handleBackdropClick}
			onkeydown={handleKeyDown}
			role="button"
			tabindex="-1"
		></div>

		<!-- Modal content -->
		<div class="flex min-h-full items-center justify-center p-4">
			<div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
				<!-- Header -->
				<div class="mb-4">
					<h3 class="text-lg font-semibold text-gray-900" id="modal-title">
						{title}
					</h3>
					{#if description}
						<p class="mt-2 text-sm text-gray-600">{description}</p>
					{/if}
				</div>

				<!-- Body -->
				{#if children}
					<div class="mb-6">
						{@render children()}
					</div>
				{/if}

				<!-- Footer buttons -->
				<div class="flex gap-3 justify-end">
					<Button
						variant="secondary"
						onclick={handleCancel}
						disabled={loading}
					>
						{cancelText}
					</Button>
					<Button
						variant={variant === 'danger' ? 'danger' : 'primary'}
						onclick={handleConfirm}
						{loading}
					>
						{confirmText}
					</Button>
				</div>
			</div>
		</div>
	</div>
{/if}
