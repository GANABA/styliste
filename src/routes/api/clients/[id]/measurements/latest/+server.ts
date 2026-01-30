import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { measurements, stylistes } from '$lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { supabase } from '$lib/supabase';

// GET /api/clients/[id]/measurements/latest - Récupérer les dernières mesures d'un client (une par type)
export const GET: RequestHandler = async ({ params, cookies }) => {
  const accessToken = cookies.get('sb-access-token');
  if (!accessToken) {
    return error(401, 'Non authentifié');
  }

  try {
    // Vérifier l'utilisateur
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return error(401, 'Session invalide');
    }

    // Récupérer le profil styliste de l'utilisateur connecté
    const [styliste] = await db
      .select()
      .from(stylistes)
      .where(eq(stylistes.userId, user.id))
      .limit(1);

    if (!styliste) {
      return error(403, 'Profil styliste non trouvé');
    }

    // Récupérer toutes les mesures du client puis filtrer côté application
    // pour obtenir la dernière de chaque type
    const allMeasurements = await db
      .select()
      .from(measurements)
      .where(
        and(
          eq(measurements.clientId, params.id),
          eq(measurements.stylisteId, styliste.id)
        )
      )
      .orderBy(desc(measurements.takenAt));

    // Grouper par type et ne garder que la plus récente de chaque
    const latestByType = new Map();
    for (const measurement of allMeasurements) {
      if (!latestByType.has(measurement.measurementType)) {
        latestByType.set(measurement.measurementType, measurement);
      }
    }

    const latestMeasurements = Array.from(latestByType.values());

    return json({
      measurements: latestMeasurements,
      count: latestMeasurements.length,
    });
  } catch (err: any) {
    console.error('Erreur lors de la récupération des dernières mesures:', err);
    return error(500, 'Erreur lors de la récupération des dernières mesures');
  }
};
