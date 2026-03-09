## Context

Sprints 1-4 ont posé les bases internes : auth, clients, mesures, commandes, paiements, planning, dashboard. Le code existant suit le pattern Next.js App Router avec API Routes Prisma + PostgreSQL (Neon), NextAuth sessions JWT, upload Cloudflare R2 ou stockage local, et shadcn/ui pour l'UI.

Sprint 5 introduit trois domaines : (1) portfolio public du styliste, (2) notifications email transactionnelles aux clients des stylistes, (3) annuaire public des stylistes. Ces trois domaines touchent à des surfaces publiques (pages sans authentification) et à des services externes (Resend pour les emails).

Contraintes clés :
- Mobile-first obligatoire (95% des utilisateurs sur smartphone)
- Portfolio réservé aux plans Pro/Premium (vérification plan existante via `checkClientLimit` pattern)
- Notifications email disponibles Standard+
- Les pages publiques (`/[stylistSlug]`, `/stylistes`) doivent être SEO-optimisées (métadonnées Next.js)
- Upload photos portfolio : même infra R2/local que les photos de commandes
- Pas de Fedapay dans ce sprint (les boutons "Commander" ouvrent juste un contact)

## Goals / Non-Goals

**Goals:**
- Page portfolio public accessible sans connexion avec galerie photos
- Dashboard de gestion du portfolio (upload, activation, tags)
- 3 templates email React Email (commande prête, rappel paiement, rappel retrait) envoyés via Resend
- Déclenchement manuel des notifications depuis la fiche commande
- Annuaire public `/stylistes` avec recherche par nom et ville
- Champ `slug` auto-généré sur `Stylist` pour les URLs publiques
- Tables Prisma `PortfolioItem` et `Notification`

**Non-Goals:**
- Notifications SMS ou WhatsApp (V1)
- Notifications automatiques déclenchées par changement de statut (trigger automatique = V1, sprint 5 = déclenchement manuel uniquement)
- Carte géographique interactive dans l'annuaire (V1 avec Mapbox)
- Compteur de vues portfolio (optionnel, peut être skippé MVP)
- "Commander ce modèle" avec formulaire (bouton contact uniquement)
- Paiement Fedapay

## Decisions

### 1. Route top-level `/[stylistSlug]` pour le portfolio public
**Décision** : Créer `src/app/[stylistSlug]/page.tsx` comme route dynamique top-level.

**Rationale** : URLs courtes et mémorables (`styliste.com/monique-couture`) vs `/stylistes/monique-couture`. Meilleur pour le SEO et le partage sur réseaux sociaux.

**Alternative considérée** : `/portfolio/[slug]` — écarté car moins élégant et moins "marque".

**Risque** : Collision avec les routes existantes (`/dashboard`, `/login`, `/register`, `/stylistes`). Géré via un middleware ou via Next.js route precedence (les routes statiques ont priorité sur les routes dynamiques dans App Router — pas de collision).

### 2. Slug généré automatiquement depuis businessName/name
**Décision** : Générer le `slug` au moment de la création du profil styliste (register), normalisé en kebab-case ASCII. Permettre la modification dans les paramètres.

**Rationale** : Le slug doit être stable (changement = liens cassés). Le générer à l'inscription garantit son existence.

**Migration** : Les stylistes existants (en dev/prod) n'ont pas de slug → migration SQL pour générer les slugs manquants depuis `businessName` ou `user.name`.

### 3. React Email + Resend pour les emails
**Décision** : `@react-email/components` pour les templates, `resend` SDK pour l'envoi.

**Rationale** : Resend est déjà dans l'architecture validée (DECISIONS.md). React Email permet de créer des templates HTML maintenables en JSX. Stack cohérente avec le reste du projet (TypeScript/React).

**Alternative considérée** : Nodemailer + templates HTML bruts — écarté, plus fragile et verbeux.

**Structure** : Templates dans `src/emails/` (OrderReadyEmail, PaymentReminderEmail, PickupReminderEmail). Envoi côté serveur uniquement (API route).

### 4. Notifications déclenchées manuellement uniquement
**Décision** : Bouton "Notifier le client" sur la fiche commande. Pas de déclenchement automatique sur changement de statut.

**Rationale** : MVP — le styliste contrôle quand notifier. Évite d'envoyer des emails non désirés. Les clients des stylistes n'ont pas nécessairement donné leur email.

**Contrainte** : Si `client.email` est absent, le bouton est désactivé avec un message explicatif.

### 5. Portfolio items stockés comme les photos de commandes
**Décision** : Même pattern upload (API route → R2/local), même table de structure. Nouveaux champs : `title`, `tags`, `clientConsent`, `isPublished`.

**Rationale** : Réutiliser l'infra existante. Pas besoin d'un second service de stockage.

### 6. Annuaire filtre uniquement les stylistes avec portfolio publié
**Décision** : L'annuaire `/stylistes` n'affiche que les stylistes ayant au moins 1 `PortfolioItem` publié ET un plan Pro/Premium.

**Rationale** : Qualité de l'annuaire — ne montrer que des stylistes avec une vitrine active.

## Risks / Trade-offs

- **Slug collision** → Vérification unique en DB au moment de la génération/modification. Si collision, ajouter un suffixe numérique (`-2`, `-3`).
- **Email client absent** → Vérification côté API avant envoi. Retour HTTP 422 clair. UI désactive le bouton si `client.email` est null.
- **Resend API key absente en dev** → Logger un warning, ne pas crasher. Mode "dry-run" en development (simuler l'envoi, logger le template).
- **Volume d'envoi Resend plan gratuit** → 3000 emails/mois gratuits. Suffisant pour le MVP pilote (10 stylistes).
- **Pages publiques indexées par Google** → Ajouter `robots.txt` et `sitemap.xml` dans le futur. Pour le MVP, les pages ont juste des `<meta>` de base.

## Migration Plan

1. **Schema Prisma** :
   - Ajouter champ `slug String? @unique` sur `Stylist`
   - Créer modèle `PortfolioItem`
   - Créer modèle `Notification`
   - Exécuter `npx prisma migrate dev --name sprint5-portfolio-notifications`

2. **Migration slugs existants** :
   - Script de seed/migration pour remplir `slug` sur les stylistes existants sans slug
   - Pattern : `businessName ?? user.name` → slug normalisé

3. **Variables d'environnement** :
   - Ajouter `RESEND_API_KEY` dans `.env.local` et Vercel

4. **Rollback** :
   - Les nouvelles tables et champs sont additifs, sans modification destructive des données existantes
   - Retirer les routes publiques suffit à désactiver les features sans perte de données

## Open Questions

- Le styliste peut-il modifier son slug après inscription ? → Oui, via Paramètres (page non encore implémentée — ajouter à la liste des settings futurs, non bloquant pour le sprint)
- Faut-il un consentement client explicite pour afficher ses créations ? → Checkbox `clientConsent` incluse dans le formulaire d'upload, mais non obligatoire pour le MVP
