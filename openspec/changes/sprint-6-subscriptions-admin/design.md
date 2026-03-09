## Context

Les Sprints 1-5 ont livré un MVP fonctionnel (auth, clients, commandes, paiements, portfolio, notifications). Cependant :
- Les limites de plan (clients, commandes, photos) sont partiellement vérifiées côté API mais sans cohérence UI
- Il n'existe aucun espace d'administration pour superviser la plateforme
- Les nouveaux utilisateurs n'ont aucun guidage après inscription
- Le modèle `User` n'a pas de champ `role`, rendant impossible la distinction admin/utilisateur

Le Sprint 6 finalise le MVP sans intégrer de paiement réel (FedaPay est reporté en V1 post-lancement pilote).

## Goals / Non-Goals

**Goals:**
- Page de gestion d'abonnement (plan actuel, usage, comparaison, simulation upgrade/downgrade)
- Enforcement cohérent des limites de plan dans l'UI avec messages d'erreur clairs
- Espace `/admin` protégé par rôle avec layout séparé
- Dashboard admin : stats globales, liste stylistes, actions modération, logs d'audit
- Wizard d'onboarding au premier login + checklist 4 étapes
- Page FAQ/aide contextuelle

**Non-Goals:**
- Intégration paiement réel FedaPay (V1 post-pilote)
- Achat de crédits SMS (V1)
- 2FA obligatoire pour admins (V1 — risque sécurité acceptable pour MVP interne)
- Notifications automatiques de renouvellement (V1)
- Suspension automatique pour impayés (V1)

## Decisions

### 1. Rôle utilisateur dans le modèle User (pas table séparée)

**Choix** : Ajouter `role String @default("USER")` directement sur `User` (valeurs : `USER`, `ADMIN`).

**Rationale** : MVP mono-tenant côté admin. Une table `roles` séparée serait over-engineering pour 1-2 admins. Le rôle est exposé dans la session NextAuth via `session.user.role`.

**Alternative écartée** : Table `admin_users` séparée → doublon de gestion d'authentification.

### 2. Abonnement sans paiement réel — changement de plan direct

**Choix** : L'upgrade/downgrade met à jour directement `subscription.planId` en base sans webhook de paiement. Un bouton "Simuler l'upgrade" suffit pour le MVP.

**Rationale** : Les 10 pilotes auront leur plan configuré manuellement par l'admin. L'intégration FedaPay sera ajoutée en V1 quand les paiements seront ouverts.

**Alternative écartée** : Intégrer FedaPay sandbox dès maintenant → complexité inutile, délai.

### 3. Protection admin via middleware Next.js

**Choix** : Étendre `middleware.ts` pour intercepter toutes les requêtes vers `/admin/*` et `/api/admin/*`. Rediriger vers `/dashboard` si `session.user.role !== 'ADMIN'`.

**Rationale** : Centralise la sécurité en un seul point. Évite de dupliquer les vérifications dans chaque route API admin.

### 4. AuditLog pour actions sensibles admin

**Choix** : Nouveau modèle Prisma `AuditLog` (adminId, action, targetType, targetId, metadata JSON, createdAt). Créé lors de : suspension styliste, changement de plan, réactivation.

**Rationale** : Traçabilité nécessaire pour un MVP SaaS gérant des comptes payants. Coût faible (INSERT simple).

### 5. État onboarding dans le modèle Stylist

**Choix** : Ajouter `onboardingCompleted Boolean @default(false)` sur `Stylist`. Le wizard s'affiche si `!onboardingCompleted`. L'état est mis à jour via PATCH `/api/stylists/me/onboarding`.

**Alternative écartée** : Cookie client → perdu si changement d'appareil. localStorage → même problème.

### 6. Enforcement des limites — centralisation dans `lib/subscription.ts`

**Choix** : Toutes les vérifications de limite passent par `checkClientLimit()`, `checkOrderLimit()`, `checkPortfolioLimit()` dans `src/lib/helpers/subscription.ts` (déjà partiellement implémenté pour les clients). Étendre pour couvrir commandes et portfolio.

**Rationale** : Éviter la dispersion des règles métier dans chaque route API.

## Risks / Trade-offs

- **[Risque] Escalade de privilèges** : Un utilisateur pourrait tenter d'accéder à `/api/admin/*` directement. → Mitigation : double vérification dans le middleware ET dans chaque route API admin (`session.user.role !== 'ADMIN'` → 403).

- **[Trade-off] Simulation d'abonnement** : Sans paiement réel, un styliste pourrait demander à l'admin de lui changer de plan sans payer. → Acceptable pour la phase pilote (10 stylistes connus personnellement).

- **[Risque] Migration schema** : Ajout de `role` sur User et `onboardingCompleted` sur Stylist nécessite une migration Prisma. Les données existantes reçoivent les valeurs par défaut (`USER`, `false`). → Mitigation : migration non-destructive, rollback trivial.

## Migration Plan

1. Ajouter `role` sur `User` + `onboardingCompleted` sur `Stylist` + modèle `AuditLog` dans `prisma/schema.prisma`
2. `npx prisma migrate dev --name sprint6-subscriptions-admin`
3. Passer `role: "ADMIN"` manuellement via Prisma Studio pour le compte admin de test
4. Étendre `middleware.ts` pour protéger `/admin/*`
5. Déployer sur Vercel : `npx prisma migrate deploy` avant le démarrage de l'app

## Open Questions

- Quel email/compte sera l'admin initial pour le pilote ? (à configurer via seed ou Prisma Studio)
- Le downgrade doit-il être bloqué si l'usage dépasse les limites du nouveau plan, ou juste averti ? → Par cohérence avec la décision #21 de DECISIONS.md : **bloqué** (doit nettoyer d'abord).
