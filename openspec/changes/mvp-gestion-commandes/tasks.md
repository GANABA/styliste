## 1. Base de données et schéma

- [x] 1.1 Créer le script de migration Drizzle pour RLS policies sur table orders
- [x] 1.2 Créer le script de migration Drizzle pour les indexes (styliste_status, client, created, due_date)
- [x] 1.3 Appliquer les migrations sur la base de données locale
- [x] 1.4 Vérifier que les RLS policies fonctionnent correctement (isolation multi-tenant)

## 2. Validation et types

- [x] 2.1 Créer les schémas Zod pour les commandes (createOrderSchema, updateOrderSchema)
- [x] 2.2 Définir les types TypeScript pour Order, OrderStatus, GarmentType
- [x] 2.3 Créer les constantes pour les types de vêtements (GARMENT_TYPES)
- [x] 2.4 Créer les constantes et labels pour les statuts de commande (ORDER_STATUSES, ORDER_STATUS_LABELS)

## 3. Helpers et utilitaires

- [x] 3.1 Créer la fonction generateOrderNumber avec protection contre les collisions
- [x] 3.2 Créer la fonction canTransitionTo pour valider les transitions de statut
- [x] 3.3 Créer la fonction getMeasurementsSnapshot pour capturer les mesures d'un client
- [x] 3.4 Créer les helpers de formatage de devise (formatCurrency pour XOF)
- [x] 3.5 Créer les helpers de calcul de dates (isThisWeek, isThisMonth)

## 4. API - Endpoints CRUD

- [x] 4.1 Créer POST /api/orders (création commande avec snapshot mesures et génération numéro)
- [x] 4.2 Créer GET /api/orders (liste avec filtres par statut et recherche)
- [x] 4.3 Créer GET /api/orders/[id] (détails commande)
- [x] 4.4 Créer PATCH /api/orders/[id] (modification commande)

## 5. API - Endpoints spécialisés

- [x] 5.1 Créer PATCH /api/orders/[id]/status (changement de statut avec validation workflow)
- [x] 5.2 Créer DELETE /api/orders/[id] (soft delete avec validation)
- [x] 5.3 Créer GET /api/orders/stats (statistiques dashboard : compteurs, CA, commandes à livrer)

## 6. Composants UI - Affichage

- [x] 6.1 Créer OrderCard.svelte (carte commande avec statut, client, prix, date)
- [x] 6.2 Créer OrderStatusBadge.svelte (badge de statut avec couleurs)
- [x] 6.3 Créer OrderList.svelte (liste de commandes avec tri et filtres)
- [x] 6.4 Créer OrderStats.svelte (widget statistiques pour dashboard)

## 7. Composants UI - Formulaires et sélecteurs

- [x] 7.1 Créer GarmentTypeSelector.svelte (sélecteur de type de vêtement avec "Autre")
- [x] 7.2 Créer OrderStatusSelector.svelte (sélecteur de statut avec validation transitions)
- [x] 7.3 Créer OrderForm.svelte (formulaire complet création/modification commande)

## 8. Pages - Gestion des commandes

- [x] 8.1 Créer la page /orders (liste des commandes avec filtres par statut)
- [x] 8.2 Créer la page /orders/[id] (détails commande avec actions)
- [x] 8.3 Créer la page /orders/new (création nouvelle commande)
- [x] 8.4 Créer la page /orders/[id]/edit (modification commande existante)
- [x] 8.5 Ajouter le lien "Commandes" dans la navigation principale

## 9. Enrichissement page client

- [x] 9.1 Créer le composant ClientOrders.svelte (section commandes sur page client)
- [x] 9.2 Modifier /clients/[id]/+page.svelte pour ajouter la section commandes
- [x] 9.3 Charger les commandes du client dans +page.server.ts
- [x] 9.4 Ajouter le bouton "Nouvelle commande" avec pré-remplissage du client

## 10. Dashboard et statistiques

- [x] 10.1 Modifier /dashboard/+page.svelte pour ajouter les widgets de commandes
- [x] 10.2 Charger les statistiques depuis l'API dans +page.server.ts
- [x] 10.3 Afficher les compteurs par statut (En cours, Prêt, Livré)
- [x] 10.4 Afficher les commandes à livrer cette semaine
- [x] 10.5 Afficher le chiffre d'affaires mensuel

## 11. Build et validation

- [x] 11.1 Vérifier que le build SvelteKit passe sans erreurs (npm run build)
- [x] 11.2 Vérifier le bundle size (doit rester < 100KB)
- [x] 11.3 Tester la création d'une commande avec snapshot des mesures
- [x] 11.4 Tester les transitions de statut (pending → ready → delivered)
- [x] 11.5 Tester le soft delete et vérifier qu'il n'apparaît plus dans la liste
- [x] 11.6 Tester les filtres par statut
- [x] 11.7 Tester la recherche par numéro de commande, client, type de vêtement
- [x] 11.8 Tester l'isolation multi-tenant (RLS)

## 12. Tests end-to-end avec playwright-skill

- [x] 12.1 Tester le workflow complet : Créer client → Prendre mesures → Créer commande
- [x] 12.2 Tester l'affichage des commandes sur la page client
- [x] 12.3 Tester le dashboard avec les statistiques
- [x] 12.4 Tester le responsive design (mobile, tablette, desktop)

## 13. Finalisation

- [x] 13.1 Commit des changements avec message descriptif
- [x] 13.2 Vérifier que toutes les spécifications sont implémentées
- [x] 13.3 Documenter les points d'attention (ordre de création table orders si nécessaire)
