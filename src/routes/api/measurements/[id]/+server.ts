import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { measurements, stylistes } from '$lib/db/schema';
import { updateMeasurementSchema } from '$lib/validations/measurements';
import { eq, and } from 'drizzle-orm';
import { supabase } from '$lib/supabase';

// PATCH /api/measurements/[id] - Modifier une mesure existante
export const PATCH: RequestHandler = async ({ request, params, cookies }) => {
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

    // Vérifier que la mesure existe et appartient au styliste (isolation RLS)
    const [existingMeasurement] = await db
      .select()
      .from(measurements)
      .where(
        and(
          eq(measurements.id, params.id),
          eq(measurements.stylisteId, styliste.id) // Isolation RLS
        )
      )
      .limit(1);

    if (!existingMeasurement) {
      return error(404, 'Mesure non trouvée');
    }

    // Parser et valider le corps de la requête
    const body = await request.json();
    const validatedData = updateMeasurementSchema.parse(body);

    // Préparer les données à mettre à jour
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (validatedData.value !== undefined) {
      updateData.value = validatedData.value.toString();
    }

    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes || null;
    }

    // Mettre à jour la mesure
    const [updatedMeasurement] = await db
      .update(measurements)
      .set(updateData)
      .where(eq(measurements.id, params.id))
      .returning();

    return json(updatedMeasurement);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return error(400, {
        message: 'Données invalides',
        errors: err.errors,
      });
    }

    console.error('Erreur lors de la modification de la mesure:', err);
    return error(500, 'Erreur lors de la modification de la mesure');
  }
};
