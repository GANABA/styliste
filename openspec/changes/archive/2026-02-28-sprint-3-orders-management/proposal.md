## Why

Les tailleurs ont besoin de gérer leurs commandes de bout en bout : de la prise de devis à la livraison. Sans ce module, le cœur métier de Styliste.com est absent — les clients et mesures du Sprint 2 n'ont de sens que rattachés à des commandes. C'est le module qui génère la valeur principale pour les stylistes.

## What Changes

- Ajout du modèle Prisma `Order` avec statuts, prix, tissu, dates, et items multiples
- Ajout du modèle Prisma `OrderPhoto` (4 types : référence, tissu, essayage, fini)
- Ajout du modèle Prisma `OrderHistory` (audit trail des modifications)
- Nouvelles API routes : `/api/orders`, `/api/orders/[id]`, `/api/orders/[id]/photos`, `/api/orders/[id]/history`, `/api/orders/[id]/status`
- Nouvelles pages UI : liste commandes, détail, création, édition
- Génération automatique du numéro de commande (format `ORD-2026-XXXX` par styliste)
- Règle métier : maximum 15 commandes actives simultanées par styliste
- Upload de photos vers Cloudflare R2 (ou stockage local en dev)
- Workflow de statuts avec règles de transition (pas de retour arrière vers Devis)
- Historique complet de toutes les modifications

## Capabilities

### New Capabilities
- `order-management`: CRUD complet des commandes — création, liste avec filtres par statut, détail, modification, suppression soft. Inclut la génération du numéro de commande, la gestion du tissu, les items multiples (ensembles), et la limite de 15 commandes actives.
- `order-status-workflow`: Gestion des transitions de statut (`quote` → `in_progress` → `ready` → `delivered` | `canceled`). Règles de transition, logging automatique dans l'historique, impossibilité de revenir en arrière.
- `order-photo-upload`: Upload, affichage et suppression de photos liées à une commande (4 types). Optimisation des images, génération de thumbnails, stockage sur Cloudflare R2.

### Modified Capabilities
<!-- Aucune capability existante n'a ses requirements modifiés -->

## Impact

- **Prisma schema** : Ajout de 3 nouveaux modèles (`Order`, `OrderPhoto`, `OrderHistory`) + migration BDD
- **API routes** : 5 nouveaux endpoints REST (orders CRUD, photos, history, status)
- **Pages** : 4 nouvelles pages sous `/dashboard/orders/`
- **Composants** : `OrdersList`, `OrderForm`, `OrderStatusBadge`, `OrderTimeline`, `PhotoUploader`
- **Dépendances** : Cloudflare R2 (stockage photos) + `@aws-sdk/client-s3` (compatible R2) + `sharp` (optimisation images)
- **Modèles liés** : `Client` (FK), `Stylist` (FK, limite commandes)
- **Pas de breaking changes** sur les modules existants (clients, mesures, auth)
