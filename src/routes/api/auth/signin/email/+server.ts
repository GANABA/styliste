import { json, type RequestEvent } from '@sveltejs/kit';
import { signinEmailSchema } from '$lib/schemas/auth';
import { supabase } from '$lib/supabase';
import { apiResponse } from '$lib/utils/api';

/**
 * POST /api/auth/signin/email
 * Connexion d'un styliste existant via email/password
 */
export async function POST({ request, cookies }: RequestEvent) {
	try {
		const body = await request.json();

		// Validation Zod
		const validation = signinEmailSchema.safeParse(body);
		if (!validation.success) {
			return json(
				apiResponse(null, {
					message: 'Données invalides',
					details: validation.error.flatten()
				}),
				{ status: 400 }
			);
		}

		const { email, password } = validation.data;

		// Connexion via Supabase Auth
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			return json(
				apiResponse(null, {
					message: 'Email ou mot de passe incorrect',
					details: error.message
				}),
				{ status: 401 }
			);
		}

		if (!data.session || !data.user) {
			return json(
				apiResponse(null, {
					message: 'Erreur lors de la création de la session'
				}),
				{ status: 500 }
			);
		}

		// Définir les cookies de session
		cookies.set('sb-access-token', data.session.access_token, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: data.session.expires_in
		});

		cookies.set('sb-refresh-token', data.session.refresh_token, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7 // 7 jours
		});

		return json(
			apiResponse(
				{
					message: 'Connexion réussie',
					userId: data.user.id,
					email: data.user.email
				},
				null
			),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Signin email error:', error);
		return json(
			apiResponse(null, {
				message: 'Erreur serveur lors de la connexion'
			}),
			{ status: 500 }
		);
	}
}
