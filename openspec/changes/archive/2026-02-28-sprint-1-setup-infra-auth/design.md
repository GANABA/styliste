## Context

Styliste.com est une plateforme SaaS B2B pour stylistes africains (cible initiale : Bénin). Le projet démarre de zéro - aucun code existant. Ce Sprint 1 établit les fondations techniques pour un MVP qui sera lancé en 12 semaines.

**Contraintes contextuelles** :
- **Mobile-first obligatoire** : 95% des utilisateurs sur smartphones 5-6 pouces
- **Connexion instable** : Offline-first requis (PWA + IndexedDB) - Phase 2
- **Coûts data** : Optimisation images et bandwidth critique
- **Faible littératie digitale** : UI simple, support WhatsApp
- **Multi-tenant** : Chaque styliste possède ses propres données clients (isolation stricte)

**État actuel** : Repository vide, documentation complète validée (PRD, architecture, schéma DB, 29 décisions architecturales).

**Stakeholders** : Founder/PM, Développeur Full-Stack, futurs 10 stylistes pilotes.

## Goals / Non-Goals

**Goals:**
- ✅ Projet Next.js 14+ opérationnel avec TypeScript, Tailwind, App Router
- ✅ Base de données PostgreSQL avec Prisma et migrations versionnées
- ✅ Authentification fonctionnelle (inscription, connexion, sessions sécurisées)
- ✅ Layout dashboard responsive avec navigation
- ✅ Middleware de protection des routes privées
- ✅ Environnement dev déployé sur Vercel
- ✅ Architecture multi-tenant (stylist_id FK) établie
- ✅ Pattern de validation (Zod) en place

**Non-Goals:**
- ❌ Fonctionnalités métier (clients, commandes) → Sprint 2-3
- ❌ Paiements / Fedapay → Sprint 4
- ❌ Portfolio public → Sprint 5
- ❌ Notifications email/SMS → Sprint 5
- ❌ Mode offline (PWA) → Phase 2
- ❌ Internationalisation (i18n) → V1
- ❌ Tests automatisés E2E → Sprint 7
- ❌ Dashboard admin → Sprint 6

## Decisions

### **D1: Next.js 14 avec App Router (vs Pages Router)**

**Décision** : Utiliser App Router de Next.js 14+ avec React Server Components.

**Rationale** :
- App Router = direction officielle Next.js (Pages Router en maintenance)
- Server Components réduisent bundle size JS → crucial pour 3G
- Streaming SSR améliore perceived performance
- Layouts imbriqués natifs (parfait pour dashboard)
- API Routes co-localisées avec les pages

**Alternatives considérées** :
- ❌ Pages Router : Legacy, moins de features modernes
- ❌ Remix : Moins mature, écosystème plus petit
- ❌ Vite + React : Nécessite plus de config custom

**Trade-off** : Courbe d'apprentissage App Router, mais investissement pour l'avenir.

---

### **D2: Prisma ORM (vs alternatives)**

**Décision** : Utiliser Prisma comme ORM avec PostgreSQL.

**Rationale** :
- Type-safety bout-en-bout (TypeScript)
- Migrations versionnées (prisma migrate)
- Prisma Studio pour debugging
- Protection SQL injection native
- Excellent support multi-tenant (filtrage par stylist_id)

**Alternatives considérées** :
- ❌ Drizzle ORM : Plus léger mais moins mature, migration path incertaine
- ❌ TypeORM : API moins intuitive, plus verbeux
- ❌ Raw SQL : Pas de type-safety, migrations manuelles

**Configuration** :
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

### **D3: NextAuth v5 (vs alternatives auth)**

**Décision** : NextAuth v5 (Auth.js) avec Prisma Adapter et JWT strategy.

**Rationale** :
- Intégration native Next.js App Router
- Prisma Adapter : sessions en DB automatiquement
- JWT tokens : stateless, scalable
- Support email/password (MVP) + OAuth ready (V1)
- Edge-compatible

**Alternatives considérées** :
- ❌ Clerk : Coûteux ($25/mois), vendor lock-in
- ❌ Auth0 : Overkill pour MVP, pricing complexe
- ❌ Custom JWT : Réinventer la roue, risques sécurité

**Configuration sécurité** :
- Sessions JWT avec rotation
- HttpOnly cookies (protection XSS)
- CSRF protection activée
- Password hashing : bcrypt (12 rounds)
- Rate limiting sur endpoints auth

---

### **D4: shadcn/ui (vs bibliothèques UI)**

**Décision** : shadcn/ui comme système de composants UI.

**Rationale** :
- Copy-paste components (pas de dépendance runtime lourde)
- Tailwind-native (cohérence design system)
- Accessible (ARIA compliant)
- Customizable 100% (on possède le code)
- Radix UI primitives (production-grade)

**Alternatives considérées** :
- ❌ Material-UI : Bundle size énorme (~300kb), pas Tailwind
- ❌ Chakra UI : Runtime styling overhead
- ❌ Headless UI : Moins de composants pré-faits

**Composants Sprint 1** :
```bash
npx shadcn-ui@latest add button input label form card
npx shadcn-ui@latest add dropdown-menu avatar separator
npx shadcn-ui@latest add dialog alert toast
```

---

### **D5: Architecture multi-tenant par stylist_id**

**Décision** : Multi-tenant avec FK `stylist_id` sur toutes tables scoped + Row Level Security PostgreSQL.

**Rationale** :
- Isolation données simple et robuste
- Pas de shared data entre stylistes (requis métier)
- RLS PostgreSQL = sécurité en profondeur
- Scalable jusqu'à 10k stylistes facilement

**Schéma type** :
```prisma
model Client {
  id         String   @id @default(uuid())
  stylistId  String   @map("stylist_id")
  stylist    Stylist  @relation(fields: [stylistId], references: [id])
  name       String
  // ...
  @@index([stylistId])
}
```

**Alternatives considérées** :
- ❌ Schema par tenant : Complexité migrations
- ❌ Database par tenant : Coût infra prohibitif

**Sécurité** :
- Middleware vérifie `session.user.stylistId` sur chaque requête
- Prisma queries filtrent automatiquement par `stylistId`
- RLS PostgreSQL en backup (défense en profondeur)

---

### **D6: Neon PostgreSQL (vs alternatives)**

**Décision** : Neon comme provider PostgreSQL managé.

**Rationale** :
- Serverless PostgreSQL (autoscaling)
- Branching DB (environnements dev/staging faciles)
- Generous free tier (500 MB storage, 100h compute/mois)
- Compatible 100% Prisma
- Backups automatiques

**Alternatives considérées** :
- ❌ Supabase : Features overkill pour MVP (auth, realtime non utilisés)
- ❌ RDS AWS : Setup complexe, coût minimum ~$15/mois
- ❌ Railway : Pricing moins clair long terme

**Configuration** :
- Instance dev : Shared compute (free tier)
- Instance prod (Phase 3) : Dedicated compute
- Connection pooling : Prisma Data Proxy (si nécessaire)

---

### **D7: Vercel pour hosting (vs alternatives)**

**Décision** : Vercel comme plateforme de déploiement.

**Rationale** :
- Next.js natif (créateurs de Next.js)
- Déploiement automatique GitHub
- Edge Network global (CDN)
- Environments (preview/prod) automatiques
- Free tier généreux

**Alternatives considérées** :
- ❌ Netlify : Moins optimisé Next.js App Router
- ❌ Railway : Moins mature pour Next.js
- ❌ AWS Amplify : Complexité excessive

**Configuration CI/CD** :
- Git push → auto-deploy preview
- Merge main → auto-deploy prod
- Rollback en 1 clic

---

### **D8: Zustand + React Query (vs alternatives state)**

**Décision** : Zustand (état client léger) + React Query (état serveur).

**Rationale** :
- **Zustand** : Simple, pas de boilerplate, TS-friendly
- **React Query** : Cache intelligent, stale-while-revalidate, optimistic updates
- Séparation claire client state / server state
- Bundle size minimal (<3kb Zustand)

**Alternatives considérées** :
- ❌ Redux Toolkit : Overkill, trop de boilerplate
- ❌ Jotai/Recoil : Moins mature
- ❌ Context API seul : Pas de cache, re-renders

**Usage Sprint 1** :
- Zustand : UI state (sidebar open/close, theme)
- React Query : Auth user, session cache

---

### **D9: Structure dossiers**

**Décision** : Structure Feature-Based hybride.

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Route group auth
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/           # Route group protected
│   │   ├── layout.tsx       # Dashboard layout
│   │   └── page.tsx         # Dashboard home
│   └── api/                 # API routes
│       └── auth/
├── components/              # Composants réutilisables
│   ├── ui/                  # shadcn/ui components
│   ├── layout/              # Layout components (Sidebar, Header)
│   └── forms/               # Form components
├── lib/                     # Utilitaires
│   ├── auth.ts              # NextAuth config
│   ├── prisma.ts            # Prisma client singleton
│   ├── validations.ts       # Zod schemas
│   └── utils.ts             # Helpers
├── hooks/                   # Custom React hooks
├── stores/                  # Zustand stores
├── types/                   # TypeScript types
└── styles/                  # Global CSS
```

**Rationale** :
- App Router folders = routes (colocation naturelle)
- Composants partagés dans `/components`
- Business logic dans `/lib`
- Évolutif vers feature modules (Sprint 2+)

---

### **D10: Variables d'environnement**

**Décision** : `.env.local` pour dev, Vercel Env Variables pour prod.

**Variables requises Sprint 1** :
```bash
# Database
DATABASE_URL="postgresql://user:pass@host/db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Sécurité** :
- `.env.local` dans `.gitignore`
- Secrets dans Vercel dashboard (encrypted)
- Pas de `NEXT_PUBLIC_` pour secrets (exposés client)

## Risks / Trade-offs

### **R1: Courbe d'apprentissage Next.js App Router**
**Risque** : Développeur moins familier avec App Router vs Pages Router.
**Mitigation** :
- Documentation Next.js extensive
- Patterns établis dans ARCHITECTURE.md
- Community large (Stack Overflow, Discord)
- ROI long terme justifie investissement

---

### **R2: Neon free tier limitations**
**Risque** : 500MB storage, 100h compute/mois peuvent suffire dev mais pas scale test.
**Mitigation** :
- Monitoring usage dashboard Neon
- Upgrade Pro ($19/mois) si dépassement imminent
- Cleanup régulière données test
- Database branching pour environnements séparés

---

### **R3: Dépendance Vercel pour hosting**
**Risque** : Vendor lock-in, pricing potentiel si scale énorme.
**Mitigation** :
- Next.js self-hostable (Docker) si nécessaire
- Pricing Vercel transparent et prédictible
- Pas de features Vercel-only utilisées (portable)
- Break-even ~1000 EUR MRR avant que pricing soit problème

---

### **R4: NextAuth session management**
**Risque** : JWT tokens stateless = révocation difficile (logout).
**Mitigation** :
- Session table en DB (Prisma adapter) pour tracking
- Token expiry court (7 jours) avec refresh
- Blacklist tokens en Redis si besoin (Phase 2)
- Pour MVP, force re-login si changement critique

---

### **R5: Type safety Prisma → Frontend**
**Risque** : Prisma types en backend, duplication en frontend si pas careful.
**Mitigation** :
- Exporter types Prisma dans `/types` : `export type { User, Stylist } from '@prisma/client'`
- tRPC en V1 pour type-safety end-to-end (hors scope Sprint 1)
- Validation Zod partagée backend/frontend

---

### **R6: Mobile performance avec React**
**Risque** : React peut être lourd sur smartphones bas de gamme.
**Mitigation** :
- Server Components réduisent JS envoyé
- Code splitting automatique Next.js
- Lazy loading images (next/image)
- Lighthouse monitoring (target >90)
- Tests sur vrais devices Android (Sprint 7)

## Migration Plan

### **Phase 1: Setup Local (Jour 1)**

```bash
# 1. Créer projet Next.js
npx create-next-app@latest styliste-app \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

# 2. Installer dépendances
npm install prisma @prisma/client
npm install next-auth @auth/prisma-adapter
npm install zod react-hook-form @hookform/resolvers
npm install zustand @tanstack/react-query
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install -D @types/node @types/react

# 3. Initialiser Prisma
npx prisma init

# 4. Initialiser shadcn/ui
npx shadcn-ui@latest init
```

### **Phase 2: Configuration Database (Jour 1-2)**

1. **Créer compte Neon.tech**
   - Créer projet "styliste-dev"
   - Copier `DATABASE_URL`

2. **Copier schéma Prisma** depuis `DATABASE_SCHEMA.md`
   - Tables essentielles Sprint 1 : `User`, `Stylist`, `SubscriptionPlan`, `Subscription`, `Session`, `VerificationToken`

3. **Première migration**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Seed data**
   ```bash
   npx prisma db seed
   ```
   - 3 subscription plans (Free, Standard, Pro)
   - 1 admin user

### **Phase 3: Authentication Setup (Jour 2-3)**

1. **Configuration NextAuth**
   - Créer `lib/auth.ts` avec config
   - Créer `app/api/auth/[...nextauth]/route.ts`

2. **Pages auth**
   - `app/(auth)/login/page.tsx`
   - `app/(auth)/register/page.tsx`

3. **Middleware**
   - `middleware.ts` : Protéger `/dashboard/*`

4. **Test auth flow**
   - Inscription → Connexion → Session → Dashboard

### **Phase 4: Dashboard Layout (Jour 3-4)**

1. **Layout components**
   - `components/layout/Sidebar.tsx`
   - `components/layout/Header.tsx`
   - `components/layout/Navigation.tsx`

2. **Dashboard layout**
   - `app/dashboard/layout.tsx`
   - `app/dashboard/page.tsx` (placeholder)

3. **Responsive design**
   - Mobile: Sidebar drawer
   - Desktop: Sidebar fixe

### **Phase 5: Deployment Vercel (Jour 4-5)**

1. **Créer projet Vercel**
   - Connecter GitHub repo
   - Configure auto-deploy

2. **Environment variables**
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`

3. **Test déploiement**
   - Git push → Vercel build → Verify live URL

4. **Domaine dev** (optionnel)
   - `dev.styliste.com` → Vercel app

### **Rollback Strategy**

- **Git** : Chaque phase = commit séparé, revert possible
- **Database** : Prisma migrations sont versionnées, down migrations possibles
- **Vercel** : Rollback deployment en 1 clic dans dashboard

### **Success Criteria**

Sprint 1 est **DONE** quand :
- ✅ `npm run dev` fonctionne sans erreurs
- ✅ User peut s'inscrire, se connecter, voir dashboard
- ✅ Middleware redirige vers login si non authentifié
- ✅ Database Neon contient tables avec seed data
- ✅ Déploiement Vercel accessible publiquement
- ✅ Lighthouse score > 85 (desktop), > 80 (mobile)

## Open Questions

### **Q1: Stratégie de backup Database**
**Question** : Backups automatiques Neon suffisants ou custom backup script ?
**Impact** : Data loss prevention
**Décision nécessaire** : Avant Phase 2 (pilote avec vrais stylistes)
**Options** :
- A) Neon automated backups (7 jours rétention)
- B) Custom daily backup vers S3
- C) Les deux (défense en profondeur)

**Recommandation temporaire** : Option A pour MVP, Option C pour production.

---

### **Q2: Logging et monitoring**
**Question** : Quel outil logging/errors pour MVP ?
**Impact** : Debugging production, alertes
**Options** :
- A) Vercel Logs (natif mais limité)
- B) Sentry (free tier 5k events/mois)
- C) BetterStack (logging + uptime)

**Recommandation temporaire** : Option B (Sentry) - quick win, free tier suffisant MVP.

---

### **Q3: Email provider pour transactionnel**
**Question** : Quel provider email pour password reset, welcome emails ?
**Impact** : Sprint 1 auth flow (password reset)
**Options** :
- A) Resend (plan gratuit 100 emails/jour)
- B) SendGrid (plan gratuit 100 emails/jour)
- C) Report à Sprint 5 (notifications)

**Recommandation temporaire** : Option A (Resend) - meilleur DX, modern API.

---

### **Q4: Rate limiting strategy**
**Question** : Rate limiting sur auth endpoints pour prévenir brute force ?
**Impact** : Sécurité
**Options** :
- A) Middleware custom avec Redis (Upstash)
- B) Vercel Edge Config (limitations)
- C) Simple in-memory (Map) pour MVP

**Recommandation temporaire** : Option C pour Sprint 1, Option A pour Phase 2.

---

### **Q5: TypeScript strict mode**
**Question** : `"strict": true` dans tsconfig.json ?
**Impact** : Type safety vs vélocité développement
**Décision** : **OUI** - strict mode activé. Meilleure pratique, évite bugs runtime.

---

### **Q6: Tests unitaires Sprint 1**
**Question** : Écrire tests pour auth logic ?
**Impact** : Confiance code, refactoring
**Options** :
- A) Tests dès Sprint 1 (Jest + Testing Library)
- B) Tests Sprint 7 (avant lancement)

**Recommandation temporaire** : Option B - prioriser vélocité MVP, comprehensive tests Sprint 7.
