## Why

Les stylistes ont besoin d'un système pour créer, suivre et gérer le cycle de vie complet de leurs commandes de vêtements sur mesure. Actuellement, la plateforme permet de gérer les clients et leurs mesures, mais il manque la fonctionnalité centrale du métier : la gestion des commandes avec suivi du statut, lien avec les mesures client, et intégration au tableau de bord pour une vision d'ensemble de l'activité.

## What Changes

- **Gestion complète du cycle de vie des commandes** : Création de commandes liées aux clients avec snapshot des mesures, gestion du workflow de statut (pending → ready → delivered), modification et suppression soft delete
- **Numérotation unique automatique** : Génération de numéros de commande au format STY-{YYYY}{MM}-{NNNN} pour traçabilité et professionnalisme
- **Recherche et filtrage avancés** : Filtrage par statut, recherche par numéro de commande, client ou type de vêtement pour retrouver rapidement les commandes
- **Tableau de bord avec statistiques** : Compteurs par statut (en cours, prêt, livré), commandes à livrer cette semaine, chiffre d'affaires mensuel
- **Intégration client enrichie** : Affichage des commandes du client sur sa page de détail avec accès rapide à la création
- **Types de vêtements standards** : Liste pré-définie (Robe, Costume, Boubou, Chemise, Pantalon, etc.) avec option personnalisée

## Capabilities

### New Capabilities
- `order-management`: Gestion complète des commandes de vêtements sur mesure incluant création, modification, workflow de statut, snapshot des mesures, recherche/filtrage, et statistiques dashboard

### Modified Capabilities
- `client-crm`: Ajout de l'affichage des commandes sur la page de détail du client avec bouton d'accès rapide "Nouvelle commande"

## Impact

**Base de données :**
- Table `orders` déjà créée avec schéma complet (snapshots JSONB, soft delete, RLS)
- Scripts RLS et indexes pour orders à appliquer

**Backend (7 nouveaux endpoints) :**
- POST `/api/orders` - Création commande avec génération numéro et snapshot mesures
- GET `/api/orders` - Liste avec filtres par statut
- GET `/api/orders/[id]` - Détails commande
- PATCH `/api/orders/[id]` - Modification commande
- PATCH `/api/orders/[id]/status` - Changement de statut
- DELETE `/api/orders/[id]` - Suppression soft delete
- GET `/api/orders/stats` - Statistiques pour dashboard

**Frontend :**
- 7 nouveaux composants UI (formulaire, cartes, badges, sélecteurs, filtres)
- 4 nouvelles pages (liste, détails, création, modification)
- Dashboard enrichi avec widgets statistiques
- Page client modifiée pour affichage commandes

**Validation et helpers :**
- Schémas Zod pour commandes et types de vêtements
- Helper génération numéro de commande
- Helpers validation workflow de statut
- Helpers formatage devise XOF
- Helpers calcul dates (semaine/mois en cours)

**Dépendances :**
- Aucune nouvelle dépendance requise (utilise stack existante)
