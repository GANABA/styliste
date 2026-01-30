import { supabase } from '$lib/supabase';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Récupérer le token d'accès depuis les cookies
	const accessToken = event.cookies.get('sb-access-token');

	if (accessToken) {
		// Vérifier la validité du token
		const {
			data: { user },
			error
		} = await supabase.auth.getUser(accessToken);

		if (!error && user) {
			// Stocker l'utilisateur dans les locals pour accès dans les routes
			event.locals.user = {
				id: user.id,
				email: user.email,
				phone: user.phone
			};
		}
	}

	// Résoudre la requête
	const response = await resolve(event);

	// Ajouter les headers de sécurité
	// Content Security Policy
	const csp = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline'", // unsafe-inline requis pour SvelteKit hydration
		"style-src 'self' 'unsafe-inline'",  // unsafe-inline requis pour Tailwind
		"img-src 'self' data: https:",
		"font-src 'self' data:",
		"connect-src 'self' https://*.supabase.co",
		"frame-ancestors 'none'",
		"base-uri 'self'",
		"form-action 'self'"
	].join('; ');

	response.headers.set('Content-Security-Policy', csp);

	// Autres headers de sécurité
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

	// HSTS (HTTPS uniquement en production)
	if (process.env.NODE_ENV === 'production') {
		response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
	}

	return response;
};
