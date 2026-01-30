import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db';
import { clients, stylistes } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { supabase } from '$lib/supabase';

export const load: PageServerLoad = async ({ params, cookies }) => {
  const accessToken = cookies.get('sb-access-token');
  if (!accessToken) {
    throw error(401, 'Non authentifié');
  }

  try {
    // Vérifier l'utilisateur
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      throw error(401, 'Session invalide');
    }

    // Récupérer le profil styliste
    const [styliste] = await db
      .select()
      .from(stylistes)
      .where(eq(stylistes.userId, user.id))
      .limit(1);

    if (!styliste) {
      throw error(403, 'Profil styliste non trouvé');
    }

    // Récupérer le client
    const [client] = await db
      .select({ id: clients.id, name: clients.name })
      .from(clients)
      .where(
        and(
          eq(clients.id, params.id),
          eq(clients.stylisteId, styliste.id)
        )
      )
      .limit(1);

    if (!client) {
      throw error(404, 'Client non trouvé');
    }

    return {
      client,
    };
  } catch (err: any) {
    console.error('Erreur lors du chargement du client:', err);
    throw error(500, 'Erreur lors du chargement');
  }
};
