import { json, type RequestEvent } from '@sveltejs/kit';
import { verifyOtpSchema } from '$lib/schemas/auth';
import { supabase } from '$lib/supabase';
import { apiResponse } from '$lib/utils/api';

/**
 * POST /api/auth/verify-otp
 * Vérification du code OTP envoyé par SMS
 */
export async function POST({ request, cookies }: RequestEvent) {
	try {
		const body = await request.json();

		// Validation Zod
		const validation = verifyOtpSchema.safeParse(body);
		if (!validation.success) {
			return json(
				apiResponse(null, {
					message: 'Données invalides',
					details: validation.error.flatten()
				}),
				{ status: 400 }
			);
		}

		const { phone, token } = validation.data;

		// Vérification du code OTP via Supabase Auth
		const { data, error } = await supabase.auth.verifyOtp({
			phone,
			token,
			type: 'sms'
		});

		if (error) {
			return json(
				apiResponse(null, {
					message: 'Code de vérification invalide ou expiré',
					details: error.message
				}),
				{ status: 400 }
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

		// Définir les cookies de session (pour SvelteKit)
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
					phone: data.user.phone
				},
				null
			),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Verify OTP error:', error);
		return json(
			apiResponse(null, {
				message: 'Erreur serveur lors de la vérification'
			}),
			{ status: 500 }
		);
	}
}
