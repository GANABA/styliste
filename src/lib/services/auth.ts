import { supabase } from '$lib/supabase';
import type { AuthError, User } from '@supabase/supabase-js';

// Wrapper pour Supabase Auth
export const authService = {
  // Inscription avec téléphone (Phone OTP)
  async signupWithPhone(phone: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        channel: 'sms',
      },
    });
    return { error };
  },

  // Vérification du code OTP
  async verifyOtp(phone: string, token: string): Promise<{ user: User | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    return { user: data.user, error };
  },

  // Inscription avec email
  async signupWithEmail(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { user: data.user, error };
  },

  // Connexion avec email
  async signinWithEmail(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { user: data.user, error };
  },

  // Connexion avec téléphone (Phone OTP)
  async signinWithPhone(phone: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        channel: 'sms',
      },
    });
    return { error };
  },

  // Déconnexion
  async signout(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Récupérer l'utilisateur actuel
  async getUser(): Promise<{ user: User | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.getUser();
    return { user: data.user, error };
  },

  // Récupérer la session actuelle
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
};
