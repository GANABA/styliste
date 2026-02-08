## Why

Le projet Styliste.com nécessite une fondation technique solide pour démarrer le développement du MVP. Ce premier sprint établit l'infrastructure de base, le système d'authentification et la structure du projet qui permettront aux sprints suivants de développer les fonctionnalités métier (clients, commandes, paiements). Sans cette base, aucune fonctionnalité SaaS multi-tenant ne peut être implémentée de manière sécurisée et scalable.

## What Changes

- **Initialisation projet Next.js 14** avec TypeScript, Tailwind CSS, et App Router
- **Installation dépendances core** : Prisma ORM, NextAuth, React Query, Zustand, shadcn/ui
- **Configuration base de données** : PostgreSQL (Neon) avec schéma initial et migrations Prisma
- **Système d'authentification** : NextAuth avec JWT tokens, sessions sécurisées, pages login/register
- **Layout dashboard** : Structure de base avec sidebar responsive, header, navigation
- **Déploiement infrastructure** : Configuration Vercel (dev), variables d'environnement, CI/CD basique
- **Protection routes** : Middleware d'authentification pour routes privées

## Capabilities

### New Capabilities

- `project-setup`: Configuration initiale du projet Next.js avec toutes les dépendances requises (TypeScript, Tailwind, shadcn/ui, Prisma, NextAuth, React Query, Zustand)
- `database-infrastructure`: Infrastructure de base de données PostgreSQL avec Prisma ORM, migrations, et tables essentielles pour le multi-tenant (users, stylists, subscription_plans, subscriptions)
- `user-authentication`: Système d'authentification complet avec NextAuth (inscription, connexion, déconnexion, gestion sessions JWT, protection routes)
- `dashboard-layout`: Layout de base du dashboard styliste avec navigation responsive, sidebar, header, thème clair (dark mode non inclus dans MVP)

### Modified Capabilities

<!-- Aucune modification - c'est le premier sprint -->

## Impact

**Nouveaux fichiers créés** :
- Configuration projet : `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.js`
- Prisma : `prisma/schema.prisma`, migrations initiales
- NextAuth : `app/api/auth/[...nextauth]/route.ts`, `lib/auth.ts`
- Pages auth : `app/login/page.tsx`, `app/register/page.tsx`
- Layout : `app/dashboard/layout.tsx`, composants sidebar/header/navigation
- Middleware : `middleware.ts` (protection routes)
- Composants UI : Installation shadcn/ui components (button, input, form, card, etc.)

**Infrastructure** :
- Base de données PostgreSQL sur Neon (instance dev)
- Déploiement Vercel (environnement dev)
- Variables d'environnement : `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

**Dépendances NPM** :
- Core : `next`, `react`, `typescript`, `tailwindcss`
- Database : `prisma`, `@prisma/client`
- Auth : `next-auth`, `@auth/prisma-adapter`
- State : `zustand`, `@tanstack/react-query`
- Validation : `zod`, `react-hook-form`, `@hookform/resolvers`
- UI : `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`
- shadcn/ui components

**Systèmes affectés** :
- Aucun système existant (première implémentation)
- Création de l'architecture multi-tenant de base avec `stylist_id` FK
- Établissement des patterns de sécurité (RLS, validation, HTTPS only)

**Performance** :
- Configuration optimisation images Next.js
- Setup caching basique
- Mobile-first responsive design (375px → 768px → 1024px)
