import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { orders, stylistes, clients } from '$lib/db/schema';
import { updateOrderSchema } from '$lib/validations/orders';
import { supabase } from '$lib/supabase';
import { eq, and, isNull } from 'drizzle-orm';

// GET /api/orders/[id] - Récupérer les détails d'une commande
export const GET: RequestHandler = async ({ params, cookies }) => {
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
    // Récupérer la commande avec le client associé
    const [result] = await db
      .select({
        order: orders,
        client: clients,
      })
      .from(orders)
      .leftJoin(clients, eq(orders.clientId, clients.id))
      .where(
        and(
          eq(orders.id, params.id),
          eq(orders.stylisteId, styliste.id),
          isNull(orders.deletedAt)
        )
      )
      .limit(1);

    if (!result) {
      return error(404, 'Commande non trouvée');
    }

    return json(result);
  } catch (err: any) {
    console.error('Error fetching order:', err);
    return error(500, 'Erreur lors de la récupération de la commande');
  }
};

// PATCH /api/orders/[id] - Modifier une commande
export const PATCH: RequestHandler = async ({ params, request, cookies }) => {
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

  // Vérifier que la commande existe et appartient au styliste
  const [existingOrder] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.id, params.id),
        eq(orders.stylisteId, styliste.id),
        isNull(orders.deletedAt)
      )
    )
    .limit(1);

  if (!existingOrder) {
    return error(404, 'Commande non trouvée');
  }

  // Vérifier que la commande n'est pas livrée
  if (existingOrder.status === 'delivered') {
    return error(400, 'Impossible de modifier une commande livrée');
  }

  // Valider les données
  const body = await request.json();
  const validationResult = updateOrderSchema.safeParse(body);

  if (!validationResult.success) {
    return error(400, {
      message: 'Données invalides',
      errors: validationResult.error.flatten().fieldErrors,
    });
  }

  const data = validationResult.data;

  try {
    // Convertir dueDate en string si c'est un Date (format YYYY-MM-DD pour la colonne date)
    const dueDateStr = data.dueDate instanceof Date
      ? data.dueDate.toISOString().split('T')[0]
      : data.dueDate;

    // Mettre à jour la commande
    const [updatedOrder] = await db
      .update(orders)
      .set({
        ...data,
        dueDate: dueDateStr,
        price: data.price?.toString(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, params.id))
      .returning();

    return json(updatedOrder);
  } catch (err: any) {
    console.error('Error updating order:', err);
    return error(500, 'Erreur lors de la mise à jour de la commande');
  }
};

// DELETE /api/orders/[id] - Supprimer une commande (soft delete)
export const DELETE: RequestHandler = async ({ params, cookies }) => {
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

  // Vérifier que la commande existe et appartient au styliste
  const [existingOrder] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.id, params.id),
        eq(orders.stylisteId, styliste.id),
        isNull(orders.deletedAt)
      )
    )
    .limit(1);

  if (!existingOrder) {
    return error(404, 'Commande non trouvée');
  }

  // Vérifier que la commande n'est pas livrée
  if (existingOrder.status === 'delivered') {
    return error(400, 'Impossible de supprimer une commande livrée');
  }

  try {
    // Soft delete : marquer comme supprimée
    await db
      .update(orders)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, params.id));

    return json({ success: true, message: 'Commande supprimée avec succès' });
  } catch (err: any) {
    console.error('Error deleting order:', err);
    return error(500, 'Erreur lors de la suppression de la commande');
  }
};
