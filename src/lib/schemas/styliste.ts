import { z } from 'zod';

// Schema pour le profil du styliste
export const stylisteProfileSchema = z.object({
  salon_name: z.string().min(2, 'Le nom du salon doit contenir au moins 2 caractères').max(100, 'Le nom du salon ne peut pas dépasser 100 caractères'),
  description: z.string().max(500, 'La description ne peut pas dépasser 500 caractères').optional(),
  phone: z.string().regex(/^\+?[0-9]{8,15}$/, 'Numéro de téléphone invalide'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  address: z.string().max(200, 'L\'adresse ne peut pas dépasser 200 caractères').optional(),
  city: z.string().max(100, 'La ville ne peut pas dépasser 100 caractères').optional(),
  country: z.string().length(2, 'Le code pays doit contenir 2 caractères').default('BJ'),
});

// Type TypeScript exporté
export type StylisteProfile = z.infer<typeof stylisteProfileSchema>;
