// Format de réponse API standardisé
export type ApiResponse<T = unknown> =
  | { data: T; error: null }
  | { data: null; error: { message: string; details?: any } };

// Créer une réponse API standardisée
export function apiResponse<T>(
  data: T | null,
  error: { message: string; details?: any } | null
): ApiResponse<T> {
  if (error) {
    return { data: null, error };
  }
  return { data: data as T, error: null };
}
