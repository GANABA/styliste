## 1. Base de données — Modèles Prisma

- [x] 1.1 Ajouter les enums `OrderStatus`, `UrgencyLevel`, `FabricProvidedBy`, `PaymentStatus` dans `schema.prisma`
- [x] 1.2 Ajouter le modèle `Order` avec tous les champs MVP (voir D5 dans design.md)
- [x] 1.3 Ajouter le modèle `OrderPhoto` (id, orderId, photoUrl, thumbnailUrl, photoType, caption, displayOrder)
- [x] 1.4 Ajouter le modèle `OrderHistory` (id, orderId, changedByUserId, changeType, fieldName, oldValue, newValue, comment)
- [x] 1.5 Ajouter les relations inverses sur `Client` et `Stylist` vers `Order`
- [x] 1.6 Ajouter les index Prisma sur `Order` (stylistId, clientId, status, orderNumber, promisedDate)
- [x] 1.7 Exécuter `npx prisma migrate dev --name sprint3-orders` et vérifier la migration

## 2. Utilitaires métier

- [x] 2.1 Créer `src/lib/orders/status.ts` — table `VALID_TRANSITIONS` et fonction `canTransition(from, to)`
- [x] 2.2 Créer `src/lib/orders/number.ts` — fonction `generateOrderNumber(tx, stylistId)` (transaction Prisma)
- [x] 2.3 Créer `src/lib/storage/upload.ts` — service d'upload : R2 en prod, filesystem local en dev (détection via env vars)
- [x] 2.4 Ajouter `sharp` comme dépendance : `npm install sharp @aws-sdk/client-s3`
- [x] 2.5 Ajouter les variables d'environnement R2 dans `.env.local.example` (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`)

## 3. API Routes — CRUD Commandes

- [x] 3.1 Créer `src/app/api/orders/route.ts` — `GET` (liste avec filtre `?status=`) + `POST` (création avec validation et limite 15)
- [x] 3.2 Créer `src/app/api/orders/[id]/route.ts` — `GET` (détail avec client, photos, history) + `PATCH` (modification) + `DELETE` (soft delete)
- [x] 3.3 Créer `src/app/api/orders/[id]/status/route.ts` — `PUT` (transition statut avec `canTransition()` + log history)
- [x] 3.4 Créer `src/app/api/orders/[id]/history/route.ts` — `GET` (liste historique triée par createdAt DESC)
- [x] 3.5 Valider l'authentification et l'isolation tenant (stylistId) sur toutes les routes

## 4. API Route — Upload Photos

- [x] 4.1 Créer `src/app/api/orders/[id]/photos/route.ts` — `POST` (upload multipart/form-data) + `GET` (liste photos)
- [x] 4.2 Implémenter la validation dans le handler : type MIME, taille max 5MB, limite 10 photos
- [x] 4.3 Implémenter le pipeline sharp : redimensionnement 1200px max + thumbnail 400px + conversion WebP
- [x] 4.4 Créer `src/app/api/orders/[id]/photos/[photoId]/route.ts` — `DELETE` (suppression R2 + DB)
- [x] 4.5 Créer le dossier `public/uploads/` et l'ajouter au `.gitignore`

## 5. Types TypeScript

- [x] 5.1 Créer `src/types/orders.ts` — interfaces `Order`, `OrderPhoto`, `OrderHistory`, `OrderWithRelations`, types pour les enums
- [x] 5.2 Créer les types de requête/réponse API : `CreateOrderInput`, `UpdateOrderInput`, `TransitionStatusInput`

## 6. Pages UI — Structure

- [x] 6.1 Créer `src/app/dashboard/orders/page.tsx` — page liste avec onglets de statut
- [x] 6.2 Créer `src/app/dashboard/orders/new/page.tsx` — formulaire de création
- [x] 6.3 Créer `src/app/dashboard/orders/[id]/page.tsx` — page détail commande
- [x] 6.4 Créer `src/app/dashboard/orders/[id]/edit/page.tsx` — formulaire de modification
- [x] 6.5 Ajouter le lien "Commandes" dans le layout du dashboard (`src/app/dashboard/layout.tsx`)

## 7. Composants UI — Liste et Statuts

- [x] 7.1 Créer `src/components/orders/OrderStatusBadge.tsx` — badge coloré par statut (5 couleurs)
- [x] 7.2 Créer `src/components/orders/OrderCard.tsx` — card mobile-first : client, type vêtement, date promise, montant, badge statut
- [x] 7.3 Créer `src/components/orders/OrdersList.tsx` — liste avec onglets de filtrage par statut + état vide
- [x] 7.4 Créer `src/components/orders/OrderStatusTabs.tsx` — onglets `Tous | Devis | En cours | Prêt | Livré | Annulé` avec compteurs

## 8. Composants UI — Formulaire et Détail

- [x] 8.1 Créer `src/components/orders/OrderForm.tsx` — formulaire complet (client select, type, dates, prix, tissu, urgence, description)
- [x] 8.2 Créer `src/components/orders/OrderDetail.tsx` — affichage détail + bouton de transition de statut
- [x] 8.3 Créer `src/components/orders/OrderTimeline.tsx` — historique des modifications avec icônes
- [x] 8.4 Créer `src/components/orders/StatusTransitionButton.tsx` — bouton contextuel selon statut actuel (ex : "Marquer En cours", "Marquer Prêt")
- [x] 8.5 Créer `src/components/orders/CancellationModal.tsx` — modal avec champ raison obligatoire pour annulation

## 9. Composants UI — Photos

- [x] 9.1 Créer `src/components/orders/PhotoUploader.tsx` — upload drag-and-drop + sélection par type
- [x] 9.2 Créer `src/components/orders/PhotoGallery.tsx` — grille de photos par type avec option suppression
- [x] 9.3 Implémenter la prévisualisation locale avant upload (FileReader API)

## 10. Hooks et State

- [x] 10.1 Créer `src/hooks/useOrders.ts` — hook CRUD commandes (liste, création, modification, suppression)
- [x] 10.2 Créer `src/hooks/useOrderStatus.ts` — hook pour transitions de statut
- [x] 10.3 Créer `src/hooks/useOrderPhotos.ts` — hook upload et suppression photos

## 11. Intégration et Tests manuels

- [x] 11.1 Tester le flow complet : créer → passer en cours → marquer prêt → livrer
- [x] 11.2 Tester la limite de 15 commandes actives
- [x] 11.3 Tester l'upload photo (format valide, format invalide, trop grand)
- [x] 11.4 Tester la suppression de photo
- [x] 11.5 Tester l'isolation tenant (une commande d'un styliste non visible par un autre)
- [x] 11.6 Vérifier la responsiveness sur 375px (mobile), 768px (tablette), 1024px (desktop)

