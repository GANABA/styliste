import { z } from "zod";

export const clientCreateSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z.string().min(8, "Le téléphone doit contenir au moins 8 caractères"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
});

export const clientUpdateSchema = clientCreateSchema;

export type ClientCreateData = z.infer<typeof clientCreateSchema>;
export type ClientUpdateData = z.infer<typeof clientUpdateSchema>;
