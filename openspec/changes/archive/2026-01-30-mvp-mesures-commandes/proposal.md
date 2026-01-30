## Why

Les stylistes béninois et africains ont besoin de gérer les mesures corporelles de leurs clients et de suivre l'état d'avancement de leurs commandes. Actuellement, ces informations sont gérées manuellement (cahiers, notes papier) ce qui entraîne des pertes de données, des retards de livraison et une mauvaise organisation. Ce change complète le CRM client en ajoutant la gestion des mesures et le cycle de vie complet des commandes, permettant aux stylistes de professionnaliser leur activité.

## What Changes

- Ajout de la fonctionnalité de gestion des mesures corporelles des clients
- Ajout de l'historique des mesures (évolution dans le temps)
- Ajout de la gestion complète du cycle de vie des commandes (création, statuts, suivi)
- Ajout des statuts de commande : En cours, Prêt, Livré
- Ajout de la liaison automatique commande ↔ client ↔ mesures
- Ajout du tableau de bord avec vue d'ensemble des commandes par statut
- Amélioration du CRM client avec affichage des mesures et commandes associées

## Capabilities

### New Capabilities

- `body-measurements`: Gestion des mesures corporelles des clients (enregistrement, historique, mise à jour, types de mesures standards et personnalisées)
- `order-management`: Gestion du cycle de vie des commandes (création, modification, suivi des statuts, liaison avec client et mesures, calcul des prix)

### Modified Capabilities

- `client-crm`: Ajout de l'affichage des mesures et commandes associées à chaque client dans les vues de détail

## Impact

- **Frontend** : Nouvelles pages et composants UI
  - Page de gestion des mesures d'un client
  - Formulaire de prise de mesures (standards + personnalisées)
  - Page de création/modification de commande
  - Page de détail de commande
  - Liste des commandes avec filtres par statut
  - Tableau de bord des commandes (dashboard)
  - Mise à jour de la page détail client (affichage mesures + commandes)

- **Backend** : Nouvelles API routes et endpoints
  - API CRUD mesures (création, récupération, modification, historique)
  - API CRUD commandes (création, récupération, modification, suppression)
  - API de changement de statut de commande
  - API de statistiques commandes (par statut, chiffre d'affaires)
  - Mise à jour API clients pour inclure mesures et commandes

- **Base de données** : Nouveaux schémas et tables
  - Table `measurements` (mesures corporelles avec historique)
  - Table `measurement_types` (types de mesures standards)
  - Table `orders` (commandes avec statuts et workflow)
  - Relations : client → measurements, client → orders, order → measurements
  - Index de performance (client_id, order_status, created_at)

- **Dépendances** :
  - Réutilisation des capabilities existantes : `client-crm`, `styliste-profile`
  - Drizzle ORM (requêtes type-safe)
  - Zod (validation des données)
  - RLS PostgreSQL (isolation multi-tenant)
