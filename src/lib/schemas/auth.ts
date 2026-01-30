import { z } from 'zod';

// Schema pour l'inscription avec téléphone (Phone OTP)
export const signupPhoneSchema = z.object({
  phone: z.string().regex(/^\+?[0-9]{8,15}$/, 'Numéro de téléphone invalide'),
});

// Schema pour la vérification du code OTP
export const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\+?[0-9]{8,15}$/, 'Numéro de téléphone invalide'),
  token: z.string().length(6, 'Le code doit contenir 6 chiffres'),
});

// Schema pour l'inscription avec email
export const signupEmailSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

// Schema pour la connexion avec email
export const signinEmailSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

// Schema pour la connexion avec téléphone
export const signinPhoneSchema = z.object({
  phone: z.string().regex(/^\+?[0-9]{8,15}$/, 'Numéro de téléphone invalide'),
});

// Types TypeScript exportés
export type SignupPhone = z.infer<typeof signupPhoneSchema>;
export type VerifyOtp = z.infer<typeof verifyOtpSchema>;
export type SignupEmail = z.infer<typeof signupEmailSchema>;
export type SigninEmail = z.infer<typeof signinEmailSchema>;
export type SigninPhone = z.infer<typeof signinPhoneSchema>;
