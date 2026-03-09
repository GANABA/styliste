## Why

Le MVP est fonctionnel (Sprints 1-5) mais sans système d'abonnement ni administration, il est impossible de gérer les limites de plans, de contrôler l'accès aux fonctionnalités premium ou de superviser la plateforme. Le Sprint 6 finalise le MVP en ajoutant la gestion des abonnements (sans paiement réel), le dashboard administrateur et un onboarding guidé pour maximiser l'activation.

## What Changes

- **Gestion abonnements** : page de gestion du plan actuel avec comparaison des plans, usage en temps réel, simulation upgrade/downgrade (paiement réel en V1)
- **Enforcement des limites** : blocage effectif des actions dépassant les quotas du plan (clients, commandes, photos portfolio) avec messages clairs
- **Dashboard admin** : espace `/admin` séparé avec layout dédié, liste des stylistes, actions de modération (suspension, changement de plan), statistiques globales de la plateforme
- **Middleware admin** : protection de toutes les routes `/admin` par vérification du rôle `ADMIN`
- **Onboarding interactif** : wizard au premier login + checklist gamifiée (4 étapes) pour guider les nouveaux stylistes
- **Page aide** : FAQ contextuelle accessible depuis toutes les pages

## Capabilities

### New Capabilities
- `subscription-management` : Affichage du plan actuel, comparaison des plans, usage (clients/commandes/photos), simulation upgrade/downgrade, API `/api/subscriptions/*`
- `admin-dashboard` : Espace administration protégé par rôle, statistiques globales plateforme, gestion des stylistes (suspension, changement de plan), logs d'audit, API `/api/admin/*`
- `onboarding` : Wizard premier login, checklist setup 4 étapes (profil, client, commande, portfolio), page aide/FAQ

### Modified Capabilities
- `user-authentication` : Ajout du champ `role` (USER/ADMIN) dans la session NextAuth + middleware de protection des routes `/admin`

## Impact

- **Prisma schema** : ajout enum `Role` (USER/ADMIN) sur `User`, ajout modèle `AuditLog` (id, adminId, action, targetId, targetType, metadata, createdAt)
- **Middleware Next.js** : extension de `middleware.ts` pour bloquer `/admin/*` si `role !== ADMIN`
- **API routes** : 6 nouvelles routes `/api/subscriptions/*` + 5 routes `/api/admin/*`
- **Pages** : `/dashboard/subscription`, `/dashboard/subscription/upgrade`, `/admin/dashboard`, `/admin/stylists`, `/admin/stylists/[id]`, `/app/onboarding`, `/help`
- **Dépendances** : aucune nouvelle dépendance externe (réutilisation shadcn/ui existant)
