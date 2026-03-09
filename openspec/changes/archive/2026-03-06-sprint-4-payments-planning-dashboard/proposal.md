## Why

Les sprints 1-3 ont mis en place la gestion des clients, mesures et commandes. Le styliste peut créer et suivre ses commandes, mais il ne peut pas encore enregistrer les paiements reçus, visualiser son planning de livraisons, ni consulter des statistiques réelles sur son activité. Ces lacunes empêchent un usage professionnel quotidien complet de la plateforme.

## What Changes

- Nouveau module paiements : enregistrement d'avances, paiements partiels et soldes sur chaque commande
- Calcul automatique du solde restant dû par commande
- Historique des paiements par commande et global
- Génération de reçu PDF téléchargeable par paiement
- Page planning/calendrier : vue chronologique des commandes par date promise, avec alertes retards
- Dashboard avec statistiques réelles : commandes actives, CA 30 jours, retards, prochaines échéances
- Remplacement des valeurs statiques "—" du dashboard actuel par des données dynamiques

## Capabilities

### New Capabilities

- `payment-management` : Enregistrement, historique et récapitulatif des paiements sur commandes (avance, partiel, solde) avec méthodes Cash/Mobile Money/Virement et génération de reçu PDF
- `order-planning` : Vue planning chronologique des commandes triées par date promise, code couleur par statut, alertes commandes en retard et capacité atelier
- `dashboard-stats` : KPIs temps réel du styliste — commandes actives, prêtes, CA sur 30 jours, nombre de retards, commandes récentes et prochaines échéances

### Modified Capabilities

- `order-management` : Ajout de la section paiement intégrée dans la fiche commande (PaymentSummary + PaymentForm en ligne), mise à jour du badge `payment_status` en temps réel

## Impact

- **Prisma schema** : ajout du modèle `Payment` (lié à `Order` et `Stylist`)
- **Migration DB** : `prisma migrate dev --name add-payments`
- **Nouvelles API routes** :
  - `GET/POST /api/payments`
  - `GET /api/orders/[id]/payments`
  - `POST /api/orders/[id]/payments` (enregistrer paiement)
  - `GET /api/dashboard/stats`
- **Nouvelles pages** :
  - `/dashboard/payments` — historique global
  - `/dashboard/calendar` — planning
- **Pages modifiées** :
  - `/dashboard/page.tsx` — stats réelles
  - `/dashboard/orders/[id]/page.tsx` — section paiement intégrée
- **Nouvelles dépendances** : `jspdf` (génération PDF reçu)
- **Pas de breaking changes**
