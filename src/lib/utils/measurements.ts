import type { MeasurementUnit } from '$lib/validations/measurements';

// Type pour une mesure individuelle
export interface Measurement {
  id: string;
  measurementType: string;
  value: string; // numeric en string depuis Drizzle
  unit: string;
  notes: string | null;
  takenAt: Date;
}

// Type pour le snapshot de mesures (stocké en JSONB dans orders)
export interface MeasurementSnapshot {
  timestamp: string; // ISO date de capture du snapshot
  measurements: {
    type: string;
    value: number;
    unit: MeasurementUnit;
    notes?: string;
  }[];
}

/**
 * Crée un snapshot des mesures d'un client pour stockage dans une commande
 * @param measurements - Liste des mesures du client
 * @returns Snapshot JSONB-compatible avec timestamp
 */
export function createMeasurementSnapshot(
  measurements: Measurement[]
): MeasurementSnapshot | null {
  if (measurements.length === 0) {
    return null;
  }

  // Grouper par type et prendre la plus récente de chaque type
  const latestByType = new Map<string, Measurement>();

  for (const measurement of measurements) {
    const existing = latestByType.get(measurement.measurementType);
    if (!existing || new Date(measurement.takenAt) > new Date(existing.takenAt)) {
      latestByType.set(measurement.measurementType, measurement);
    }
  }

  return {
    timestamp: new Date().toISOString(),
    measurements: Array.from(latestByType.values()).map(m => ({
      type: m.measurementType,
      value: parseFloat(m.value),
      unit: m.unit as MeasurementUnit,
      ...(m.notes && { notes: m.notes }),
    })),
  };
}

/**
 * Compare deux snapshots de mesures pour détecter les changements
 * @param oldSnapshot - Ancien snapshot
 * @param newSnapshot - Nouveau snapshot
 * @returns Liste des changements détectés
 */
export function compareMeasurementSnapshots(
  oldSnapshot: MeasurementSnapshot | null,
  newSnapshot: MeasurementSnapshot | null
): { type: string; oldValue: number; newValue: number; unit: string }[] {
  if (!oldSnapshot || !newSnapshot) {
    return [];
  }

  const changes: { type: string; oldValue: number; newValue: number; unit: string }[] = [];
  const oldMap = new Map(oldSnapshot.measurements.map(m => [m.type, m]));

  for (const newM of newSnapshot.measurements) {
    const oldM = oldMap.get(newM.type);
    if (oldM && oldM.value !== newM.value) {
      changes.push({
        type: newM.type,
        oldValue: oldM.value,
        newValue: newM.value,
        unit: newM.unit,
      });
    }
  }

  return changes;
}

/**
 * Extrait les mesures d'un snapshot pour affichage
 * @param snapshot - Snapshot de mesures
 * @returns Liste de mesures formatées pour l'affichage
 */
export function extractMeasurementsFromSnapshot(
  snapshot: MeasurementSnapshot | null
): { type: string; value: number; unit: string; notes?: string }[] {
  if (!snapshot) {
    return [];
  }
  return snapshot.measurements;
}
