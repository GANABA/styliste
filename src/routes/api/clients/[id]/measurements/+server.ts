import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { measurements, stylistes } from '$lib/db/schema';
import { createMeasurementSchema, getMeasurementsSchema } from '$lib/validations/measurements';
import { eq, and, desc } from 'drizzle-orm';
import { supabase } from '$lib/supabase';

// POST /api/clients/[id]/measurements - Créer une nouvelle mesure pour un client
export const POST: RequestHandler = async ({ request, params, cookies }) => {
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

    // Parser et valider le corps de la requête
    const body = await request.json();
    const validatedData = createMeasurementSchema.parse({
      ...body,
      clientId: params.id, // Utiliser l'ID du client depuis l'URL
    });

    // Créer la mesure
    const [newMeasurement] = await db
      .insert(measurements)
      .values({
        clientId: validatedData.clientId,
        stylisteId: styliste.id,
        measurementType: validatedData.measurementType,
        value: validatedData.value.toString(),
        unit: validatedData.unit,
        notes: validatedData.notes || null,
        takenAt: validatedData.takenAt || new Date(),
      })
      .returning();

    return json(newMeasurement, { status: 201 });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return error(400, {
        message: 'Données invalides',
        errors: err.errors,
      });
    }

    console.error('Erreur lors de la création de la mesure:', err);
    return error(500, 'Erreur lors de la création de la mesure');
  }
};

// GET /api/clients/[id]/measurements - Récupérer les mesures d'un client
export const GET: RequestHandler = async ({ url, params, cookies }) => {
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

    // Parser les paramètres de requête
    const measurementType = url.searchParams.get('measurementType') || undefined;
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const validatedParams = getMeasurementsSchema.parse({
      clientId: params.id,
      measurementType,
      limit,
      offset,
    });

    // Construire la requête
    const conditions = [
      eq(measurements.clientId, validatedParams.clientId),
      eq(measurements.stylisteId, styliste.id), // Isolation RLS
    ];

    if (validatedParams.measurementType) {
      conditions.push(eq(measurements.measurementType, validatedParams.measurementType));
    }

    // Récupérer les mesures triées par date (plus récentes en premier)
    const clientMeasurements = await db
      .select()
      .from(measurements)
      .where(and(...conditions))
      .orderBy(desc(measurements.takenAt))
      .limit(validatedParams.limit || 50)
      .offset(validatedParams.offset || 0);

    return json({
      measurements: clientMeasurements,
      count: clientMeasurements.length,
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return error(400, {
        message: 'Paramètres invalides',
        errors: err.errors,
      });
    }

    console.error('Erreur lors de la récupération des mesures:', err);
    return error(500, 'Erreur lors de la récupération des mesures');
  }
};
