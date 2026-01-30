import { json, type RequestEvent } from '@sveltejs/kit';
import { signupPhoneSchema } from '$lib/schemas/auth';
import { supabase } from '$lib/supabase';
import { apiResponse } from '$lib/utils/api';
import { checkRateLimit } from '$lib/utils/rate-limit';

/**
 * POST /api/auth/signup
 * Inscription d'un nouveau styliste via téléphone (Phone OTP)
 */
export async function POST({ request, getClientAddress }: RequestEvent) {
	try {
		const body = await request.json();

		// Validation Zod
		const validation = signupPhoneSchema.safeParse(body);
		if (!validation.success) {
			return json(
				apiResponse(null, {
					message: 'Données invalides',
					details: validation.error.flatten()
				}),
				{ status: 400 }
			);
		}

		const { phone } = validation.data;

		// Rate limiting (max 3 OTP par heure par téléphone)
		const rateLimitKey = `signup_otp:${phone}`;
		const isAllowed = await checkRateLimit(rateLimitKey, 3, 3600);

		if (!isAllowed) {
			return json(
				apiResponse(null, {
					message: 'Trop de tentatives. Veuillez réessayer dans 1 heure.'
				}),
				{ status: 429 }
			);
		}

		// Envoi OTP via Supabase Auth
		const { data, error } = await supabase.auth.signInWithOtp({
			phone,
			options: {
				channel: 'sms'
			}
		});

		if (error) {
			return json(
				apiResponse(null, {
					message: 'Erreur lors de l\'envoi du code de vérification',
					details: error.message
				}),
				{ status: 500 }
			);
		}

		return json(
			apiResponse(
				{
					message: 'Code de vérification envoyé par SMS',
					phone
				},
				null
			),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Signup error:', error);
		return json(
			apiResponse(null, {
				message: 'Erreur serveur lors de l\'inscription'
			}),
			{ status: 500 }
		);
	}
}
