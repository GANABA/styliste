import { json, type RequestEvent } from '@sveltejs/kit';
import { stylisteProfileSchema } from '$lib/schemas/styliste';
import { supabase } from '$lib/supabase';
import { db } from '$lib/db';
import { stylistes } from '$lib/db/schema';
import { apiResponse } from '$lib/utils/api';
import { eq } from 'drizzle-orm';

/**
 * POST /api/styliste/profile
 * Création du profil styliste (après inscription)
 */
export async function POST({ request, cookies }: RequestEvent) {
	try {
		// Récupérer l'utilisateur authentifié
		const accessToken = cookies.get('sb-access-token');
		if (!accessToken) {
			return json(
				apiResponse(null, {
					message: 'Non authentifié'
				}),
				{ status: 401 }
			);
		}

		const {
			data: { user },
			error: authError
		} = await supabase.auth.getUser(accessToken);

		if (authError || !user) {
			return json(
				apiResponse(null, {
					message: 'Session invalide'
				}),
				{ status: 401 }
			);
		}

		const body = await request.json();

		// Validation Zod
		const validation = stylisteProfileSchema.safeParse(body);
		if (!validation.success) {
			return json(
				apiResponse(null, {
					message: 'Données invalides',
					details: validation.error.flatten()
				}),
				{ status: 400 }
			);
		}

		const profileData = validation.data;

		// Vérifier si un profil existe déjà
		const existingProfile = await db
			.select()
			.from(stylistes)
			.where(eq(stylistes.userId, user.id))
			.limit(1);

		if (existingProfile.length > 0) {
			return json(
				apiResponse(null, {
					message: 'Un profil existe déjà pour cet utilisateur'
				}),
				{ status: 409 }
			);
		}

		// Créer le profil styliste
		const [newProfile] = await db
			.insert(stylistes)
			.values({
				userId: user.id,
				salonName: profileData.salon_name,
				description: profileData.description || null,
				phone: profileData.phone,
				email: profileData.email || null,
				address: profileData.address || null,
				city: profileData.city || null,
				country: profileData.country
			})
			.returning();

		return json(
			apiResponse(
				{
					message: 'Profil créé avec succès',
					profile: {
						id: newProfile.id,
						salonName: newProfile.salonName,
						phone: newProfile.phone,
						email: newProfile.email,
						city: newProfile.city,
						country: newProfile.country
					}
				},
				null
			),
			{ status: 201 }
		);
	} catch (error) {
		console.error('Create profile error:', error);
		return json(
			apiResponse(null, {
				message: 'Erreur serveur lors de la création du profil'
			}),
			{ status: 500 }
		);
	}
}

/**
 * GET /api/styliste/profile
 * Récupération du profil styliste
 */
export async function GET({ cookies }: RequestEvent) {
	try {
		// Récupérer l'utilisateur authentifié
		const accessToken = cookies.get('sb-access-token');
		if (!accessToken) {
			return json(
				apiResponse(null, {
					message: 'Non authentifié'
				}),
				{ status: 401 }
			);
		}

		const {
			data: { user },
			error: authError
		} = await supabase.auth.getUser(accessToken);

		if (authError || !user) {
			return json(
				apiResponse(null, {
					message: 'Session invalide'
				}),
				{ status: 401 }
			);
		}

		// Récupérer le profil styliste
		const [profile] = await db
			.select()
			.from(stylistes)
			.where(eq(stylistes.userId, user.id))
			.limit(1);

		if (!profile) {
			return json(
				apiResponse(null, {
					message: 'Profil non trouvé'
				}),
				{ status: 404 }
			);
		}

		return json(
			apiResponse(
				{
					profile: {
						id: profile.id,
						salonName: profile.salonName,
						description: profile.description,
						phone: profile.phone,
						email: profile.email,
						address: profile.address,
						city: profile.city,
						country: profile.country,
						createdAt: profile.createdAt,
						updatedAt: profile.updatedAt
					}
				},
				null
			),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Get profile error:', error);
		return json(
			apiResponse(null, {
				message: 'Erreur serveur lors de la récupération du profil'
			}),
			{ status: 500 }
		);
	}
}

/**
 * PATCH /api/styliste/profile
 * Modification du profil styliste
 */
export async function PATCH({ request, cookies }: RequestEvent) {
	try {
		// Récupérer l'utilisateur authentifié
		const accessToken = cookies.get('sb-access-token');
		if (!accessToken) {
			return json(
				apiResponse(null, {
					message: 'Non authentifié'
				}),
				{ status: 401 }
			);
		}

		const {
			data: { user },
			error: authError
		} = await supabase.auth.getUser(accessToken);

		if (authError || !user) {
			return json(
				apiResponse(null, {
					message: 'Session invalide'
				}),
				{ status: 401 }
			);
		}

		const body = await request.json();

		// Validation Zod (partielle pour PATCH)
		const validation = stylisteProfileSchema.partial().safeParse(body);
		if (!validation.success) {
			return json(
				apiResponse(null, {
					message: 'Données invalides',
					details: validation.error.flatten()
				}),
				{ status: 400 }
			);
		}

		const updateData = validation.data;

		// Préparer les données pour la mise à jour
		const dbUpdateData: any = {
			updatedAt: new Date()
		};

		if (updateData.salon_name !== undefined) dbUpdateData.salonName = updateData.salon_name;
		if (updateData.description !== undefined) dbUpdateData.description = updateData.description || null;
		if (updateData.phone !== undefined) dbUpdateData.phone = updateData.phone;
		if (updateData.email !== undefined) dbUpdateData.email = updateData.email || null;
		if (updateData.address !== undefined) dbUpdateData.address = updateData.address || null;
		if (updateData.city !== undefined) dbUpdateData.city = updateData.city || null;
		if (updateData.country !== undefined) dbUpdateData.country = updateData.country;

		// Mettre à jour le profil
		const [updatedProfile] = await db
			.update(stylistes)
			.set(dbUpdateData)
			.where(eq(stylistes.userId, user.id))
			.returning();

		if (!updatedProfile) {
			return json(
				apiResponse(null, {
					message: 'Profil non trouvé'
				}),
				{ status: 404 }
			);
		}

		return json(
			apiResponse(
				{
					message: 'Profil mis à jour avec succès',
					profile: {
						id: updatedProfile.id,
						salonName: updatedProfile.salonName,
						description: updatedProfile.description,
						phone: updatedProfile.phone,
						email: updatedProfile.email,
						address: updatedProfile.address,
						city: updatedProfile.city,
						country: updatedProfile.country,
						updatedAt: updatedProfile.updatedAt
					}
				},
				null
			),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Update profile error:', error);
		return json(
			apiResponse(null, {
				message: 'Erreur serveur lors de la mise à jour du profil'
			}),
			{ status: 500 }
		);
	}
}
