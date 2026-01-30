import { z } from 'zod';

// Types de mesures standards pour stylistes africains
// Couvre les mesures courantes pour vêtements sur mesure
export const STANDARD_MEASUREMENT_TYPES = [
  // Mesures du haut du corps
  'tour_poitrine',      // Tour de poitrine
  'tour_taille',        // Tour de taille
  'tour_hanches',       // Tour de hanches
  'largeur_epaules',    // Largeur des épaules
  'tour_bras',          // Tour de bras
  'longueur_bras',      // Longueur du bras
  'tour_cou',           // Tour de cou

  // Mesures du bas du corps
  'tour_cuisse',        // Tour de cuisse
  'longueur_jambe',     // Longueur de jambe
  'entrejambe',         // Entrejambe

  // Longueurs
  'longueur_dos',       // Longueur du dos
  'longueur_robe',      // Longueur de robe
  'longueur_pantalon',  // Longueur de pantalon
  'longueur_jupe',      // Longueur de jupe

  // Autres mesures spécifiques
  'hauteur_poitrine',   // Hauteur de poitrine
  'carrure_dos',        // Carrure du dos
  'tour_poignet',       // Tour de poignet
] as const;

export type MeasurementType = typeof STANDARD_MEASUREMENT_TYPES[number] | string;

// Unités de mesure supportées
export const MEASUREMENT_UNITS = ['cm', 'in'] as const;
export type MeasurementUnit = typeof MEASUREMENT_UNITS[number];

// Schema Zod pour la création d'une mesure
export const createMeasurementSchema = z.object({
  clientId: z.string().uuid({ message: 'ID client invalide' }),
  measurementType: z.string()
    .min(1, { message: 'Le type de mesure est obligatoire' })
    .max(100, { message: 'Le type de mesure est trop long' }),
  value: z.number()
    .positive({ message: 'La valeur doit être positive' })
    .max(500, { message: 'La valeur semble anormalement élevée' })
    .multipleOf(0.01, { message: 'Maximum 2 décimales' }),
  unit: z.enum(MEASUREMENT_UNITS, {
    errorMap: () => ({ message: 'Unité invalide. Utilisez cm ou in.' })
  }).default('cm'),
  notes: z.string()
    .max(500, { message: 'Les notes sont trop longues (max 500 caractères)' })
    .optional(),
  takenAt: z.coerce.date().optional(), // Optionnel, par défaut = maintenant
});

// Schema Zod pour la modification d'une mesure
export const updateMeasurementSchema = z.object({
  value: z.number()
    .positive({ message: 'La valeur doit être positive' })
    .max(500, { message: 'La valeur semble anormalement élevée' })
    .multipleOf(0.01, { message: 'Maximum 2 décimales' })
    .optional(),
  notes: z.string()
    .max(500, { message: 'Les notes sont trop longues (max 500 caractères)' })
    .optional(),
}).refine(data => data.value !== undefined || data.notes !== undefined, {
  message: 'Au moins un champ doit être modifié',
});

// Schema Zod pour récupérer les mesures d'un client
export const getMeasurementsSchema = z.object({
  clientId: z.string().uuid({ message: 'ID client invalide' }),
  measurementType: z.string().optional(), // Filtrer par type spécifique
  limit: z.number().int().positive().max(100).default(50).optional(),
  offset: z.number().int().nonnegative().default(0).optional(),
});

// Types TypeScript exportés
export type CreateMeasurementInput = z.infer<typeof createMeasurementSchema>;
export type UpdateMeasurementInput = z.infer<typeof updateMeasurementSchema>;
export type GetMeasurementsInput = z.infer<typeof getMeasurementsSchema>;

// Helper : Formater le nom d'affichage d'un type de mesure
export function formatMeasurementType(type: string): string {
  const typeMap: Record<string, string> = {
    tour_poitrine: 'Tour de poitrine',
    tour_taille: 'Tour de taille',
    tour_hanches: 'Tour de hanches',
    largeur_epaules: 'Largeur des épaules',
    tour_bras: 'Tour de bras',
    longueur_bras: 'Longueur du bras',
    tour_cou: 'Tour de cou',
    tour_cuisse: 'Tour de cuisse',
    longueur_jambe: 'Longueur de jambe',
    entrejambe: 'Entrejambe',
    longueur_dos: 'Longueur du dos',
    longueur_robe: 'Longueur de robe',
    longueur_pantalon: 'Longueur de pantalon',
    longueur_jupe: 'Longueur de jupe',
    hauteur_poitrine: 'Hauteur de poitrine',
    carrure_dos: 'Carrure du dos',
    tour_poignet: 'Tour de poignet',
  };

  return typeMap[type] || type;
}

// Helper : Formater une valeur avec son unité
export function formatMeasurementValue(value: number, unit: MeasurementUnit): string {
  return `${value.toFixed(1)} ${unit}`;
}
