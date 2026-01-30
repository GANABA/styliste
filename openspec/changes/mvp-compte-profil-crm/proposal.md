## Why

Les stylistes béninois et africains gèrent actuellement leur activité de manière manuelle et désorganisée, sans système centralisé pour leurs clients et informations professionnelles. Ils ont besoin d'un système simple pour créer leur compte, gérer leur profil professionnel et centraliser les fiches de leurs clients privés. Ceci constitue la fondation du MVP permettant aux stylistes de démarrer sur la plateforme.

## What Changes

- Ajout de la fonctionnalité de création de compte styliste avec authentification
- Ajout de la gestion du profil professionnel du styliste (nom du salon, description, contacts, localisation)
- Ajout du CRM local permettant au styliste de créer et gérer des fiches clients privées
- Ajout de l'historique des interactions par client
- Mise en place de l'isolation multi-tenant (chaque styliste voit uniquement ses propres clients)

## Capabilities

### New Capabilities

- `styliste-account`: Création et gestion du compte styliste (authentification, inscription)
- `styliste-profile`: Gestion du profil professionnel du styliste (informations du salon, contacts, localisation)
- `client-crm`: Création et gestion des fiches clients privées du styliste (CRUD clients, isolation multi-tenant)

### Modified Capabilities

<!-- Aucune capability existante à modifier - premier change du projet -->

## Impact

- **Frontend** : Nouvelles pages et composants UI
  - Page d'inscription styliste
  - Page de connexion
  - Page de gestion du profil
  - Interface CRM (liste clients, création/édition fiche client)

- **Backend** : Nouvelles API routes et endpoints
  - API d'authentification (Supabase Auth)
  - API de gestion du profil styliste
  - API CRUD clients avec isolation multi-tenant

- **Base de données** : Nouveaux schémas et tables
  - Table `stylistes` (profil professionnel)
  - Table `clients` (fiches clients avec foreign key vers styliste)
  - Row Level Security (RLS) pour isolation multi-tenant

- **Dépendances** :
  - Supabase Auth (authentification)
  - Drizzle ORM (requêtes type-safe)
  - Zod (validation des données)
