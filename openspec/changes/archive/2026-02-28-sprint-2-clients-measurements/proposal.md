## Why

Le module de gestion des clients est le cœur métier de Styliste.com et la première fonctionnalité utilisée après l'inscription. Les stylistes doivent pouvoir enregistrer leurs clients avec un système de mesures flexible et versionné pour remplacer les cahiers papier et carnets désorganisés. Sans ce module, l'application n'a aucune valeur métier. C'est le Sprint 2 car il s'appuie sur l'infrastructure d'authentification du Sprint 1 et débloque les modules commandes (Sprint 3) et paiements (Sprint 4).

## What Changes

- Nouvelle table `clients` avec isolation multi-tenant par `stylist_id` (nom, téléphone, email optionnel, adresse, notes, soft delete)
- Nouvelle table `measurement_templates` pour templates de mesures customisables par styliste (colonnes JSON paramétrables)
- Nouvelle table `client_measurements` avec versioning automatique des mesures (historique complet avec dates)
- CRUD complet clients : création, lecture, modification, suppression (soft delete)
- Interface de gestion des templates de mesures (créer/modifier des templates : homme, femme, enfant, etc.)
- Interface de saisie et historique des mesures par client avec affichage des versions précédentes
- Recherche clients par nom, téléphone avec filtres actifs/archivés
- API routes sécurisées : `/api/clients/*`, `/api/measurement-templates/*`, `/api/client-measurements/*`
- Migration Prisma pour les 3 nouvelles tables avec relations et indexes
- Intégration au dashboard : activation du menu "Clients" dans la sidebar
- Validation des limites du plan d'abonnement (nombre max de clients selon plan Free/Standard/Pro)
- **BREAKING** : Modification du schéma Prisma avec ajout de 3 nouvelles tables et relations

## Capabilities

### New Capabilities
- `client-management`: Gestion complète du cycle de vie des clients (CRUD, recherche, filtres, soft delete) avec isolation multi-tenant
- `measurement-system`: Système de templates de mesures customisables et versioning automatique de l'historique des mesures client

### Modified Capabilities
- `database-infrastructure`: Ajout de 3 nouvelles tables (`clients`, `measurement_templates`, `client_measurements`) au schéma Prisma existant avec foreign keys et indexes

## Impact

**Code affecté** :
- `prisma/schema.prisma` : Ajout de 3 modèles avec relations vers `stylists`
- `src/app/dashboard/clients/*` : Nouvelles pages et composants clients
- `src/app/api/clients/*` : Nouvelles API routes pour CRUD clients
- `src/app/api/measurement-templates/*` : API routes pour templates
- `src/app/api/client-measurements/*` : API routes pour mesures
- `src/components/layout/Sidebar.tsx` : Activation du menu "Clients"

**APIs créées** :
- `POST /api/clients` : Créer un client
- `GET /api/clients` : Liste des clients (avec pagination et recherche)
- `GET /api/clients/[id]` : Détails d'un client
- `PUT /api/clients/[id]` : Modifier un client
- `DELETE /api/clients/[id]` : Soft delete d'un client
- `GET /api/measurement-templates` : Liste des templates du styliste
- `POST /api/measurement-templates` : Créer un template
- `PUT /api/measurement-templates/[id]` : Modifier un template
- `POST /api/client-measurements` : Enregistrer nouvelles mesures
- `GET /api/client-measurements/[clientId]` : Historique des mesures

**Base de données** :
- Migration Prisma avec 3 nouvelles tables
- Indexes sur `stylist_id`, `client_id`, `template_id` pour performance
- Contraintes de foreign keys avec cascade delete

**Dépendances** :
- Aucune nouvelle dépendance requise (utilise stack existante : Prisma, React Hook Form, Zod, shadcn/ui)

**Systèmes affectés** :
- Système d'abonnement : validation des limites clients par plan (Free: 20, Standard: 100, Pro: illimité)
- Dashboard navigation : ajout de la route `/dashboard/clients`
