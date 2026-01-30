import { json, type RequestEvent } from '@sveltejs/kit';
import { clientSchema } from '$lib/schemas/client';
import { supabase } from '$lib/supabase';
import { db } from '$lib/db';
import { clients, stylistes } from '$lib/db/schema';
import { apiResponse } from '$lib/utils/api';
import { eq, ilike, or, and, desc } from 'drizzle-orm';

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
 * POST /api/clients
 * Création d'un nouveau client
 */
export async function POST({ request, cookies }: RequestEvent) {
	try {
		const accessToken = cookies.get('sb-access-token');
		if (!accessToken) {
			return json(apiResponse(null, { message: 'Non authentifié' }), { status: 401 });
		}

		const stylisteResult = await getStylisteId(accessToken);
		if ('error' in stylisteResult) {
			return json(stylisteResult.error, { status: stylisteResult.status });
		}

		const body = await request.json();

		// Validation Zod
		const validation = clientSchema.safeParse(body);
		if (!validation.success) {
			return json(
				apiResponse(null, {
					message: 'Données invalides',
					details: validation.error.flatten()
				}),
				{ status: 400 }
			);
		}

		const clientData = validation.data;

		// Créer le client
		const [newClient] = await db
			.insert(clients)
			.values({
				stylisteId: stylisteResult.stylisteId,
				name: clientData.name,
				phone: clientData.phone,
				email: clientData.email || null,
				notes: clientData.notes || null
			})
			.returning();

		return json(
			apiResponse(
				{
					message: 'Client créé avec succès',
					client: {
						id: newClient.id,
						name: newClient.name,
						phone: newClient.phone,
						email: newClient.email,
						notes: newClient.notes,
						createdAt: newClient.createdAt
					}
				},
				null
			),
			{ status: 201 }
		);
	} catch (error) {
		console.error('Create client error:', error);
		return json(
			apiResponse(null, { message: 'Erreur serveur lors de la création du client' }),
			{ status: 500 }
		);
	}
}

/**
 * GET /api/clients
 * Liste des clients avec pagination et recherche optionnelle
 */
export async function GET({ url, cookies }: RequestEvent) {
	try {
		const accessToken = cookies.get('sb-access-token');
		if (!accessToken) {
			return json(apiResponse(null, { message: 'Non authentifié' }), { status: 401 });
		}

		const stylisteResult = await getStylisteId(accessToken);
		if ('error' in stylisteResult) {
			return json(stylisteResult.error, { status: stylisteResult.status });
		}

		// Paramètres de pagination et recherche
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const search = url.searchParams.get('q');

		const offset = (page - 1) * limit;

		// Construire la requête avec ou sans recherche
		const whereConditions = search
			? and(
					eq(clients.stylisteId, stylisteResult.stylisteId),
					or(
						ilike(clients.name, `%${search}%`),
						ilike(clients.phone, `%${search}%`)
					)
			  )
			: eq(clients.stylisteId, stylisteResult.stylisteId);

		const clientsList = await db
			.select()
			.from(clients)
			.where(whereConditions)
			.orderBy(desc(clients.createdAt))
			.limit(limit)
			.offset(offset);

		// Compter le total (pour pagination)
		const [{ count }] = await db
			.select({ count: clients.id })
			.from(clients)
			.where(eq(clients.stylisteId, stylisteResult.stylisteId));

		return json(
			apiResponse(
				{
					clients: clientsList.map((c) => ({
						id: c.id,
						name: c.name,
						phone: c.phone,
						email: c.email,
						createdAt: c.createdAt
					})),
					pagination: {
						page,
						limit,
						total: clientsList.length,
						hasMore: offset + clientsList.length < (count as any)
					}
				},
				null
			),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Get clients error:', error);
		return json(
			apiResponse(null, { message: 'Erreur serveur lors de la récupération des clients' }),
			{ status: 500 }
		);
	}
}
