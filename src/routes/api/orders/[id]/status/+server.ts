import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { orders, stylistes } from '$lib/db/schema';
import { updateOrderStatusSchema, canTransitionTo } from '$lib/validations/orders';
import type { OrderStatus } from '$lib/validations/orders';
import { supabase } from '$lib/supabase';
import { eq, and, isNull } from 'drizzle-orm';

// PATCH /api/orders/[id]/status - Changer le statut d'une commande
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

  // Valider les données
  const body = await request.json();
  const validationResult = updateOrderStatusSchema.safeParse(body);

  if (!validationResult.success) {
    return error(400, {
      message: 'Données invalides',
      errors: validationResult.error.flatten().fieldErrors,
    });
  }

  const { status: newStatus } = validationResult.data;

  // Vérifier que la transition est autorisée
  const currentStatus = existingOrder.status as OrderStatus;
  if (!canTransitionTo(currentStatus, newStatus)) {
    return error(400, `Transition de statut invalide : ${currentStatus} → ${newStatus}`);
  }

  try {
    // Préparer les données de mise à jour
    const updateData: any = {
      status: newStatus,
      updatedAt: new Date(),
    };

    // Si le nouveau statut est "delivered", enregistrer la date de livraison
    if (newStatus === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    // Si on repasse en "pending" depuis "ready", effacer deliveredAt
    if (currentStatus === 'ready' && newStatus === 'pending') {
      updateData.deliveredAt = null;
    }

    // Mettre à jour la commande
    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, params.id))
      .returning();

    return json(updatedOrder);
  } catch (err: any) {
    console.error('Error updating order status:', err);
    return error(500, 'Erreur lors de la mise à jour du statut');
  }
};
