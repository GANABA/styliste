import { json, type RequestEvent } from '@sveltejs/kit';
import { signupEmailSchema } from '$lib/schemas/auth';
import { supabase } from '$lib/supabase';
import { apiResponse } from '$lib/utils/api';

/**
 * POST /api/auth/signup/email
 * Inscription d'un nouveau styliste via email/password
 */
export async function POST({ request }: RequestEvent) {
	try {
		const body = await request.json();

		// Validation Zod
		const validation = signupEmailSchema.safeParse(body);
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

		// Création du compte via Supabase Auth
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${process.env.PUBLIC_APP_URL}/auth/callback`
			}
		});

		if (error) {
			return json(
				apiResponse(null, {
					message: 'Erreur lors de la création du compte',
					details: error.message
				}),
				{ status: 400 }
			);
		}

		return json(
			apiResponse(
				{
					message: 'Compte créé avec succès. Vérifiez votre email pour confirmer.',
					userId: data.user?.id,
					email
				},
				null
			),
			{ status: 201 }
		);
	} catch (error) {
		console.error('Signup email error:', error);
		return json(
			apiResponse(null, {
				message: 'Erreur serveur lors de l\'inscription'
			}),
			{ status: 500 }
		);
	}
}
