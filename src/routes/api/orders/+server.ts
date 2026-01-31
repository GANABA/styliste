import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { orders, stylistes, clients } from '$lib/db/schema';
import { createOrderSchema } from '$lib/validations/orders';
import { generateOrderNumber, getMeasurementsSnapshot } from '$lib/helpers/orders';
import { supabase } from '$lib/supabase';
import { eq, and, desc, like, or, isNull } from 'drizzle-orm';

// POST /api/orders - Créer une nouvelle commande
export const POST: RequestHandler = async ({ request, cookies }) => {
  // Authentification
  const accessToken = cookies.get('sb-access-token');
  if (!accessToken) {
    return error(401, 'Non authentifié');
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(accessToken);
  if (authError || !user) {
    return error(401, 'Session invalide');
  }

  // Récupérer le styliste
  const [styliste] = await db.select().from(stylistes).where(eq(stylistes.userId, user.id)).limit(1);

  if (!styliste) {
    return error(404, 'Profil styliste non trouvé');
  }

  // Valider les données
  const body = await request.json();
  const validationResult = createOrderSchema.safeParse(body);

  if (!validationResult.success) {
    return error(400, {
      message: 'Données invalides',
      errors: validationResult.error.flatten().fieldErrors,
    });
  }

  const data = validationResult.data;

  // Vérifier que le client existe et appartient au styliste
  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, data.clientId), eq(clients.stylisteId, styliste.id)))
    .limit(1);

  if (!client) {
    return error(404, 'Client non trouvé');
  }

  try {
    // Générer le numéro de commande avec retry en cas de collision
    let orderNumber: string;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        orderNumber = await generateOrderNumber(styliste.id, db);

        // Capturer le snapshot des mesures
        const measurementsSnapshot = await getMeasurementsSnapshot(data.clientId, db);

        // Convertir dueDate en string si c'est un Date (format YYYY-MM-DD pour la colonne date)
        const dueDateStr = data.dueDate instanceof Date
          ? data.dueDate.toISOString().split('T')[0]
          : data.dueDate;

        // Créer la commande
        const [newOrder] = await db
          .insert(orders)
          .values({
            stylisteId: styliste.id,
            clientId: data.clientId,
            orderNumber,
            garmentType: data.garmentType,
            description: data.description,
            measurementsSnapshot,
            price: data.price?.toString(),
            currency: data.currency,
            status: 'pending',
            dueDate: dueDateStr,
            notes: data.notes,
          })
          .returning();

        return json(newOrder, { status: 201 });
      } catch (err: any) {
        // Si c'est une violation d'unicité sur order_number, on réessaie
        if (err.code === '23505' && err.constraint === 'orders_order_number_unique') {
          attempts++;
          if (attempts >= maxAttempts) {
            throw new Error('Impossible de générer un numéro de commande unique après 3 tentatives');
          }
          continue;
        }
        throw err;
      }
    }

    throw new Error('Échec de génération du numéro de commande');
  } catch (err: any) {
    console.error('Error creating order:', err);
    return error(500, err.message || 'Erreur lors de la création de la commande');
  }
};

// GET /api/orders - Récupérer la liste des commandes avec filtres
export const GET: RequestHandler = async ({ url, cookies }) => {
  // Authentification
  const accessToken = cookies.get('sb-access-token');
  if (!accessToken) {
    return error(401, 'Non authentifié');
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(accessToken);
  if (authError || !user) {
    return error(401, 'Session invalide');
  }

  // Récupérer le styliste
  const [styliste] = await db.select().from(stylistes).where(eq(stylistes.userId, user.id)).limit(1);

  if (!styliste) {
    return error(404, 'Profil styliste non trouvé');
  }

  try {
    // Paramètres de filtrage
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const clientId = url.searchParams.get('clientId');

    // Construction de la requête
    const conditions = [eq(orders.stylisteId, styliste.id), isNull(orders.deletedAt)];

    // Filtre par statut
    if (status) {
      conditions.push(eq(orders.status, status));
    }

    // Filtre par client
    if (clientId) {
      conditions.push(eq(orders.clientId, clientId));
    }

    // Recherche par numéro de commande, type de vêtement
    if (search) {
      conditions.push(
        or(
          like(orders.orderNumber, `%${search}%`),
          like(orders.garmentType, `%${search}%`)
        ) as any
      );
    }

    // Récupérer les commandes
    const ordersList = await db
      .select({
        order: orders,
        client: clients,
      })
      .from(orders)
      .leftJoin(clients, eq(orders.clientId, clients.id))
      .where(and(...conditions))
      .orderBy(desc(orders.createdAt));

    return json(ordersList);
  } catch (err: any) {
    console.error('Error fetching orders:', err);
    return error(500, 'Erreur lors de la récupération des commandes');
  }
};
