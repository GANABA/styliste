// Rate limiting simple en mémoire (pour MVP)
// TODO: Migrer vers Redis/Cloudflare KV en production

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Nettoyer les entrées expirées toutes les 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Vérifier et incrémenter le compteur de rate limiting
 * @param identifier - Identifiant unique (ex: numéro de téléphone)
 * @param maxRequests - Nombre maximum de requêtes autorisées
 * @param windowMs - Fenêtre de temps en millisecondes
 * @returns true si la limite est atteinte, false sinon
 */
export function isRateLimited(
  identifier: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Pas d'entrée ou entrée expirée
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return false;
  }

  // Limite atteinte
  if (entry.count >= maxRequests) {
    return true;
  }

  // Incrémenter le compteur
  entry.count++;
  return false;
}

/**
 * Vérifier si une requête est autorisée (inverse de isRateLimited)
 * @param identifier - Identifiant unique (ex: numéro de téléphone)
 * @param maxRequests - Nombre maximum de requêtes autorisées
 * @param windowSeconds - Fenêtre de temps en secondes
 * @returns true si autorisé, false si rate limited
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  return !isRateLimited(identifier, maxRequests, windowSeconds * 1000);
}

/**
 * Obtenir le temps restant avant reset (en secondes)
 */
export function getResetTime(identifier: string): number {
  const entry = rateLimitStore.get(identifier);
  if (!entry) return 0;

  const now = Date.now();
  const remaining = Math.ceil((entry.resetAt - now) / 1000);
  return remaining > 0 ? remaining : 0;
}
