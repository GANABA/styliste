## 1. Schema Prisma & Migration

- [x] 1.1 Ajouter enum `Role` (USER, ADMIN) et champ `role Role @default(USER)` sur le modèle `User` dans `prisma/schema.prisma`
- [x] 1.2 Ajouter champ `suspended Boolean @default(false)` sur le modèle `User`
- [x] 1.3 Ajouter champ `onboardingCompleted Boolean @default(false)` sur le modèle `Stylist`
- [x] 1.4 Créer modèle `AuditLog` (id, adminId, action, targetType, targetId, metadata Json?, createdAt)
- [x] 1.5 Exécuter `npx prisma migrate dev --name sprint6-subscriptions-admin`
- [x] 1.6 Mettre à jour `src/lib/auth.ts` pour inclure `role` et `suspended` dans la session NextAuth (callbacks `jwt` et `session`)
- [x] 1.7 Mettre à jour `src/types/next-auth.d.ts` pour étendre le type `Session` avec `role` et `suspended`

## 2. Middleware & Sécurité Admin

- [x] 2.1 Étendre `middleware.ts` pour protéger `/admin/*` et `/api/admin/*` : rediriger vers `/dashboard` si `role !== 'ADMIN'`
- [x] 2.2 Ajouter blocage de connexion dans le callback `authorize` de NextAuth si `user.suspended === true` (message : "Votre compte est suspendu")

## 3. API Abonnements

- [x] 3.1 Créer `src/app/api/subscriptions/current/route.ts` — `GET` : retourne le plan actuel + usage (clients, commandes actives, photos portfolio)
- [x] 3.2 Créer `src/app/api/subscriptions/plans/route.ts` — `GET` : retourne la liste des plans avec limites et prix
- [x] 3.3 Créer `src/app/api/subscriptions/upgrade/route.ts` — `POST` : met à jour le plan du styliste (validation : plan supérieur au plan actuel)
- [x] 3.4 Créer `src/app/api/subscriptions/downgrade/route.ts` — `POST` : met à jour le plan (validation : usage dans les limites du nouveau plan, sinon 400 avec détail des ressources à réduire)
- [x] 3.5 Étendre `src/lib/helpers/subscription.ts` : ajouter `checkOrderLimit()` et `checkPortfolioLimit()` en plus de `checkClientLimit()` existant
- [x] 3.6 Appeler `checkOrderLimit()` dans `POST /api/orders/route.ts` avant la création
- [x] 3.7 Appeler `checkPortfolioLimit()` dans `POST /api/portfolio/route.ts` avant l'upload

## 4. API Admin

- [x] 4.1 Créer `src/app/api/admin/stats/route.ts` — `GET` : stats globales (total stylistes, actifs 7j, répartition plans, total commandes plateforme)
- [x] 4.2 Créer `src/app/api/admin/stylists/route.ts` — `GET` : liste paginée des stylistes avec filtres (plan, statut, recherche nom/email)
- [x] 4.3 Créer `src/app/api/admin/stylists/[id]/route.ts` — `GET` (détail) + `PUT` (modifier plan) avec création AuditLog
- [x] 4.4 Créer `src/app/api/admin/stylists/[id]/suspend/route.ts` — `POST` : basculer suspended true/false + AuditLog
- [x] 4.5 Créer `src/app/api/admin/audit-logs/route.ts` — `GET` : historique des actions admin (paginé)

## 5. API Onboarding

- [x] 5.1 Créer `src/app/api/stylists/me/onboarding/route.ts` — `PATCH` : mettre à jour `onboardingCompleted` du styliste connecté

## 6. Dashboard Abonnements

- [x] 6.1 Créer `src/app/dashboard/subscription/page.tsx` — page principale : plan actuel, jauges d'usage, tableau comparatif des plans
- [x] 6.2 Créer composant `src/components/subscription/SubscriptionPlanCard.tsx` — carte d'un plan (nom, prix, limites, bouton CTA)
- [x] 6.3 Créer composant `src/components/subscription/UsageMeter.tsx` — jauge de progression (utilisé / limite) avec couleur selon %
- [x] 6.4 Créer composant `src/components/subscription/PlanComparison.tsx` — tableau comparatif des 4 plans
- [x] 6.5 Créer composant `src/components/subscription/UpgradeDialog.tsx` — modale de confirmation upgrade/downgrade
- [x] 6.6 Ajouter lien "Abonnement" dans `src/components/layout/Navigation.tsx` (icône `CreditCard`, href `/dashboard/subscription`)

## 7. Dashboard Admin

- [x] 7.1 Créer layout `src/app/admin/layout.tsx` — layout séparé (sidebar admin distincte du dashboard styliste)
- [x] 7.2 Créer `src/app/admin/dashboard/page.tsx` — KPIs globaux plateforme
- [x] 7.3 Créer `src/app/admin/stylists/page.tsx` — liste stylistes avec recherche + filtres + actions
- [x] 7.4 Créer `src/app/admin/stylists/[id]/page.tsx` — fiche styliste admin (détails, changement plan, suspension)
- [x] 7.5 Créer composant `src/components/admin/GlobalStats.tsx` — cartes KPIs admin
- [x] 7.6 Créer composant `src/components/admin/StylistsTable.tsx` — tableau avec actions (changer plan, suspendre)
- [x] 7.7 Créer composant `src/components/admin/SuspendDialog.tsx` — modale confirmation suspension/réactivation

## 8. Onboarding & Aide

- [x] 8.1 Créer `src/app/onboarding/page.tsx` — wizard 4 étapes avec progression visuelle
- [x] 8.2 Créer composant `src/components/onboarding/OnboardingWizard.tsx` — stepper avec état persisté en base
- [x] 8.3 Créer composant `src/components/onboarding/OnboardingChecklist.tsx` — checklist avec étapes cochées automatiquement selon les données du styliste
- [x] 8.4 Modifier `src/app/dashboard/layout.tsx` (ou middleware) pour rediriger vers `/onboarding` si `onboardingCompleted = false` au premier login
- [x] 8.5 Créer `src/app/help/page.tsx` — FAQ catégorisée + lien contact support WhatsApp
- [x] 8.6 Ajouter lien "Aide" dans `src/components/layout/Navigation.tsx` (icône `HelpCircle`, href `/help`)

## 9. Tests Playwright

- [x] 9.1 Tester la page abonnement : affichage plan actuel, jauges d'usage, tableau comparatif
- [x] 9.2 Tester le flow upgrade : clic "Passer à Pro" → modale → confirmation → plan mis à jour
- [x] 9.3 Tester l'enforcement des limites : création client bloquée quand limite atteinte
- [x] 9.4 Tester le dashboard admin : accès `/admin/dashboard` avec compte admin
- [x] 9.5 Tester la suspension d'un styliste depuis l'admin
- [x] 9.6 Tester le wizard d'onboarding : affichage au premier login, complétion des 4 étapes
