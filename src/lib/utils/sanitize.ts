/**
 * Utilitaires de sanitisation pour prévenir les attaques XSS
 */
import { escape } from 'html-escaper';

/**
 * Échappe les caractères HTML dangereux dans une chaîne
 * Prévient les attaques XSS en convertissant < > & " ' en entités HTML
 *
 * @param text - Texte à échapper
 * @returns Texte sécurisé
 *
 * @example
 * ```ts
 * escapeHtml('<script>alert("xss")</script>')
 * // Retourne: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 * ```
 */
export function escapeHtml(text: string | null | undefined): string {
	if (!text) return '';
	return escape(text);
}

/**
 * Échappe une liste de chaînes
 *
 * @param items - Liste de textes à échapper
 * @returns Liste de textes sécurisés
 */
export function escapeHtmlArray(items: (string | null | undefined)[]): string[] {
	return items.map(escapeHtml);
}

/**
 * Nettoie un texte en supprimant les balises HTML et en échappant le reste
 * Utile pour afficher du contenu utilisateur dans un contexte HTML sécurisé
 *
 * @param text - Texte à nettoyer
 * @returns Texte nettoyé et sécurisé
 *
 * @example
 * ```ts
 * sanitizeText('Hello <b>World</b> & <script>alert("xss")</script>')
 * // Retourne: 'Hello World &amp; alert(&quot;xss&quot;)'
 * ```
 */
export function sanitizeText(text: string | null | undefined): string {
	if (!text) return '';

	// Supprimer toutes les balises HTML
	const withoutTags = text.replace(/<[^>]*>/g, '');

	// Échapper les caractères spéciaux restants
	return escape(withoutTags);
}

/**
 * Note: Svelte échappe automatiquement le contenu affiché via {variable}
 * Utilisez ces fonctions uniquement si vous avez besoin de :
 * 1. Traiter du contenu avant de l'envoyer à l'API
 * 2. Manipuler du HTML via {@html ...} avec du contenu utilisateur
 * 3. Générer du HTML dynamique côté serveur
 */
