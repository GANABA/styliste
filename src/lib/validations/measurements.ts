import { z } from "zod";

export const templateFieldSchema = z.object({
  name: z.string().min(1, "Le nom du champ est obligatoire"),
  label: z.string().min(1, "Le label est obligatoire"),
  unit: z.string().min(1, "L'unité est obligatoire"),
  required: z.boolean(),
});

export const templateCreateSchema = z.object({
  name: z.string().min(2, "Le nom du template doit contenir au moins 2 caractères"),
  fields: z.array(templateFieldSchema).min(1, "Au moins un champ de mesure est requis"),
});

export const measurementCreateSchema = z.object({
  clientId: z.string().uuid("Client ID invalide"),
  templateId: z.string().uuid("Template ID invalide"),
  measurements: z.record(z.string(), z.number().positive("Les mesures doivent être positives")),
});

export type TemplateField = z.infer<typeof templateFieldSchema>;
export type TemplateCreateData = z.infer<typeof templateCreateSchema>;
export type MeasurementCreateData = z.infer<typeof measurementCreateSchema>;
