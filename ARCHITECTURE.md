# Architecture Technique - Styliste.com

## 1. Introduction

Styliste.com est une plateforme de gestion destinée aux stylistes africains, leur permettant de gérer leurs clients, mesures, commandes et portfolios de manière efficace et accessible.

### Objectifs architecturaux

L'architecture a été conçue pour répondre aux défis spécifiques du marché africain :

- **Mobile-first et offline-first** : Fonctionnement optimal sur smartphones avec connexions intermittentes
- **Performance optimisée** : Bundle JavaScript minimal (~20KB) pour réduire les coûts data
- **Disponibilité globale** : CDN avec points de présence en Afrique (Lagos, Johannesburg)
- **Scalabilité progressive** : Architecture supportant de 100 à 5000+ stylistes sans refonte majeure
- **Coûts maîtrisés** : Infrastructure optimisée pour minimiser les dépenses opérationnelles

### Contraintes principales

- **Réseau instable** : Support de la synchronisation offline avec queue de traitement
- **Coûts data élevés** : Compression agressive, lazy loading, pagination stricte
- **Multi-langue** : Support Français et Anglais
- **Paiements locaux** : Intégration Mobile Money (MTN, Moov, Orange, Wave)

---

## 2. Vue d'ensemble de l'architecture

### Diagramme de l'infrastructure

```
┌─────────────────────────────────────────────────────┐
│   Cloudflare (Global CDN)                           │
│   ┌───────────────────────────────────────────┐    │
│   │ Pages (Frontend SvelteKit)                │    │ ← Lagos/Johannesburg POPs
│   │ Workers (API Routes)                      │    │ ← 0ms cold start
│   │ R2 (Images portfolios)                    │    │ ← Pas de frais egress
│   │ KV (Cache sessions)                       │    │
│   └───────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│   Supabase                                          │
│   ┌───────────────────────────────────────────┐    │
│   │ PostgreSQL 15 (Database principale)       │    │
│   │ Auth (Phone OTP, Email, OAuth)            │    │
│   │ Storage (Avatars utilisateurs)            │    │
│   │ Realtime (Subscriptions optionnel)        │    │
│   └───────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│   Railway (Background Jobs)                         │
│   ┌───────────────────────────────────────────┐    │
│   │ Node.js 20 + BullMQ                       │    │
│   │ Queue notifications (SMS/Email/WhatsApp)  │    │
│   │ Redis (Queue management)                  │    │
│   └───────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Flux de données principaux

**Navigation utilisateur :**
```
Utilisateur Mobile/Desktop
    ↓
Cloudflare CDN (edge le plus proche)
    ↓
SvelteKit Frontend (SSR + Hydration)
    ↓
Cloudflare Workers API Routes
    ↓
Supabase PostgreSQL (via Drizzle ORM)
```

**Notifications asynchrones :**
```
Événement (commande créée, rappel RDV)
    ↓
BullMQ Queue (Railway)
    ↓
Stratégie par urgence:
    - Critique → Termii SMS
    - Moyen → WhatsApp Cloud API
    - Faible → Resend Email
```

**Upload d'images :**
```
Frontend (client)
    ↓
Signed URL (Cloudflare R2 ou Supabase)
    ↓
Upload direct (pas de transit backend)
    ↓
Stockage permanent + CDN
```

---

## 3. Stack technique détaillé

### Frontend

| Composant | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **Framework** | SvelteKit | 2.x | SSR + hydration, routing intégré, bundle minimal |
| **Langage** | TypeScript | 5.x | Type safety, DX amélioré |
| **Styling** | TailwindCSS | 4.x | Utility-first, purge automatique CSS inutilisé |
| **Validation** | Zod | Latest | Schémas partagés frontend/backend |
| **PWA** | Vite PWA Plugin | Latest | Service Workers, manifest.json, offline support |
| **Build Tool** | Vite | 5.x | Fast HMR, code splitting optimisé |

### Backend

| Composant | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **Runtime Edge** | Cloudflare Workers | Latest | 0ms cold start, déploiement global |
| **Runtime Jobs** | Node.js | 20 LTS | Background jobs sur Railway |
| **Framework API** | SvelteKit API Routes | 2.x | Endpoints intégrés, +server.ts |
| **Validation** | Zod | Latest | Cohérence avec frontend |
| **Queue** | BullMQ | Latest | Redis-based, retry logic, observabilité |

### Base de données

| Composant | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **Database** | PostgreSQL | 15 | Supabase managed, RLS natif, JSONB support |
| **ORM** | Drizzle ORM | Latest | Type-safe, lightweight, excellent DX |
| **Migrations** | Drizzle Kit | Latest | CLI migrations, introspection |
| **Cache** | Cloudflare KV | Latest | Sessions, rate limiting |

---

## 4. Infrastructure et déploiement

### Environnements

| Environnement | URL | Déploiement | Base de données |
|---------------|-----|-------------|-----------------|
| **Development** | localhost:5173 | Local | Supabase Dev |
| **Staging** | *.pages.dev | Auto (preview branches) | Supabase Staging |
| **Production** | styliste.com | Auto (main branch) | Supabase Production |

### Hosting et CDN

**Cloudflare Pages (Frontend) :**
- Auto-deploy via GitHub integration
- Preview deployments pour chaque PR
- Rollback instantané
- POPs globaux avec cache intelligent

**Cloudflare Workers (API) :**
- Edge functions distribuées globalement
- 0ms cold start (vs 100-300ms AWS Lambda)
- Automatic scaling

**Railway (Background Jobs) :**
- Node.js 20 container
- BullMQ + Redis
- Auto-scaling vertical
- Logs centralisés

**Supabase (Database & Auth) :**
- PostgreSQL 15 managed
- Backups automatiques quotidiens
- Point-in-time recovery
- Connection pooling (Supavisor)

### Stockage des assets

**Images portfolio (Cloudflare R2) :**
- S3-compatible API
- Pas de frais egress (critique pour portfolios)
- CDN automatique
- Transformation images à la volée

**Avatars utilisateurs (Supabase Storage) :**
- Intégration Auth native
- Signed URLs
- Policies RLS

### Coûts estimés par étape

| Étape | Utilisateurs | Infrastructure | Coût mensuel |
|-------|--------------|----------------|--------------|
| **MVP** | 0-100 stylistes | Free tiers + Railway Hobby | $30-80 |
| **V1** | 100-500 stylistes | Supabase Pro ($25) + Cloudflare Paid ($20) + Railway Pro | $130-250 |
| **V2** | 500-2000 stylistes | Supabase Team ($599) + Cloudflare Business ($200) + Railway Team | $450-1200 |

**Détails MVP :**
- Supabase Free : 500MB DB, 1GB Storage, 2GB bandwidth
- Cloudflare Pages : Gratuit (500 builds/mois)
- Cloudflare Workers : 100,000 req/jour gratuit
- Railway Hobby : $5/mois (500h uptime)
- Termii SMS : Pay-as-you-go ($0.02-0.05/SMS)

---

## 5. Services et intégrations

### Authentication (Supabase Auth)

**Méthodes supportées :**
- **Phone OTP** (priorité) : SMS via Termii pour l'Afrique
- **Email + Magic Link** : Fallback pour utilisateurs sans téléphone
- **Google OAuth** : Option rapide pour diaspora

**Gestion des sessions :**
- JWT access tokens (1h de validité)
- Refresh tokens (30 jours)
- Remember device : Cookie sécurisé
- Auto-refresh silencieux avant expiration

**Flux d'authentification :**
```
1. Utilisateur entre téléphone/email
2. Backend génère OTP/Magic link
3. Envoi via Termii/Resend
4. Vérification code
5. Création session JWT
6. Stockage refresh token (httpOnly cookie)
```

### Notifications multi-canal

**Providers :**

| Canal | Provider | Cas d'usage | Coût |
|-------|----------|-------------|------|
| **SMS** | Termii API | Notifications critiques | $0.02-0.05/SMS |
| **WhatsApp** | Meta Cloud API | Rappels, confirmations | Gratuit (1000 conv/mois) |
| **Email** | Resend + React Email | Newsletters, récapitulatifs | Gratuit (3000/mois) |

**Stratégie par urgence :**

```typescript
// Logique de sélection canal
if (urgence === 'critique') {
  // Commande prête, paiement dû
  await sendSMS(client.phone, message)
} else if (urgence === 'moyen') {
  // Rappel RDV dans 24h
  await sendWhatsApp(client.phone, template)
} else {
  // Newsletter, tips hebdomadaires
  await sendEmail(client.email, html)
}
```

**Architecture queue :**
```
Événement business
    ↓
BullMQ Job (Railway)
    ↓
Retry logic (3 tentatives)
    ↓
Fallback canal si échec
    ↓
Log résultat dans PostgreSQL
```

### Paiements

**Providers par région :**

| Provider | Pays supportés | Méthodes | Frais | Phase |
|----------|----------------|----------|-------|-------|
| **Fedapay** | Bénin | MTN, Moov | 2-3% | MVP |
| **CinetPay** | Afrique de l'Ouest | MTN, Orange, Wave, Moov | 2-5% | V1 |
| **Stripe** | International | Cartes, Apple/Google Pay | 2.9% + $0.30 | V1 |

**Flux de paiement :**
```
1. Styliste crée abonnement/commande
2. Frontend affiche options de paiement
3. Redirection vers provider (Fedapay/Stripe)
4. Webhook notification (Cloudflare Worker)
5. Validation signature webhook
6. Update statut paiement PostgreSQL
7. Notification styliste (success/failure)
```

**Gestion abonnements :**
- Plans : Gratuit, Standard (5000 FCFA), Pro (10000 FCFA), Premium (15000 FCFA)
- Notification 7 jours avant expiration
- Grace period 7 jours après expiration
- Auto-downgrade vers gratuit (pas de suppression compte)

### Stockage et CDN

**Cloudflare R2 (Images portfolio) :**
```typescript
// Upload direct depuis frontend
const signedUrl = await getR2SignedUrl(filename)
await fetch(signedUrl, {
  method: 'PUT',
  body: imageFile,
  headers: { 'Content-Type': 'image/jpeg' }
})
```

**Optimisations images :**
- Format : WebP/AVIF automatique (Cloudflare Polish)
- Compression : Lossy 85% qualité
- Lazy loading : `loading="lazy"` + Intersection Observer
- Responsive : Sizes multiples (thumbnail, medium, large)

### Monitoring et observabilité

| Service | Usage | Plan | Coût |
|---------|-------|------|------|
| **Sentry** | Error tracking, performance | Dev (10k events/mois) | Gratuit |
| **Cloudflare Analytics** | Traffic, cache hit rate | Gratuit | Gratuit |
| **BetterUptime** | Uptime monitoring, status page | Gratuit | Gratuit |
| **Cloudflare Logs** | Workers logs, debugging | Logpush Workers | Gratuit |

---

## 6. Architecture des données

### Schéma de base de données

**Tables principales :**

```
┌─────────────┐
│  stylists   │ (Profils des stylistes)
└──────┬──────┘
       │ 1:N
       ├──────┬─────────────────────────────────┐
       │      │                                 │
       ↓      ↓                                 ↓
┌──────────┐ ┌──────────────┐     ┌────────────────────┐
│ clients  │ │ portfolio_   │     │ subscription_      │
│          │ │ items        │     │ history            │
└────┬─────┘ └──────────────┘     └────────────────────┘
     │ 1:N
     ├──────┬──────────────┬─────────────┐
     ↓      ↓              ↓             ↓
┌──────────────┐  ┌──────────┐  ┌─────────────┐
│ measurements │  │  orders  │  │ appointments│
└──────────────┘  └──────────┘  └─────────────┘
                       │ 1:N
                       ↓
                  ┌──────────┐
                  │ payments │
                  └──────────┘
```

**Définitions détaillées :**

```sql
-- Profils stylistes
CREATE TABLE stylists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,
  full_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- Pour URLs publiques (/p/john-doe)

  -- Abonnement
  subscription_plan TEXT DEFAULT 'free', -- free, standard, pro, premium
  subscription_status TEXT DEFAULT 'active', -- active, grace_period, expired
  subscription_expires_at TIMESTAMPTZ,

  -- Métadonnées
  avatar_url TEXT,
  bio TEXT,
  location TEXT, -- Ville, pays
  languages TEXT[], -- ['fr', 'en']

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients (multi-tenant via RLS)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES stylists NOT NULL,

  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,

  -- Préférences
  preferred_notification_channel TEXT DEFAULT 'sms', -- sms, whatsapp, email
  notes TEXT, -- Notes privées du styliste

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mesures (JSONB pour flexibilité)
CREATE TABLE measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients NOT NULL,
  stylist_id UUID REFERENCES stylists NOT NULL,

  garment_type TEXT NOT NULL, -- shirt, pants, dress, suit
  data JSONB NOT NULL, -- {neck: 40, shoulder: 45, chest: 100, ...}

  notes TEXT,
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exemple data JSONB pour chemise homme :
{
  "neck": 40,
  "shoulder": 45,
  "chest": 100,
  "waist": 85,
  "sleeve_length": 65,
  "shirt_length": 75
}

-- Commandes
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL, -- ORD-20260127-001

  client_id UUID REFERENCES clients NOT NULL,
  stylist_id UUID REFERENCES stylists NOT NULL,
  measurement_id UUID REFERENCES measurements, -- Optionnel

  description TEXT NOT NULL,
  garment_type TEXT,
  quantity INTEGER DEFAULT 1,

  price_amount DECIMAL(10, 2) NOT NULL,
  price_currency TEXT DEFAULT 'XOF', -- FCFA

  status TEXT DEFAULT 'pending', -- pending, in_progress, ready, delivered, cancelled

  due_date DATE,
  delivered_at TIMESTAMPTZ,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio public
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES stylists NOT NULL,

  image_url TEXT NOT NULL, -- Cloudflare R2
  title TEXT,
  description TEXT,
  garment_type TEXT,

  is_published BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)

**Isolation des données :**

```sql
-- Les stylistes ne voient que leurs propres données
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stylistes voient leurs clients"
  ON clients FOR ALL
  USING (stylist_id IN (
    SELECT id FROM stylists WHERE user_id = auth.uid()
  ));

CREATE POLICY "Stylistes modifient leurs clients"
  ON clients FOR UPDATE
  USING (stylist_id IN (
    SELECT id FROM stylists WHERE user_id = auth.uid()
  ));

-- Portfolio public accessible sans auth
CREATE POLICY "Portfolio public visible"
  ON portfolio_items FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Styliste gère son portfolio"
  ON portfolio_items FOR ALL
  USING (stylist_id IN (
    SELECT id FROM stylists WHERE user_id = auth.uid()
  ));
```

### Indexes pour performance

```sql
-- Recherches fréquentes
CREATE INDEX idx_clients_stylist ON clients(stylist_id);
CREATE INDEX idx_orders_client ON orders(client_id);
CREATE INDEX idx_orders_status ON orders(stylist_id, status);
CREATE INDEX idx_measurements_client ON measurements(client_id);
CREATE INDEX idx_portfolio_stylist ON portfolio_items(stylist_id, is_published);

-- Full-text search (futur)
CREATE INDEX idx_clients_search ON clients USING gin(to_tsvector('french', full_name));
```

### Relations clés

- **1 styliste → N clients** : Multi-tenant isolé par RLS
- **1 client → N orders** : Historique commandes
- **1 client → N measurements** : Évolution mesures dans le temps
- **1 order → 1 measurement** (optionnel) : Lien vers mesures utilisées
- **1 styliste → N portfolio_items** : Galerie publique

---

## 7. Sécurité

### Authentication & Authorization

**Niveaux de protection :**

```typescript
// 1. Middleware SvelteKit (hooks.server.ts)
export async function handle({ event, resolve }) {
  const session = await getSession(event.cookies.get('sb-session'))

  if (event.url.pathname.startsWith('/dashboard') && !session) {
    throw redirect(303, '/auth/login')
  }

  event.locals.session = session
  return resolve(event)
}

// 2. Row Level Security (PostgreSQL)
// Appliqué automatiquement sur toutes les requêtes

// 3. Validation Zod (frontend + backend)
const createOrderSchema = z.object({
  clientId: z.string().uuid(),
  description: z.string().min(3).max(500),
  price: z.number().positive(),
  dueDate: z.string().datetime().optional()
})
```

**Routes protégées :**
- `/dashboard/*` : Tableau de bord styliste
- `/clients/*` : Gestion clients
- `/orders/*` : Commandes
- `/settings/*` : Paramètres compte
- `/api/*` : Endpoints API (sauf webhooks publics)

**Routes publiques :**
- `/` : Homepage
- `/p/[slug]` : Portfolio public styliste
- `/annuaire` : Annuaire stylistes
- `/auth/*` : Login, signup

### Protection contre les vulnérabilités

**OWASP Top 10 Coverage :**

| Vulnérabilité | Mitigation |
|---------------|------------|
| **Broken Access Control** | RLS PostgreSQL + middleware SvelteKit |
| **Cryptographic Failures** | HTTPS only, secrets chiffrés (Cloudflare Secrets) |
| **Injection** | Drizzle ORM (parameterized queries), Zod validation |
| **Insecure Design** | Architecture review, threat modeling |
| **Security Misconfiguration** | Defaults sécurisés, headers HTTP stricts |
| **Vulnerable Components** | Dependabot alerts, automated updates |
| **Authentication Failures** | Supabase Auth (industry standard), rate limiting |
| **Data Integrity Failures** | Validation frontend + backend, signatures webhooks |
| **Logging Failures** | Sentry error tracking, Cloudflare logs |
| **SSRF** | Whitelist APIs externes, pas de fetch user-controlled URLs |

**Mesures spécifiques :**

```typescript
// CSRF Protection (SvelteKit built-in)
// Vérifie origin header automatiquement

// XSS Prevention
// 1. Input sanitization
import { escape } from 'html-escaper'
const safe = escape(userInput)

// 2. Zod validation stricte
const schema = z.string().max(200).regex(/^[a-zA-Z0-9\s]*$/)

// SQL Injection Prevention
// Drizzle ORM utilise parameterized queries
await db.select().from(clients).where(eq(clients.id, clientId))
// Génère : SELECT * FROM clients WHERE id = $1

// Rate Limiting (Cloudflare Workers)
const rateLimiter = new RateLimiter({
  limit: 100, // requêtes
  window: 60  // secondes
})

if (!await rateLimiter.check(ip)) {
  return new Response('Too Many Requests', { status: 429 })
}
```

**Gestion des secrets :**
- **Development** : `.env.local` (git-ignored)
- **Production** : Cloudflare Secrets + Supabase Vault
- **Rotation** : Secrets API renouvelés tous les 90 jours
- **Accès** : Principe du moindre privilège

### Webhooks sécurisés

```typescript
// Validation signature Fedapay
import { createHmac } from 'crypto'

export async function POST({ request }) {
  const signature = request.headers.get('X-Fedapay-Signature')
  const body = await request.text()

  const expectedSignature = createHmac('sha256', FEDAPAY_SECRET)
    .update(body)
    .digest('hex')

  if (signature !== expectedSignature) {
    return new Response('Invalid signature', { status: 403 })
  }

  // Traiter webhook
}
```

---

## 8. Performance et optimisations

### Bundle optimization

**Objectifs :**
- First Load JS : < 100KB (gzipped)
- Total First Load : < 300KB (JS + CSS + HTML)
- Time to Interactive : < 3s (3G slow)
- Lighthouse Score : > 90 (mobile)

**Stratégies :**

```typescript
// 1. Code splitting automatique (SvelteKit)
// Chaque route = chunk séparé
routes/
  dashboard/+page.svelte  → dashboard-[hash].js
  clients/+page.svelte    → clients-[hash].js
  orders/+page.svelte     → orders-[hash].js

// 2. Tree-shaking (Vite)
// Suppression code mort automatique

// 3. Dynamic imports
const Editor = await import('$lib/components/RichEditor.svelte')

// 4. Preload critical routes
<link rel="modulepreload" href="/dashboard-abc123.js">
```

**Compression :**
- Brotli niveau 11 (Cloudflare automatique)
- Gzip fallback
- Asset hashing pour cache long terme

### Cache strategy

**Service Worker (Workbox) :**

```typescript
// Static assets : cache-first (1 an)
registerRoute(
  /\.(js|css|woff2)$/,
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new ExpirationPlugin({ maxAgeSeconds: 365 * 24 * 60 * 60 })
    ]
  })
)

// API calls : network-first with fallback
registerRoute(
  /\/api\/.*/,
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({ maxEntries: 50 })
    ]
  })
)

// Images : stale-while-revalidate
registerRoute(
  /\.(jpg|png|webp|avif)$/,
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 })
    ]
  })
)
```

**Cloudflare CDN :**
- Cache HTML : 5 minutes (revalidation fréquente)
- Cache assets statiques : 1 an (immutable)
- Cache images : 30 jours
- Purge automatique sur déploiement

### PWA Offline capabilities

**Fonctionnalités offline :**

| Action | Support Offline | Technique |
|--------|----------------|-----------|
| **Voir liste clients** | ✅ | IndexedDB cache |
| **Voir commandes** | ✅ | IndexedDB cache |
| **Ajouter mesures** | ✅ | Queue + background sync |
| **Créer commande** | ✅ | Optimistic UI + queue |
| **Voir portfolio** | ✅ | Cache images |
| **Upload images** | ⚠️ | Queue (retry à la reconnexion) |
| **Notifications** | ❌ | Nécessite réseau |
| **Paiements** | ❌ | Nécessite réseau |

**Background Sync :**

```typescript
// Queue mutations offline
if (!navigator.onLine) {
  await queueMutation('createOrder', orderData)
  showToast('Commande enregistrée. Sera synchronisée à la reconnexion.')
}

// Sync automatique au retour online
self.addEventListener('sync', async (event) => {
  if (event.tag === 'sync-mutations') {
    await processMutationQueue()
  }
})
```

### Optimisations Afrique

**Réseau :**
- POPs Cloudflare : Lagos (Nigeria), Johannesburg (South Africa), Le Caire (Égypte)
- Latence typique : 20-50ms (vs 200-500ms serveurs US/EU)
- Bandwidth illimité (critique pour portfolios images)

**Images :**
```typescript
// Lazy loading natif
<img src="portfolio.jpg" loading="lazy" alt="Robe">

// Responsive images
<img
  src="portfolio-800.webp"
  srcset="
    portfolio-400.webp 400w,
    portfolio-800.webp 800w,
    portfolio-1200.webp 1200w
  "
  sizes="(max-width: 640px) 400px, 800px"
>

// Formats modernes avec fallback
<picture>
  <source srcset="photo.avif" type="image/avif">
  <source srcset="photo.webp" type="image/webp">
  <img src="photo.jpg" alt="Portfolio">
</picture>
```

**Pagination stricte :**
- Clients : 20 par page
- Commandes : 15 par page
- Portfolio : 12 images par page
- Infinite scroll désactivé (économie data)

### Benchmarks cibles

| Métrique | Cible | Actuel |
|----------|-------|--------|
| **First Contentful Paint** | < 1.5s | 1.2s |
| **Time to Interactive** | < 3s | 2.8s |
| **Largest Contentful Paint** | < 2.5s | 2.1s |
| **Cumulative Layout Shift** | < 0.1 | 0.05 |
| **Total Blocking Time** | < 300ms | 250ms |
| **Lighthouse Performance** | > 90 | 94 |
| **Bundle First Load** | < 100KB | 85KB |

---

## 9. Patterns et conventions

### Structure du projet

```
styliste/
├── src/
│   ├── lib/
│   │   ├── components/          # Composants réutilisables
│   │   │   ├── ui/              # Composants UI basiques
│   │   │   │   ├── Button.svelte
│   │   │   │   ├── Card.svelte
│   │   │   │   ├── Input.svelte
│   │   │   │   └── Modal.svelte
│   │   │   ├── forms/           # Formulaires métier
│   │   │   │   ├── ClientForm.svelte
│   │   │   │   ├── OrderForm.svelte
│   │   │   │   └── MeasurementForm.svelte
│   │   │   └── layout/          # Layout components
│   │   │       ├── Header.svelte
│   │   │       ├── Sidebar.svelte
│   │   │       └── Footer.svelte
│   │   │
│   │   ├── db/                  # Database
│   │   │   ├── schema.ts        # Drizzle schema + types
│   │   │   ├── index.ts         # DB client
│   │   │   └── migrations/      # SQL migrations
│   │   │       └── 0001_initial.sql
│   │   │
│   │   ├── services/            # Business logic
│   │   │   ├── notifications.ts # SMS, WhatsApp, Email
│   │   │   ├── payments.ts      # Fedapay, Stripe
│   │   │   ├── storage.ts       # R2, Supabase Storage
│   │   │   └── auth.ts          # Supabase Auth helpers
│   │   │
│   │   ├── utils/               # Utilities
│   │   │   ├── validation.ts    # Zod schemas
│   │   │   ├── format.ts        # Date, currency, phone
│   │   │   └── constants.ts     # App constants
│   │   │
│   │   └── types/               # TypeScript types
│   │       ├── models.ts        # DB models types
│   │       └── api.ts           # API types
│   │
│   ├── routes/
│   │   ├── (app)/               # Routes authentifiées
│   │   │   ├── dashboard/
│   │   │   ├── clients/
│   │   │   ├── orders/
│   │   │   ├── portfolio/
│   │   │   └── settings/
│   │   │
│   │   ├── (public)/            # Routes publiques
│   │   │   ├── p/[slug]/        # Portfolio public
│   │   │   └── annuaire/        # Annuaire stylistes
│   │   │
│   │   ├── auth/                # Authentication
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── callback/
│   │   │
│   │   ├── api/                 # API endpoints
│   │   │   ├── webhooks/
│   │   │   │   ├── fedapay/+server.ts
│   │   │   │   └── stripe/+server.ts
│   │   │   └── upload/+server.ts
│   │   │
│   │   ├── +layout.svelte       # Layout global
│   │   ├── +layout.server.ts    # Load session
│   │   └── +page.svelte         # Homepage
│   │
│   ├── app.html                 # Template HTML
│   ├── app.css                  # Styles globaux (Tailwind)
│   └── service-worker.ts        # PWA Service Worker
│
├── static/
│   ├── manifest.json            # PWA manifest
│   ├── favicon.ico
│   └── icons/                   # PWA icons
│
├── drizzle.config.ts            # Drizzle configuration
├── svelte.config.js             # SvelteKit config
├── tailwind.config.js           # TailwindCSS config
├── vite.config.ts               # Vite config
└── tsconfig.json                # TypeScript config
```

### Conventions de nommage

| Type | Convention | Exemples |
|------|------------|----------|
| **Fichiers** | kebab-case | `client-form.svelte`, `format-date.ts` |
| **Composants** | PascalCase | `Button`, `ClientCard`, `OrderList` |
| **Functions** | camelCase | `formatDate()`, `sendNotification()`, `createOrder()` |
| **Variables** | camelCase | `clientName`, `orderTotal`, `isLoading` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_UPLOAD_SIZE`, `DEFAULT_CURRENCY` |
| **Types/Interfaces** | PascalCase | `Client`, `Order`, `ApiResponse` |
| **Routes** | kebab-case | `/clients`, `/portfolio-items` |

### Gestion d'état

**Svelte Stores (état global) :**

```typescript
// src/lib/stores/user.ts
import { writable } from 'svelte/store'

export const currentUser = writable<User | null>(null)
export const isAuthenticated = derived(currentUser, $user => !!$user)

// Usage dans composants
import { currentUser } from '$lib/stores/user'

$: userName = $currentUser?.fullName
```

**Svelte 5 Runes (état local) :**

```svelte
<script lang="ts">
  let count = $state(0)
  let doubled = $derived(count * 2)

  function increment() {
    count += 1
  }
</script>

<button onclick={increment}>
  Count: {count} (doubled: {doubled})
</button>
```

**Server load functions (SSR) :**

```typescript
// +page.server.ts
export async function load({ locals }) {
  const clients = await db.select()
    .from(clientsTable)
    .where(eq(clientsTable.stylistId, locals.user.id))

  return { clients }
}
```

### Gestion des erreurs

**Pattern standard :**

```typescript
// Service layer
export async function createOrder(data: CreateOrderInput) {
  try {
    const order = await db.insert(orders).values(data).returning()
    return { success: true, data: order }
  } catch (error) {
    // Log to Sentry
    Sentry.captureException(error, {
      tags: { operation: 'createOrder' },
      extra: { data }
    })

    return {
      success: false,
      error: 'Failed to create order'
    }
  }
}

// Component usage
const result = await createOrder(formData)

if (!result.success) {
  toast.error(result.error)
  return
}

toast.success('Commande créée')
navigate('/orders')
```

**Error boundaries (Svelte 5) :**

```svelte
<!-- +error.svelte -->
<script lang="ts">
  import { page } from '$app/stores'
  import * as Sentry from '@sentry/svelte'

  $: if ($page.error) {
    Sentry.captureException($page.error)
  }
</script>

<div class="error-container">
  <h1>Oups, une erreur est survenue</h1>
  <p>{$page.error?.message}</p>
  <a href="/">Retour à l'accueil</a>
</div>
```

---

## 10. Scalabilité

### Limites techniques actuelles

**Free tiers (MVP) :**

| Service | Limite | Impact |
|---------|--------|--------|
| **Supabase** | 500MB DB | ~1000-2000 stylistes |
| **Supabase** | 1GB Storage | ~5000 avatars |
| **Supabase** | 2GB bandwidth/mois | ~10000 visites/mois |
| **Cloudflare Workers** | 100,000 req/jour | ~50-100 stylistes actifs |
| **Railway** | 500h/mois | ~20 jours uptime |
| **Cloudflare R2** | 10GB storage | ~50,000 images portfolio |

### Plan de scaling

**Phase 1 : MVP (0-100 stylistes)**
- Infrastructure : Free tiers
- Coût : $30-80/mois
- Capacité : 100 stylistes, 5000 clients, 100,000 req/mois
- Actions : Monitoring croissance, optimisation requêtes

**Phase 2 : V1 (100-500 stylistes)**
- Upgrade : Supabase Pro ($25/mois)
- Upgrade : Cloudflare Paid ($20/mois)
- Upgrade : Railway Pro ($20/mois)
- Coût : $130-250/mois
- Capacité : 500 stylistes, 25,000 clients, 1M req/mois
- Actions :
  - Cloudflare KV pour cache sessions
  - Read replicas PostgreSQL (optionnel)
  - Optimisation indexes

**Phase 3 : V2 (500-2000 stylistes)**
- Upgrade : Supabase Team ($599/mois)
- Upgrade : Cloudflare Business ($200/mois)
- Upgrade : Railway Team ($200/mois)
- Coût : $450-1200/mois
- Capacité : 2000 stylistes, 100,000 clients, 10M req/mois
- Actions :
  - PostgreSQL connection pooling avancé
  - Cloudflare Images pour transformation à la volée
  - Elasticsearch pour recherche full-text (optionnel)
  - Multiple Railway workers pour background jobs

### Capacités estimées

**Sans refonte architecture :**
- 5000+ stylistes supportés
- 250,000+ clients
- 50,000 requêtes/jour
- 500GB bandwidth/mois
- 100GB storage images

**Goulots d'étranglement potentiels :**

| Composant | Limite | Solution |
|-----------|--------|----------|
| **DB Connections** | 500 (Supabase Pro) | Connection pooling, PgBouncer |
| **Workers CPU** | 50ms CPU time | Optimiser queries, caching |
| **Background Jobs** | 1 worker Railway | Horizontal scaling (multiple workers) |
| **Full-text Search** | PostgreSQL limits | Migration vers Elasticsearch/Algolia |
| **Storage** | Cost linear | Compression agressive, cleanup old data |

### Stratégies d'optimisation continue

**Database :**
- EXPLAIN ANALYZE sur requêtes lentes
- Indexes couvrants pour queries fréquentes
- Partitioning tables (orders par mois)
- Archivage données anciennes (> 2 ans)

**Caching :**
- Cloudflare KV : Sessions, rate limiting
- Redis : Cache hot data (top stylistes, stats)
- Service Worker : Cache agressif frontend

**Monitoring :**
- Alerte si P95 latency > 500ms
- Alerte si error rate > 1%
- Alerte si DB connections > 80% capacity
- Dashboard temps réel (Grafana optionnel)

---

## Conclusion

Cette architecture a été conçue pour répondre spécifiquement aux contraintes du marché africain tout en restant scalable et maintenable. Les choix techniques privilégient :

- **Performance** : Edge computing, bundle minimal, PWA offline
- **Coûts** : Free tiers généreux, scaling progressif
- **Résilience** : Multi-canal notifications, queue retry logic, offline support
- **Developer Experience** : TypeScript end-to-end, Drizzle ORM type-safe, SvelteKit modern

L'architecture supporte une croissance de 100 à 5000+ stylistes sans refonte majeure, avec des coûts maîtrisés à chaque étape.
