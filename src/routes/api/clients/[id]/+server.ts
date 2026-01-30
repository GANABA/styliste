import { json, type RequestEvent } from '@sveltejs/kit';
import { clientSchema } from '$lib/schemas/client';
import { supabase } from '$lib/supabase';
import { db } from '$lib/db';
import { clients, stylistes } from '$lib/db/schema';
import { apiResponse } from '$lib/utils/api';
import { eq, and } from 'drizzle-orm';

/**
 * Helper: Récupérer le styliste_id depuis l'utilisateur authentifié
 */
async function getStylisteId(accessToken: string): Promise<{ stylisteId: string } | { error: any; status: number }> {
	const {
		data: { user },
		error: authError
	} = await supabase.auth.getUser(accessToken);

	if (authError || !user) {
		return { error: apiResponse(null, { message: 'Session invalide' }), status: 401 };
	}

	const [styliste] = await db
		.select({ id: stylistes.id })
		.from(stylistes)
		.where(eq(stylistes.userId, user.id))
		.limit(1);

	if (!styliste) {
		return { error: apiResponse(null, { message: 'Profil styliste non trouvé' }), status: 404 };
	}

	return { stylisteId: styliste.id };
}

/**
 * GET /api/clients/[id]
 * Récupération des détails d'un client
 */
export async function GET({ params, cookies }: RequestEvent) {
	try {
		const accessToken = cookies.get('sb-access-token');
		if (!accessToken) {
			return json(apiResponse(null, { message: 'Non authentifié' }), { status: 401 });
		}

		const stylisteResult = await getStylisteId(accessToken);
		if ('error' in stylisteResult) {
			return json(stylisteResult.error, { status: stylisteResult.status });
		}

		const clientId = params.id!;

		// Récupérer le client (RLS via stylisteId)
		const [client] = await db
			.select()
			.from(clients)
			.where(
				and(
					eq(clients.id, clientId),
					eq(clients.stylisteId, stylisteResult.stylisteId)
				)
			)
			.limit(1);

		if (!client) {
			return json(
				apiResponse(null, { message: 'Client non trouvé' }),
				{ status: 404 }
			);
		}

		return json(
			apiResponse(
				{
					client: {
						id: client.id,
						name: client.name,
						phone: client.phone,
						email: client.email,
						notes: client.notes,
						createdAt: client.createdAt,
						updatedAt: client.updatedAt
					}
				},
				null
			),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Get client error:', error);
		return json(
			apiResponse(null, { message: 'Erreur serveur lors de la récupération du client' }),
			{ status: 500 }
		);
	}
}

/**
 * PATCH /api/clients/[id]
 * Modification d'un client
 */
export async function PATCH({ params, request, cookies }: RequestEvent) {
	try {
		const accessToken = cookies.get('sb-access-token');
		if (!accessToken) {
			return json(apiResponse(null, { message: 'Non authentifié' }), { status: 401 });
		}

		const stylisteResult = await getStylisteId(accessToken);
		if ('error' in stylisteResult) {
			return json(stylisteResult.error, { status: stylisteResult.status });
		}

		const clientId = params.id!;
		const body = await request.json();

		// Validation Zod (partielle pour PATCH)
		const validation = clientSchema.partial().safeParse(body);
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

		if (updateData.name !== undefined) dbUpdateData.name = updateData.name;
		if (updateData.phone !== undefined) dbUpdateData.phone = updateData.phone;
		if (updateData.email !== undefined) dbUpdateData.email = updateData.email || null;
		if (updateData.notes !== undefined) dbUpdateData.notes = updateData.notes || null;

		// Mettre à jour le client (RLS via stylisteId)
		const [updatedClient] = await db
			.update(clients)
			.set(dbUpdateData)
			.where(
				and(
					eq(clients.id, clientId),
					eq(clients.stylisteId, stylisteResult.stylisteId)
				)
			)
			.returning();

		if (!updatedClient) {
			return json(
				apiResponse(null, { message: 'Client non trouvé' }),
				{ status: 404 }
			);
		}

		return json(
			apiResponse(
				{
					message: 'Client mis à jour avec succès',
					client: {
						id: updatedClient.id,
						name: updatedClient.name,
						phone: updatedClient.phone,
						email: updatedClient.email,
						notes: updatedClient.notes,
						updatedAt: updatedClient.updatedAt
					}
				},
				null
			),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Update client error:', error);
		return json(
			apiResponse(null, { message: 'Erreur serveur lors de la mise à jour du client' }),
			{ status: 500 }
		);
	}
}

/**
 * DELETE /api/clients/[id]
 * Suppression d'un client
 */
export async function DELETE({ params, cookies }: RequestEvent) {
	try {
		const accessToken = cookies.get('sb-access-token');
		if (!accessToken) {
			return json(apiResponse(null, { message: 'Non authentifié' }), { status: 401 });
		}

		const stylisteResult = await getStylisteId(accessToken);
		if ('error' in stylisteResult) {
			return json(stylisteResult.error, { status: stylisteResult.status });
		}

		const clientId = params.id!;

		// Supprimer le client (RLS via stylisteId)
		const [deletedClient] = await db
			.delete(clients)
			.where(
				and(
					eq(clients.id, clientId),
					eq(clients.stylisteId, stylisteResult.stylisteId)
				)
			)
			.returning();

		if (!deletedClient) {
			return json(
				apiResponse(null, { message: 'Client non trouvé' }),
				{ status: 404 }
			);
		}

		return json(
			apiResponse(
				{
					message: 'Client supprimé avec succès',
					clientId: deletedClient.id
				},
				null
			),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Delete client error:', error);
		return json(
			apiResponse(null, { message: 'Erreur serveur lors de la suppression du client' }),
			{ status: 500 }
		);
	}
}
