# Test de prévention XSS

## Objectif
Vérifier que l'application est protégée contre les attaques XSS (Cross-Site Scripting).

## Protection XSS dans Styliste.com

### 1. Svelte Auto-Escaping
Svelte échappe **automatiquement** tout contenu affiché via `{variable}`. Les seules exceptions sont les blocs `{@html ...}`.

**Exemple:**
```svelte
<!-- ✅ SÉCURISÉ (auto-escaped) -->
<p>{userInput}</p>

<!-- ⚠️ DANGEREUX (non escaped) -->
<p>{@html userInput}</p>
```

### 2. Utilisation de `@html` dans le code
Vérification effectuée : toutes les utilisations de `@html` dans le projet utilisent du contenu hardcodé (icônes SVG), **jamais** d'input utilisateur.

**Fichiers vérifiés:**
- `src/routes/(app)/+layout.svelte` : Icônes de navigation (hardcodées)
- `src/lib/components/ui/Toast.svelte` : Icônes de notification (hardcodées)

### 3. Utilitaire de sanitisation
Pour les cas edge où nous devons traiter du HTML utilisateur, un utilitaire a été créé:

```typescript
import { escapeHtml, sanitizeText } from '$lib/utils/sanitize';

// Échapper le HTML
const safe = escapeHtml('<script>alert("xss")</script>');
// Retourne: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'

// Nettoyer complètement (supprimer tags + échapper)
const clean = sanitizeText('Hello <b>World</b> <script>alert("xss")</script>');
// Retourne: 'Hello World alert(&quot;xss&quot;)'
```

## Scénarios de test

### Test 1: Injection XSS dans nom de client

**Étape:**
1. Se connecter en tant que styliste
2. Créer un nouveau client avec:
   - Nom: `<script>alert("XSS")</script>`
   - Téléphone: `+22990000001`
3. Sauvegarder et afficher la liste des clients

**✅ Résultat attendu:**
- Le nom s'affiche littéralement comme: `<script>alert("XSS")</script>`
- **Aucune** popup JavaScript ne s'exécute
- Le code source HTML montre les caractères échappés: `&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;`

### Test 2: Injection XSS dans notes client

**Étape:**
1. Créer/modifier un client avec notes:
   ```
   <img src=x onerror="alert('XSS')">
   <iframe src="javascript:alert('XSS')"></iframe>
   ```
2. Sauvegarder et afficher les détails du client

**✅ Résultat attendu:**
- Les notes s'affichent comme texte brut
- Aucune image ou iframe ne s'affiche
- Aucun JavaScript ne s'exécute

### Test 3: Injection XSS dans profil styliste

**Étape:**
1. Modifier le profil avec:
   - Nom du salon: `Salon <b>Test</b>`
   - Description: `<script>document.location='http://evil.com'</script>`
2. Sauvegarder et recharger la page

**✅ Résultat attendu:**
- Le nom et la description s'affichent comme texte brut
- Aucune redirection ne se produit
- Le texte HTML est visible mais non interprété

### Test 4: XSS via paramètres d'URL

**Étape:**
1. Essayer d'accéder à:
   ```
   http://localhost:5173/clients?search=<script>alert('XSS')</script>
   ```

**✅ Résultat attendu:**
- La recherche fonctionne normalement (aucun résultat)
- Aucun JavaScript ne s'exécute
- Le paramètre est traité comme texte

### Test 5: XSS stocké (Stored XSS)

**Étape:**
1. Créer un client avec un payload XSS dans plusieurs champs:
   - Nom: `<svg/onload=alert('XSS')>`
   - Email: `test+<script>alert(1)</script>@test.com`
   - Notes: `'; DROP TABLE clients; --`
2. Se déconnecter et se reconnecter
3. Afficher la liste des clients

**✅ Résultat attendu:**
- Tous les champs sont échappés correctement
- Aucun JavaScript ne s'exécute après reconnexion
- Les données sont correctement stockées et affichées

## Protection au niveau backend

### Content Security Policy (CSP)
Configurée dans `src/hooks.server.ts`:

```typescript
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'", // Pour SvelteKit hydration
  "style-src 'self' 'unsafe-inline'",  // Pour Tailwind
  "img-src 'self' data: https:",
  "connect-src 'self' https://*.supabase.co",
  "frame-ancestors 'none'",
  "form-action 'self'"
].join('; ');
```

### Headers de sécurité additionnels
- `X-Frame-Options: DENY` (prévient le clickjacking)
- `X-Content-Type-Options: nosniff` (prévient MIME sniffing)
- `Referrer-Policy: strict-origin-when-cross-origin`

## Vérification avec DevTools

**Étape:**
1. Ouvrir DevTools (F12)
2. Onglet Console
3. Essayer d'injecter du JavaScript:
   ```javascript
   document.body.innerHTML = '<script>alert("XSS")</script>';
   ```

**✅ Résultat attendu:**
- Le script est inséré mais **ne s'exécute pas** (CSP bloque)
- Une erreur CSP apparaît dans la console

## Critères de succès

- ✅ Aucun payload XSS ne peut s'exécuter dans l'application
- ✅ Tous les champs texte affichent le contenu échappé
- ✅ Les headers CSP bloquent les scripts inline non autorisés
- ✅ Aucune utilisation de `{@html ...}` avec du contenu utilisateur
- ✅ Le code source HTML montre les entités HTML échappées (`&lt;`, `&gt;`, etc.)

## Références
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Svelte Security Guidelines](https://svelte.dev/docs/security)
- [Content Security Policy Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
