import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { orders, stylistes, clients } from '$lib/db/schema';
import { supabase } from '$lib/supabase';
import { eq, and, isNull, gte, lte, sql } from 'drizzle-orm';
import { startOfMonth, addDays } from 'date-fns';

// GET /api/orders/stats - Récupérer les statistiques des commandes
export const GET: RequestHandler = async ({ cookies }) => {
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
    const now = new Date();
    const monthStart = startOfMonth(now);
    const weekEnd = addDays(now, 7);

    // Formatter les dates pour la colonne due_date (type date, pas timestamp)
    const today = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const weekEndStr = weekEnd.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Compteurs par statut
    const statusCounts = await db
      .select({
        status: orders.status,
        count: sql<number>`count(*)::int`,
      })
      .from(orders)
      .where(and(eq(orders.stylisteId, styliste.id), isNull(orders.deletedAt)))
      .groupBy(orders.status);

    // Convertir en objet pour faciliter l'accès
    const counts = {
      pending: 0,
      ready: 0,
      delivered: 0,
    };

    for (const row of statusCounts) {
      if (row.status === 'pending' || row.status === 'ready' || row.status === 'delivered') {
        counts[row.status] = row.count;
      }
    }

    // Commandes livrées ce mois
    const [deliveredThisMonth] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.stylisteId, styliste.id),
          eq(orders.status, 'delivered'),
          gte(orders.deliveredAt, monthStart),
          isNull(orders.deletedAt)
        )
      );

    counts.delivered = deliveredThisMonth?.count || 0;

    // Chiffre d'affaires du mois (commandes livrées)
    const [revenueResult] = await db
      .select({
        revenue: sql<string>`COALESCE(SUM(CAST(price AS NUMERIC)), 0)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.stylisteId, styliste.id),
          eq(orders.status, 'delivered'),
          gte(orders.deliveredAt, monthStart),
          isNull(orders.deletedAt)
        )
      );

    const monthlyRevenue = parseFloat(revenueResult?.revenue || '0');

    // Commandes à livrer cette semaine (due_date dans les 7 prochains jours)
    const dueThisWeek = await db
      .select({
        order: orders,
        client: clients,
      })
      .from(orders)
      .leftJoin(clients, eq(orders.clientId, clients.id))
      .where(
        and(
          eq(orders.stylisteId, styliste.id),
          isNull(orders.deletedAt),
          gte(orders.dueDate, today),
          lte(orders.dueDate, weekEndStr)
        )
      )
      .orderBy(orders.dueDate)
      .limit(50);

    return json({
      pending: counts.pending,
      ready: counts.ready,
      delivered: counts.delivered,
      monthlyRevenue,
      dueThisWeek,
    });
  } catch (err: any) {
    console.error('Error fetching order stats:', err);
    return error(500, 'Erreur lors de la récupération des statistiques');
  }
};
