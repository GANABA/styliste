## Context

Le Sprint 2 a livré la gestion des clients et des mesures. Le schéma Prisma actuel contient `User`, `Stylist`, `Client`, `MeasurementTemplate`, `ClientMeasurement`. Aucun modèle `Order` n'existe encore.

Ce sprint introduit le cœur métier : la commande. Trois décisions techniques importantes doivent être prises : (1) comment générer le numéro de commande sans trigger SQL, (2) quelle stratégie d'upload photo pour le MVP, (3) comment implémenter le workflow de statuts.

## Goals / Non-Goals

**Goals:**
- Modèles Prisma `Order`, `OrderPhoto`, `OrderHistory` + migration
- API REST complète (CRUD + photos + statuts + historique)
- UI mobile-first : liste, détail, formulaire de création/édition
- Génération auto du numéro de commande
- Enforcement de la limite 15 commandes actives
- Upload photos vers Cloudflare R2 (production) + filesystem local (dev)
- Workflow de statuts avec validation des transitions

**Non-Goals:**
- Paiements (Sprint 4)
- Notifications automatiques à la livraison (Sprint 5)
- Multi-employés / assignation (Sprint 6+)
- Vue Kanban des commandes (incluse dans la vue liste avec filtres)
- Items multiples / ensembles (champ `items` JSON stocké, pas d'UI dédiée au MVP)

## Decisions

### D1 — Génération du numéro de commande : transaction Prisma, pas de trigger SQL

**Choix** : Générer le numéro dans une transaction Prisma atomique à la création.
```typescript
// Dans la transaction de création :
const count = await tx.order.count({ where: { stylistId, deletedAt: null } });
const year = new Date().getFullYear();
const orderNumber = `ORD-${year}-${String(count + 1).padStart(4, '0')}`;
```
**Pourquoi pas un trigger PostgreSQL** : Les triggers sont invisibles dans Prisma, difficiles à tester, et compliquent les migrations. La solution applicative est suffisante pour le volume MVP.
**Risque** : Collision en cas de requêtes simultanées → mitigé par la transaction et l'index UNIQUE sur `order_number`.

---

### D2 — Upload photos : API Route Next.js + R2 via AWS SDK

**Choix** : Route `/api/orders/[id]/photos` qui accepte `multipart/form-data`, traite l'image avec `sharp`, puis pousse vers R2.
```
Client → POST /api/orders/[id]/photos (FormData)
       → sharp (resize + WebP)
       → R2 upload (prod) / local /public/uploads (dev)
       → Retourner { photo_url, thumbnail_url }
```
**Pourquoi pas presigned URLs** : Nécessiterait un appel client-side direct à R2 (exposition de credentials), plus complexe. Pour le MVP, l'upload via le serveur est plus simple et sécurisé.
**Variables d'environnement** : `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`. En dev, si absentes, fallback sur `public/uploads/`.

---

### D3 — Workflow de statuts : validation applicative simple

**Choix** : Fonction `canTransition(from, to)` dans un fichier `lib/orders/status.ts`.
```typescript
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  quote:       ['in_progress', 'canceled'],
  in_progress: ['ready', 'canceled'],
  ready:       ['delivered', 'canceled'],
  delivered:   [],
  canceled:    [],
};
```
**Pourquoi pas une lib state machine (XState)** : Surcharge pour un workflow à 5 statuts. La validation applicative est lisible, testable, et sans dépendance supplémentaire.
**Log automatique** : Toute transition crée un enregistrement `OrderHistory` dans la même transaction.

---

### D4 — Limite 15 commandes actives : vérification en transaction

**Choix** : Avant création, compter les commandes avec `status IN ['quote', 'in_progress', 'ready']` dans une transaction.
**Statuts "actifs"** : `quote`, `in_progress`, `ready` (pas `delivered`, pas `canceled`).
**Retour** : HTTP 422 avec message `{ error: 'CAPACITY_EXCEEDED', activeOrders: N, limit: 15 }`.

---

### D5 — Structure des modèles Prisma : champs MVP uniquement

**Choix** : On implémente les champs essentiels MVP. Les champs avancés (`fabric_supplier_id`, `assigned_to_employee_id`, `sub_status`) sont omis du schéma Prisma pour le moment (pas de modèles `FabricSupplier`, `Employee` encore).
**Champs inclus** : `id`, `stylistId`, `clientId`, `orderNumber`, `garmentType`, `description`, `status`, `urgencyLevel`, `orderDate`, `promisedDate`, `actualDeliveryDate`, `fabricProvidedBy`, `fabricReceivedDate`, `fabricDescription`, `totalPrice`, `advanceAmount`, `totalPaid`, `paymentStatus`, `measurementsSnapshot`, `notes`, `cancelationReason`, `deletedAt`, timestamps.

---

### D6 — UI : vue liste avec onglets de statut (pas de Kanban)

**Choix** : Page liste avec onglets (`Tous | Devis | En cours | Prêt | Livré | Annulé`) + tri par date promise. Le Kanban est exclu du MVP (complexité drag-and-drop inutile sur mobile).
**Mobile-first** : Cards compactes avec badge de statut coloré, date promise, nom du client, montant.

## Risks / Trade-offs

- **Collisions order_number** → Mitigé par transaction + contrainte UNIQUE. Acceptable au volume MVP.
- **Upload photos bloquant (serveur)** → Max 5 photos par commande, taille limitée à 5MB par photo. `sharp` est synchrone mais rapide. Acceptable pour le MVP.
- **Dépendance sharp sur Windows** → `sharp` nécessite des binaries natifs. Testé OK sur Node 18+. La build Vercel (Linux) n'a pas ce problème.
- **Pas de vrai presigned URL** → L'upload passe par le serveur Next.js, ce qui ajoute de la latence. Solution pour V2 : presigned URLs + upload direct R2 côté client.
- **items JSONB non structuré** → Pour le MVP, les items multiples sont un champ JSON libre. Pas d'UI dédiée. Un styliste peut saisir les items en texte libre dans `description`. La structure sera formalisée en Sprint 4+.

## Migration Plan

1. Ajouter les modèles au `schema.prisma`
2. `npx prisma migrate dev --name sprint3-orders`
3. Déployer les API routes
4. Déployer les pages UI
5. Configurer les variables R2 en production (Vercel env)
6. Rollback : supprimer la migration + les fichiers (pas de breaking change sur données existantes)

## Open Questions

- **Limite de taille photo** : 5MB par photo ou plus ? → Garder 5MB pour les contraintes 3G.
- **R2 bucket** : Créer manuellement ou via Terraform ? → Manuel pour le MVP.
- **Nombre max de photos par commande** : 4 (une par type) ou plusieurs par type ? → Plusieurs par type, max 10 photos total par commande pour le MVP.
