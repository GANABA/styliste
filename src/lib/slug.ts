import { PrismaClient } from '@prisma/client'

/**
 * Génère un slug kebab-case ASCII à partir d'un nom
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/[^a-z0-9\s-]/g, '')   // Garder lettres, chiffres, espaces, tirets
    .trim()
    .replace(/\s+/g, '-')           // Espaces → tirets
    .replace(/-+/g, '-')            // Tirets multiples → un seul
    .slice(0, 60)                   // Longueur max
}

/**
 * Garantit l'unicité du slug en ajoutant un suffixe numérique si nécessaire
 */
export async function ensureUniqueSlug(
  baseSlug: string,
  prisma: PrismaClient
): Promise<string> {
  let slug = baseSlug
  let attempt = 1

  while (true) {
    const existing = await prisma.stylist.findUnique({ where: { slug } })
    if (!existing) break
    attempt++
    slug = `${baseSlug}-${attempt}`
  }

  return slug
}
