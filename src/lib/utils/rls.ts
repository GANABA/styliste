import { db } from '$lib/db';
import { stylistes } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

// Récupérer le styliste_id depuis auth.uid()
export async function getStylisteIdFromUserId(userId: string): Promise<string | null> {
  try {
    const result = await db
      .select({ id: stylistes.id })
      .from(stylistes)
      .where(eq(stylistes.userId, userId))
      .limit(1);

    return result[0]?.id || null;
  } catch (error) {
    console.error('Error getting styliste_id:', error);
    return null;
  }
}

// Vérifier si un styliste existe pour un user_id
export async function stylisteExistsForUser(userId: string): Promise<boolean> {
  const stylisteId = await getStylisteIdFromUserId(userId);
  return stylisteId !== null;
}
