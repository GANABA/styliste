import { json, type RequestEvent } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';
import { apiResponse } from '$lib/utils/api';

/**
 * POST /api/auth/signout
 * Déconnexion d'un styliste (invalidation de la session)
 */
export async function POST({ cookies }: RequestEvent) {
	try {
		// Récupérer le token d'accès depuis les cookies
		const accessToken = cookies.get('sb-access-token');

		if (accessToken) {
			// Déconnexion via Supabase Auth
			const { error } = await supabase.auth.signOut();

			if (error) {
				console.error('Supabase signout error:', error);
			}
		}

		// Supprimer les cookies de session
		cookies.delete('sb-access-token', { path: '/' });
		cookies.delete('sb-refresh-token', { path: '/' });

		return json(
			apiResponse(
				{
					message: 'Déconnexion réussie'
				},
				null
			),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Signout error:', error);
		return json(
			apiResponse(null, {
				message: 'Erreur serveur lors de la déconnexion'
			}),
			{ status: 500 }
		);
	}
}
