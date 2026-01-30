import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { measurements, stylistes } from '$lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// GET /api/clients/[id]/measurements/latest - Récupérer les dernières mesures d'un client (une par type)
export const GET: RequestHandler = async ({ params, locals }) => {
  const session = await locals.safeGetSession();
  if (!session) {
    return error(401, 'Non authentifié');
  }

  try {
    // Récupérer le profil styliste de l'utilisateur connecté
    const [styliste] = await db
      .select()
      .from(stylistes)
      .where(eq(stylistes.userId, session.user.id))
      .limit(1);

    if (!styliste) {
      return error(403, 'Profil styliste non trouvé');
    }

    // Récupérer les dernières mesures de chaque type pour ce client
    // On utilise DISTINCT ON pour obtenir la mesure la plus récente par type
    const latestMeasurements = await db.execute(sql`
      SELECT DISTINCT ON (measurement_type)
        id,
        client_id,
        styliste_id,
        measurement_type,
        value,
        unit,
        notes,
        taken_at,
        created_at,
        updated_at
      FROM measurements
      WHERE client_id = ${params.id}
        AND styliste_id = ${styliste.id}
      ORDER BY measurement_type, taken_at DESC
    `);

    return json({
      measurements: latestMeasurements.rows,
      count: latestMeasurements.rows.length,
    });
  } catch (err: any) {
    console.error('Erreur lors de la récupération des dernières mesures:', err);
    return error(500, 'Erreur lors de la récupération des dernières mesures');
  }
};
