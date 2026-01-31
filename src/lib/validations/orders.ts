import { z } from 'zod';

// Types de statuts de commande
export const ORDER_STATUSES = ['pending', 'ready', 'delivered'] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

// Types de vêtements pré-définis
export const GARMENT_TYPES = [
  'Robe',
  'Costume',
  'Boubou',
  'Chemise',
  'Pantalon',
  'Jupe',
  'Veste',
  'Caftan',
  'Autre',
] as const;
export type GarmentType = typeof GARMENT_TYPES[number];

// Labels des statuts en français
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En cours',
  ready: 'Prêt',
  delivered: 'Livré',
};

// Schema de validation pour la création d'une commande
export const createOrderSchema = z.object({
  clientId: z.string().uuid('ID client invalide'),
  garmentType: z.string().min(1, 'Le type de vêtement est obligatoire').max(100),
  description: z.string().max(1000, 'La description ne peut pas dépasser 1000 caractères').optional(),
  price: z
    .number({ invalid_type_error: 'Le prix doit être un nombre' })
    .positive('Le prix doit être positif')
    .max(10000000, 'Le prix ne peut pas dépasser 10 000 000 XOF')
    .optional(),
  currency: z.enum(['XOF']).default('XOF'),
  dueDate: z.coerce.date().optional(),
  notes: z.string().max(1000, 'Les notes ne peuvent pas dépasser 1000 caractères').optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// Schema de validation pour la mise à jour d'une commande
export const updateOrderSchema = z.object({
  garmentType: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  price: z.number().positive().max(10000000).optional(),
  dueDate: z.coerce.date().nullable().optional(),
  notes: z.string().max(1000).optional(),
});

export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

// Schema de validation pour le changement de statut
export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES, {
    errorMap: () => ({ message: 'Statut invalide' }),
  }),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

// Validation des transitions de statut
export function canTransitionTo(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  // delivered est un état final
  if (currentStatus === 'delivered') {
    return false;
  }

  // Transitions autorisées
  const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['ready'],
    ready: ['delivered', 'pending'], // permet les retouches
    delivered: [],
  };

  return allowedTransitions[currentStatus]?.includes(newStatus) ?? false;
}

// Type pour le snapshot des mesures dans JSONB
export type MeasurementsSnapshot = Record<string, { value: number; unit: string }> & {
  taken_at?: string;
};
