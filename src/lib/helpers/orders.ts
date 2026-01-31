import { desc, and, like, eq, isNull } from 'drizzle-orm';
import { format } from 'date-fns';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { orders } from '$lib/db/schema';
import type { OrderStatus } from '$lib/validations/orders';

/**
 * Génère un numéro de commande unique au format STY-{YYYY}{MM}-{NNNN}
 * Exemple: STY-202601-0042
 *
 * @param stylisteId - ID du styliste
 * @param db - Instance Drizzle database
 * @returns Numéro de commande unique
 */
export async function generateOrderNumber(
  stylisteId: string,
  db: PostgresJsDatabase<Record<string, never>>
): Promise<string> {
  const now = new Date();
  const yearMonth = format(now, 'yyyyMM'); // "202601"
  const prefix = `STY-${yearMonth}-`;

  // Récupérer le dernier numéro du mois pour ce styliste
  const [lastOrder] = await db
    .select({ orderNumber: orders.orderNumber })
    .from(orders)
    .where(and(eq(orders.stylisteId, stylisteId), like(orders.orderNumber, `${prefix}%`)))
    .orderBy(desc(orders.orderNumber))
    .limit(1);

  let nextNumber = 1;
  if (lastOrder) {
    const lastNumberStr = lastOrder.orderNumber.split('-')[2];
    const lastNumber = parseInt(lastNumberStr, 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * Récupère les dernières mesures d'un client et les formate en snapshot JSONB
 *
 * @param clientId - ID du client
 * @param db - Instance Drizzle database
 * @returns Snapshot des mesures au format JSONB
 */
export async function getMeasurementsSnapshot(
  clientId: string,
  db: PostgresJsDatabase<Record<string, never>>
): Promise<Record<string, { value: number; unit: string }> | null> {
  const { measurements } = await import('$lib/db/schema');

  // Récupérer toutes les mesures du client triées par date
  const allMeasurements = await db
    .select()
    .from(measurements)
    .where(eq(measurements.clientId, clientId))
    .orderBy(desc(measurements.takenAt));

  if (allMeasurements.length === 0) {
    return null;
  }

  // Garder uniquement la mesure la plus récente pour chaque type
  const latestByType = new Map<string, (typeof allMeasurements)[0]>();
  for (const measurement of allMeasurements) {
    if (!latestByType.has(measurement.measurementType)) {
      latestByType.set(measurement.measurementType, measurement);
    }
  }

  // Convertir en format snapshot JSONB
  const snapshot: Record<string, { value: number; unit: string }> = {};
  for (const [type, measurement] of latestByType.entries()) {
    snapshot[type] = {
      value: parseFloat(measurement.value),
      unit: measurement.unit,
    };
  }

  // Ajouter le timestamp de la prise de mesure la plus récente
  const mostRecentMeasurement = allMeasurements[0];
  if (mostRecentMeasurement) {
    snapshot.taken_at = {
      value: new Date(mostRecentMeasurement.takenAt).toISOString(),
      unit: '',
    } as any;
  }

  return snapshot;
}

/**
 * Vérifie si une date est dans la semaine en cours
 */
export function isThisWeek(date: Date): boolean {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay()); // Début de semaine (dimanche)
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  return date >= weekStart && date < weekEnd;
}

/**
 * Vérifie si une date est dans le mois en cours
 */
export function isThisMonth(date: Date): boolean {
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

/**
 * Formate un prix en devise XOF
 */
export function formatCurrency(amount: number | string, currency: string = 'XOF'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (currency === 'XOF') {
    return `${numAmount.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA`;
  }

  return `${numAmount.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} ${currency}`;
}
