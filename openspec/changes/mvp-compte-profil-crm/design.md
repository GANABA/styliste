## Context

Ce change implémente les fondations du MVP Styliste.com : système de compte styliste, profil professionnel et CRM local pour gérer les clients privés.

**État actuel** : Projet vierge, première fonctionnalité à implémenter.

**Contraintes** :
- Mobile-first, optimisé pour connexions instables (Afrique de l'Ouest)
- Architecture multi-tenant stricte (isolation des données par styliste)
- Performance : Bundle < 100KB, TTI < 3s sur 3G
- Stack : SvelteKit + Supabase Auth + PostgreSQL + Drizzle ORM

**Stakeholders** : Stylistes africains (Bénin en priorité), cible B2B.

## Goals / Non-Goals

**Goals:**
- Permettre à un styliste de créer son compte et s'authentifier de manière sécurisée
- Permettre au styliste de gérer son profil professionnel (nom salon, description, contacts, localisation)
- Fournir un CRM local simple pour gérer les fiches clients privées
- Assurer l'isolation multi-tenant stricte (RLS PostgreSQL)
- Respecter les contraintes de performance mobile-first

**Non-Goals:**
- Comptes clients (hors scope MVP - les clients n'ont pas de compte)
- Fonctionnalités collaboratives multi-employés (V1)
- Gestion des mesures, commandes, planning (autres changes MVP)
- Notifications clients (autre change MVP)
- Portfolio public (autre change MVP)

## Decisions

### 1. Authentification : Supabase Auth avec Phone OTP prioritaire

**Décision** : Utiliser Supabase Auth avec support Phone OTP (SMS), Email, et OAuth Google.

**Rationale** :
- Phone OTP prioritaire pour le contexte africain (usage massif mobile, emails peu fiables)
- Supabase Auth intégré avec PostgreSQL RLS (security par défaut)
- Support multi-canaux (flexibilité pour les stylistes)

**Alternatives considérées** :
- Auth custom avec JWT : Complexité de sécurisation et maintenance
- Auth0 / Clerk : Coûts prohibitifs pour le marché africain

### 2. Schéma de données : Table `stylistes` séparée de `auth.users`

**Décision** : Créer une table `stylistes` liée à `auth.users` via foreign key.

**Rationale** :
- Séparation des responsabilités : `auth.users` pour l'auth, `stylistes` pour le profil business
- Permet d'ajouter des champs métier sans polluer la table auth
- Compatible avec l'évolution vers multi-rôles (si admins futurs)

**Schéma** :
```sql
-- Supabase Auth (géré par Supabase)
auth.users (id, phone, email, created_at, ...)

-- Notre table stylistes
stylistes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  salon_name TEXT NOT NULL,
  description TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'BJ',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- RLS sur stylistes
ALTER TABLE stylistes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stylistes can only see their own data"
  ON stylistes FOR ALL
  USING (auth.uid() = user_id);
```

### 3. CRM local : Isolation multi-tenant via RLS PostgreSQL

**Décision** : Utiliser Row Level Security (RLS) pour isolation stricte des clients par styliste.

**Rationale** :
- Sécurité au niveau de la base de données (défense en profondeur)
- Impossible pour un styliste de voir les clients d'un autre (même avec bug frontend/API)
- Performance : filtrage au niveau PostgreSQL, pas de logique métier redondante

**Schéma** :
```sql
clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  styliste_id UUID REFERENCES stylistes(id) NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- RLS sur clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stylistes can only manage their own clients"
  ON clients FOR ALL
  USING (
    styliste_id IN (
      SELECT id FROM stylistes WHERE user_id = auth.uid()
    )
  );
```

### 4. Validation : Zod schemas partagés frontend/backend

**Décision** : Utiliser Zod pour validation avec schemas partagés entre frontend et backend.

**Rationale** :
- Type-safety garantie (TypeScript)
- Validation côté client pour UX (feedback immédiat)
- Validation côté serveur pour sécurité (jamais faire confiance au client)
- Réutilisation du code (DRY)

**Exemple** :
```typescript
// src/lib/schemas/styliste.ts
export const stylisteProfileSchema = z.object({
  salon_name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  phone: z.string().regex(/^\+?[0-9]{8,15}$/),
  email: z.string().email().optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  country: z.string().length(2).default('BJ')
});
```

### 5. API Routes : SvelteKit endpoints avec gestion d'erreur standardisée

**Décision** : Utiliser SvelteKit API routes (`src/routes/api/...`) avec format de réponse JSON standardisé.

**Rationale** :
- Colocation avec le frontend (simplification déploiement)
- SSR/Edge compatible (Cloudflare Pages)
- Type-safety avec TypeScript end-to-end

**Format de réponse** :
```typescript
// Success
{ data: T, error: null }

// Error
{ data: null, error: { code: string, message: string } }
```

### 6. Frontend : Composants réutilisables avec TailwindCSS

**Décision** : Créer des composants UI réutilisables dans `src/lib/components/ui/`.

**Rationale** :
- Cohérence visuelle
- Réduction du bundle size (pas de bibliothèque externe lourde)
- Flexibilité totale pour adapter au contexte africain

**Composants prioritaires** :
- `Button.svelte`
- `Input.svelte`
- `Form.svelte`
- `Card.svelte`
- `Modal.svelte`

## Risks / Trade-offs

### [Risque] Dépendance forte à Supabase
**Mitigation** :
- Utiliser Drizzle ORM (abstraction base de données)
- Wrapper les appels Supabase Auth dans un service (`src/lib/services/auth.ts`)
- Migration possible vers Postgres standalone + Auth custom si nécessaire

### [Trade-off] Phone OTP : coûts SMS
**Mitigation** :
- Utiliser Termii (SMS optimisé Afrique, coûts faibles)
- Limiter les envois avec rate limiting (max 3 OTP/hour/phone)
- Offrir Email/OAuth comme alternatives gratuites

### [Risque] Performance RLS sur grandes volumétries
**Mitigation** :
- Index sur `styliste_id` dans table `clients`
- Monitoring des requêtes lentes (Supabase logs)
- Si problème : cache Redis pour listes clients fréquemment consultées (V1)

### [Risque] Connexions instables Afrique
**Mitigation** :
- PWA avec cache offline (Vite PWA Plugin)
- Optimistic UI updates (feedback immédiat, sync async)
- Retry automatique avec exponential backoff

## Migration Plan

**Déploiement initial (aucune donnée existante)** :

1. **Database setup** :
   - Exécuter migrations Drizzle pour créer tables `stylistes` et `clients`
   - Activer RLS sur les deux tables
   - Créer les policies RLS

2. **Frontend deployment** :
   - Build SvelteKit (`npm run build`)
   - Deploy sur Cloudflare Pages
   - Variables d'environnement : `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`

3. **Backend secrets** :
   - Ajouter `SUPABASE_SERVICE_ROLE_KEY` dans Cloudflare Secrets (API routes)

4. **Smoke tests** :
   - Créer un compte styliste test
   - Ajouter un client test
   - Vérifier isolation multi-tenant (tenter d'accéder aux données d'un autre styliste via API)

**Rollback** :
- Cloudflare Pages permet rollback instantané vers version précédente
- Migrations database à gérer manuellement si nécessaire (aucune donnée utilisateur pour MVP)

## Open Questions

- **Pays supportés au MVP** : Uniquement Bénin (BJ) ou élargir à CEDEAO ?
  → Décision : Commencer avec BJ, ajouter sélecteur pays dans V1

- **Champs obligatoires profil** : `salon_name` et `phone` suffisants ?
  → À valider avec tests utilisateurs MVP

- **Limite nombre de clients par styliste** : Faut-il limiter pour plan Gratuit ?
  → Décision : Oui (voir PRD.md section 11.2 - limite à définir dans change abonnements)
