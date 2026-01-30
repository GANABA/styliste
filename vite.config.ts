import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		// Minification agressive pour production
		minify: 'terser',
		terserOptions: {
			compress: {
				drop_console: true, // Supprimer les console.log en production
				drop_debugger: true
			}
		},
		// Optimisation des chunks
		rollupOptions: {
			output: {
				// Séparer les vendors (libraries) du code applicatif
				manualChunks(id) {
					if (id.includes('node_modules')) {
						// Grouper les grosses librairies séparément
						if (id.includes('@supabase')) {
							return 'vendor-supabase';
						}
						if (id.includes('drizzle')) {
							return 'vendor-drizzle';
						}
						return 'vendor';
					}
				}
			}
		},
		// Taille d'avertissement de chunk à 500kb
		chunkSizeWarningLimit: 500
	}
});
