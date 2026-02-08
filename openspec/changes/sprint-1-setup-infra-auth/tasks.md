## 1. Initial Project Setup

- [x] 1.1 Créer nouveau projet Next.js avec create-next-app (TypeScript, Tailwind, App Router, src-dir)
- [x] 1.2 Configurer TypeScript strict mode dans tsconfig.json
- [x] 1.3 Installer dépendances database (prisma, @prisma/client)
- [x] 1.4 Installer dépendances authentication (next-auth, @auth/prisma-adapter, bcrypt, @types/bcrypt)
- [x] 1.5 Installer dépendances state management (zustand, @tanstack/react-query)
- [x] 1.6 Installer dépendances validation (zod, react-hook-form, @hookform/resolvers)
- [x] 1.7 Installer dépendances UI (lucide-react, class-variance-authority, clsx, tailwind-merge)
- [x] 1.8 Configurer .gitignore pour exclure .env.local et .env
- [x] 1.9 Créer fichier .env.example avec toutes les variables documentées

## 2. shadcn/ui Configuration

- [x] 2.1 Initialiser shadcn/ui avec npx shadcn-ui@latest init
- [x] 2.2 Installer composant button
- [x] 2.3 Installer composants input et label
- [x] 2.4 Installer composant form
- [x] 2.5 Installer composant card
- [x] 2.6 Installer composants dropdown-menu et avatar
- [x] 2.7 Installer composant separator
- [x] 2.8 Installer composants dialog, alert, et toast

## 3. Project Structure Creation

- [x] 3.1 Créer structure dossiers: app/(auth)/, app/dashboard/, app/api/
- [x] 3.2 Créer structure dossiers: components/ui/, components/layout/, components/forms/
- [x] 3.3 Créer structure dossiers: lib/, hooks/, stores/, types/, styles/
- [x] 3.4 Configurer alias imports dans tsconfig.json (@/*)

## 4. Tailwind CSS Configuration

- [x] 4.1 Configurer breakpoints mobile-first dans tailwind.config.ts
- [x] 4.2 Configurer content paths pour app et components
- [x] 4.3 Ajouter custom colors du design system si nécessaire
- [x] 4.4 Configurer theme extend pour shadcn/ui

## 5. Next.js Configuration

- [x] 5.1 Activer reactStrictMode dans next.config.js
- [x] 5.2 Configurer optimisation images (formats modernes, WebP)
- [x] 5.3 Configurer experimental features si nécessaire

## 6. Database Setup - Neon PostgreSQL

- [x] 6.1 Créer compte Neon.tech
- [x] 6.2 Créer projet "styliste-dev" sur Neon
- [x] 6.3 Copier DATABASE_URL dans .env.local
- [x] 6.4 Initialiser Prisma avec npx prisma init
- [x] 6.5 Configurer datasource PostgreSQL dans prisma/schema.prisma
- [x] 6.6 Configurer generator client Prisma

## 7. Database Schema - Core Tables

- [x] 7.1 Définir modèle User dans schema.prisma (id UUID, email unique, password, name, role, timestamps, deleted_at)
- [x] 7.2 Définir modèle Stylist dans schema.prisma (id UUID, user_id FK, business_name, phone, city, address, timestamps, deleted_at)
- [x] 7.3 Définir modèle SubscriptionPlan dans schema.prisma (id UUID, name, price, features JSON, limits JSON, is_active, timestamps)
- [x] 7.4 Définir modèle Subscription dans schema.prisma (id UUID, stylist_id FK, plan_id FK, status, period dates, timestamps)
- [x] 7.5 Ajouter indexes: user.email, subscription.stylist_id
- [x] 7.6 Configurer @default(uuid()) sur tous les id
- [x] 7.7 Configurer @updatedAt sur tous les updated_at

## 8. Database Schema - NextAuth Tables

- [x] 8.1 Définir modèle Session dans schema.prisma (id UUID, session_token unique, user_id FK, expires, timestamps)
- [x] 8.2 Définir modèle VerificationToken dans schema.prisma (identifier, token unique, expires)
- [x] 8.3 Définir modèle Account dans schema.prisma (pour OAuth futur)
- [x] 8.4 Ajouter relations User → Session
- [x] 8.5 Ajouter index sur session.session_token

## 9. Database Migration & Client

- [x] 9.1 Exécuter première migration: npx prisma migrate dev --name init
- [x] 9.2 Générer Prisma client: npx prisma generate
- [x] 9.3 Créer singleton Prisma client dans lib/prisma.ts
- [x] 9.4 Tester connexion database avec Prisma Studio

## 10. Database Seeding

- [x] 10.1 Créer fichier prisma/seed.ts
- [x] 10.2 Créer script seed pour 3 subscription plans (Découverte, Standard, Pro)
- [x] 10.3 Créer script seed pour 1 admin user de test
- [x] 10.4 Configurer script "prisma.seed" dans package.json
- [x] 10.5 Exécuter seed: npx prisma db seed
- [x] 10.6 Vérifier données dans Prisma Studio

## 11. NextAuth Configuration

- [x] 11.1 Générer NEXTAUTH_SECRET avec openssl rand -base64 32
- [x] 11.2 Créer fichier lib/auth.ts avec configuration NextAuth
- [x] 11.3 Configurer PrismaAdapter dans lib/auth.ts
- [x] 11.4 Configurer JWT strategy
- [x] 11.5 Configurer CredentialsProvider pour email/password
- [x] 11.6 Implémenter authorize() avec bcrypt password verification
- [x] 11.7 Configurer session callback pour inclure user.id, user.role, user.stylistId
- [x] 11.8 Configurer jwt callback pour persister données custom
- [x] 11.9 Configurer pages custom: signIn: "/login"

## 12. NextAuth API Route

- [x] 12.1 Créer fichier app/api/auth/[...nextauth]/route.ts
- [x] 12.2 Importer handlers GET et POST depuis lib/auth.ts
- [x] 12.3 Exporter handlers avec named exports

## 13. Authentication - Validation Schemas

- [x] 13.1 Créer fichier lib/validations.ts
- [x] 13.2 Définir loginSchema Zod (email email(), password min(8))
- [x] 13.3 Définir registerSchema Zod (email, password, name, confirmPassword)
- [x] 13.4 Exporter types inférés: LoginFormData, RegisterFormData

## 14. Authentication - Registration Page

- [x] 14.1 Créer fichier app/(auth)/register/page.tsx
- [x] 14.2 Créer composant formulaire avec react-hook-form + Zod resolver
- [x] 14.3 Implémenter champs: email (input), password (input type password), name, confirmPassword
- [x] 14.4 Implémenter validation côté client
- [x] 14.5 Créer API route POST /api/auth/register pour création user
- [x] 14.6 Implémenter hash password avec bcrypt (12 rounds)
- [x] 14.7 Implémenter création User + Stylist + Subscription (plan Free)
- [x] 14.8 Implémenter gestion erreur "Email already exists"
- [x] 14.9 Ajouter lien vers page login
- [x] 14.10 Styliser avec shadcn/ui components (Card, Form, Button, Input)

## 15. Authentication - Login Page

- [x] 15.1 Créer fichier app/(auth)/login/page.tsx
- [x] 15.2 Créer composant formulaire avec react-hook-form + Zod resolver
- [x] 15.3 Implémenter champs: email, password
- [x] 15.4 Implémenter appel signIn() NextAuth au submit
- [x] 15.5 Implémenter gestion erreurs "Invalid credentials"
- [x] 15.6 Implémenter redirect vers /dashboard après login réussi
- [x] 15.7 Ajouter lien "Forgot password?" (placeholder pour Phase 2)
- [x] 15.8 Ajouter lien vers page register
- [x] 15.9 Styliser avec shadcn/ui components

## 16. Session Provider Setup

- [x] 16.1 Créer fichier app/providers.tsx
- [x] 16.2 Wrapper SessionProvider NextAuth
- [x] 16.3 Wrapper QueryClientProvider React Query
- [x] 16.4 Importer providers dans app/layout.tsx
- [x] 16.5 Tester useSession() hook dans composant

## 17. Route Protection Middleware

- [x] 17.1 Créer fichier middleware.ts à la racine
- [x] 17.2 Implémenter vérification session avec getToken() NextAuth
- [x] 17.3 Protéger routes /dashboard/* (redirect vers /login si non auth)
- [x] 17.4 Protéger routes /api/* hors /api/auth (return 401 si non auth)
- [x] 17.5 Autoriser routes publiques: /login, /register, /api/auth/*
- [x] 17.6 Configurer matcher dans middleware config
- [x] 17.7 Tester redirection avec user non authentifié

## 18. Dashboard Layout - Structure

- [x] 18.1 Créer fichier app/dashboard/layout.tsx
- [x] 18.2 Implémenter structure: Sidebar + (Header + Main content)
- [x] 18.3 Assurer que layout persiste lors navigation (pas de re-render)
- [x] 18.4 Styliser avec Flexbox/Grid responsive

## 19. Dashboard Layout - Sidebar Component

- [x] 19.1 Créer fichier components/layout/Sidebar.tsx
- [x] 19.2 Créer fichier components/layout/Navigation.tsx avec config routes
- [x] 19.3 Définir navigation items: Dashboard, Clients (disabled), Commandes (disabled), Calendrier (disabled), Paramètres (disabled)
- [x] 19.4 Importer icônes Lucide: LayoutDashboard, Users, ShoppingBag, Calendar, Settings
- [x] 19.5 Implémenter highlight active route avec usePathname()
- [x] 19.6 Ajouter logo/brand "Styliste.com" en haut
- [x] 19.7 Styliser avec Tailwind (width 280px desktop)

## 20. Dashboard Layout - Sidebar Responsive

- [x] 20.1 Créer Zustand store pour sidebar state (isOpen)
- [x] 20.2 Implémenter sidebar drawer sur mobile (< 768px)
- [x] 20.3 Implémenter overlay semi-transparent quand drawer ouvert
- [x] 20.4 Implémenter fermeture drawer au clic sur overlay
- [x] 20.5 Implémenter fermeture drawer après clic navigation sur mobile
- [x] 20.6 Sidebar toujours visible sur desktop (≥ 768px)
- [x] 20.7 Tester responsive sur 375px, 768px, 1024px

## 21. Dashboard Layout - Header Component

- [x] 21.1 Créer fichier components/layout/Header.tsx
- [x] 21.2 Implémenter bouton menu hamburger (mobile only) pour toggle sidebar
- [x] 21.3 Implémenter user avatar avec shadcn/ui Avatar component
- [x] 21.4 Implémenter affichage initiales user dans avatar
- [x] 21.5 Implémenter dropdown menu user (shadcn/ui DropdownMenu)
- [x] 21.6 Ajouter items menu: Mon profil, Abonnement, Se déconnecter
- [x] 21.7 Implémenter action logout avec signOut() NextAuth
- [x] 21.8 Styliser header (height 64px, full width)

## 22. Dashboard Layout - Home Page

- [x] 22.1 Créer fichier app/dashboard/page.tsx
- [x] 22.2 Fetch données user avec useSession()
- [x] 22.3 Afficher message bienvenue avec nom user
- [x] 22.4 Afficher info user: email, rôle
- [x] 22.5 Afficher placeholder pour futures statistiques (Sprint 4)
- [x] 22.6 Styliser avec Card component

## 23. Dashboard Layout - Accessibility

- [x] 23.1 Utiliser élément semantic <nav> pour navigation
- [x] 23.2 Ajouter aria-label sur navigation items
- [x] 23.3 Tester navigation clavier (Tab, Enter, Space)
- [x] 23.4 Ajouter focus visible (ring-2) sur items
- [x] 23.5 Tester avec screen reader (optionnel)

## 24. Dashboard Layout - Touch Targets

- [x] 24.1 Assurer navigation items height ≥ 44px
- [x] 24.2 Assurer user menu button size ≥ 44x44px
- [x] 24.3 Assurer menu hamburger button size ≥ 44x44px

## 25. Dashboard Layout - Error Boundary

- [x] 25.1 Créer fichier components/ErrorBoundary.tsx
- [x] 25.2 Implémenter componentDidCatch et getDerivedStateFromError
- [x] 25.3 Afficher UI d'erreur user-friendly
- [x] 25.4 Logger erreur dans console (dev) et Sentry (futur)
- [x] 25.5 Wrapper dashboard layout avec ErrorBoundary

## 26. Dashboard Layout - Performance

- [x] 26.1 Memoizer Sidebar et Header avec React.memo()
- [x] 26.2 Importer icônes Lucide individuellement (tree-shaking)
- [x] 26.3 Utiliser transform simple pour animation drawer (pas de heavy effects)

## 27. Vercel Deployment Setup

- [ ] 27.1 Créer compte Vercel si pas déjà fait
- [ ] 27.2 Connecter repository GitHub à Vercel
- [ ] 27.3 Configurer auto-deploy sur push
- [ ] 27.4 Configurer environment variables Vercel: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
- [ ] 27.5 Déclencher premier déploiement
- [ ] 27.6 Vérifier build success
- [ ] 27.7 Tester app déployée sur URL Vercel

## 28. Environment Variables Configuration

- [ ] 28.1 Vérifier DATABASE_URL pointe vers Neon production/dev
- [ ] 28.2 Vérifier NEXTAUTH_URL pointe vers URL Vercel déployée
- [ ] 28.3 Vérifier NEXTAUTH_SECRET est unique et sécurisé (32+ chars)
- [ ] 28.4 Vérifier tous secrets sont dans Vercel dashboard (encrypted)

## 29. Security Configuration

- [ ] 29.1 Vérifier CSRF protection activée (NextAuth default)
- [ ] 29.2 Vérifier cookies Secure flag en production (HTTPS)
- [ ] 29.3 Vérifier cookies SameSite=Lax
- [ ] 29.4 Vérifier .env.local dans .gitignore (pas de commit secrets)
- [ ] 29.5 Implémenter rate limiting basique sur /api/auth/* (in-memory Map pour MVP)

## 30. Testing - Authentication Flow

- [ ] 30.1 Tester inscription nouveau user (happy path)
- [ ] 30.2 Tester inscription avec email existant (erreur)
- [ ] 30.3 Tester login avec credentials valides (redirect dashboard)
- [ ] 30.4 Tester login avec email invalide (erreur)
- [ ] 30.5 Tester login avec password incorrect (erreur)
- [ ] 30.6 Tester logout (redirect login)
- [ ] 30.7 Tester session persistence (refresh page reste connecté)
- [ ] 30.8 Tester session expiration après 7 jours

## 31. Testing - Route Protection

- [ ] 31.1 Tester accès /dashboard sans auth (redirect login)
- [ ] 31.2 Tester accès /dashboard avec auth (accès autorisé)
- [ ] 31.3 Tester accès /api/* sans auth (401 Unauthorized)
- [ ] 31.4 Tester accès /login et /register sans auth (autorisé)

## 32. Testing - Dashboard UI

- [ ] 32.1 Tester sidebar navigation sur desktop
- [ ] 32.2 Tester sidebar drawer sur mobile (ouverture/fermeture)
- [ ] 32.3 Tester user menu dropdown
- [ ] 32.4 Tester logout depuis user menu
- [ ] 32.5 Tester navigation clavier
- [ ] 32.6 Tester touch targets sur mobile (facilement cliquables)

## 33. Testing - Responsive Design

- [ ] 33.1 Tester sur mobile 375px (iPhone SE)
- [ ] 33.2 Tester sur tablet 768px
- [ ] 33.3 Tester sur desktop 1024px et 1440px
- [ ] 33.4 Tester orientation portrait et paysage mobile

## 34. Testing - Database

- [ ] 34.1 Vérifier User créé avec password hashé
- [ ] 34.2 Vérifier Stylist créé et lié au User
- [ ] 34.3 Vérifier Subscription créée avec plan Free
- [ ] 34.4 Vérifier Session créée au login
- [ ] 34.5 Vérifier Session supprimée au logout
- [ ] 34.6 Ouvrir Prisma Studio et inspecter données

## 35. Performance Testing

- [ ] 35.1 Exécuter Lighthouse audit desktop (target > 90)
- [ ] 35.2 Exécuter Lighthouse audit mobile (target > 85)
- [ ] 35.3 Vérifier First Contentful Paint < 2s
- [ ] 35.4 Vérifier Time to Interactive < 3s
- [ ] 35.5 Vérifier pas d'erreurs console
- [ ] 35.6 Tester sur connexion throttled 3G (Chrome DevTools)

## 36. Documentation

- [ ] 36.1 Mettre à jour README.md avec instructions setup
- [ ] 36.2 Documenter variables d'environnement requises
- [ ] 36.3 Documenter commandes npm utiles (dev, build, prisma migrate, etc.)
- [ ] 36.4 Documenter flow d'authentification
- [ ] 36.5 Ajouter screenshots dashboard dans README (optionnel)

## 37. Code Quality

- [ ] 37.1 Exécuter npm run lint et corriger warnings
- [ ] 37.2 Exécuter npm run type-check et corriger erreurs TypeScript
- [ ] 37.3 Formater code avec Prettier (optionnel)
- [ ] 37.4 Review code pour patterns anti-patterns

## 38. Git & Version Control

- [ ] 38.1 Commit initial avec message "feat: initial project setup"
- [ ] 38.2 Commit database schema "feat: add database schema and migrations"
- [ ] 38.3 Commit authentication "feat: add authentication with NextAuth"
- [ ] 38.4 Commit dashboard layout "feat: add dashboard layout with sidebar and header"
- [ ] 38.5 Commit deployment "chore: configure Vercel deployment"
- [ ] 38.6 Push vers GitHub
- [ ] 38.7 Créer tag v0.1.0-sprint-1

## 39. Sprint 1 Completion Validation

- [ ] 39.1 ✅ npm run dev fonctionne sans erreurs
- [ ] 39.2 ✅ User peut s'inscrire, se connecter, voir dashboard
- [ ] 39.3 ✅ Middleware redirige vers login si non authentifié
- [ ] 39.4 ✅ Database Neon contient tables avec seed data
- [ ] 39.5 ✅ Déploiement Vercel accessible publiquement
- [ ] 39.6 ✅ Lighthouse score desktop > 85, mobile > 80
- [ ] 39.7 ✅ Toutes les 4 capabilities sont implémentées (project-setup, database-infrastructure, user-authentication, dashboard-layout)
