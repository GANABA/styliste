## 1. Configuration et schémas base de données

- [ ] 1.1 Créer le schema Drizzle pour la table `measurements`
- [ ] 1.2 Créer le schema Drizzle pour la table `orders`
- [ ] 1.3 Générer et appliquer la migration Drizzle pour créer les tables
- [ ] 1.4 Créer le script SQL pour activer Row Level Security sur `measurements`
- [ ] 1.5 Créer le script SQL pour activer Row Level Security sur `orders`
- [ ] 1.6 Créer les policies RLS pour isolation multi-tenant sur `measurements`
- [ ] 1.7 Créer les policies RLS pour isolation multi-tenant sur `orders`
- [ ] 1.8 Créer les index de performance (client_id, styliste_id, taken_at, status, created_at)

## 2. Schemas de validation Zod

- [ ] 2.1 Créer le schema Zod pour les mesures (measurement_type, value, unit, notes)
- [ ] 2.2 Créer le schema Zod pour les commandes (client_id, garment_type, description, price, status, due_date)
- [ ] 2.3 Créer le schema Zod pour les types de mesures standards (export liste pré-définie)
- [ ] 2.4 Créer le schema Zod pour les types de vêtements standards (export liste pré-définie)
- [ ] 2.5 Exporter les types TypeScript à partir des schemas Zod

## 3. Utilitaires et helpers

- [ ] 3.1 Créer la fonction de génération de numéro de commande (format STY-{YYYY}{MM}-{NNNN})
- [ ] 3.2 Créer le helper pour snapshot des mesures (conversion vers JSONB)
- [ ] 3.3 Créer les helpers de validation de statut de commande (transitions autorisées)
- [ ] 3.4 Créer les helpers de formatage de devise (XOF)
- [ ] 3.5 Créer les helpers de date (calcul semaine en cours, mois en cours)

## 4. API Routes - Mesures

- [ ] 4.1 Créer l'endpoint POST /api/clients/[id]/measurements (création mesures)
- [ ] 4.2 Créer l'endpoint GET /api/clients/[id]/measurements (liste mesures avec historique)
- [ ] 4.3 Créer l'endpoint GET /api/clients/[id]/measurements/latest (dernières mesures)
- [ ] 4.4 Créer l'endpoint PATCH /api/measurements/[id] (modification mesures)
- [ ] 4.5 Ajouter validation Zod sur tous les endpoints mesures
- [ ] 4.6 Vérifier isolation RLS (styliste ne peut accéder qu'aux mesures de ses clients)

## 5. API Routes - Commandes

- [ ] 5.1 Créer l'endpoint POST /api/orders (création commande)
- [ ] 5.2 Créer l'endpoint GET /api/orders (liste commandes avec filtres par statut)
- [ ] 5.3 Créer l'endpoint GET /api/orders/[id] (détails commande)
- [ ] 5.4 Créer l'endpoint PATCH /api/orders/[id] (modification commande)
- [ ] 5.5 Créer l'endpoint PATCH /api/orders/[id]/status (changement de statut)
- [ ] 5.6 Créer l'endpoint DELETE /api/orders/[id] (suppression soft delete)
- [ ] 5.7 Créer l'endpoint GET /api/orders/stats (statistiques dashboard)
- [ ] 5.8 Ajouter validation Zod sur tous les endpoints commandes
- [ ] 5.9 Vérifier isolation RLS (styliste ne peut accéder qu'à ses propres commandes)
- [ ] 5.10 Implémenter la génération automatique du numéro de commande
- [ ] 5.11 Implémenter le snapshot automatique des mesures à la création

## 6. API Routes - Enrichissement clients

- [ ] 6.1 Modifier l'endpoint GET /api/clients/[id] pour inclure dernières mesures
- [ ] 6.2 Modifier l'endpoint GET /api/clients/[id] pour inclure liste des commandes
- [ ] 6.3 Tester l'isolation RLS sur les données enrichies

## 7. Composants UI - Mesures

- [ ] 7.1 Créer le composant MeasurementForm.svelte (formulaire prise de mesures)
- [ ] 7.2 Créer le composant MeasurementTypeSelector.svelte (sélection types standards)
- [ ] 7.3 Créer le composant MeasurementHistory.svelte (affichage historique)
- [ ] 7.4 Créer le composant MeasurementComparison.svelte (comparaison deux dates)
- [ ] 7.5 Créer le composant MeasurementCard.svelte (affichage carte mesure)
- [ ] 7.6 Ajouter validation frontend avec Zod schema mesures
- [ ] 7.7 Ajouter états de chargement et messages d'erreur

## 8. Composants UI - Commandes

- [ ] 8.1 Créer le composant OrderForm.svelte (formulaire création/modification commande)
- [ ] 8.2 Créer le composant OrderCard.svelte (carte résumé commande)
- [ ] 8.3 Créer le composant OrderStatusBadge.svelte (badge statut coloré)
- [ ] 8.4 Créer le composant OrderStatusSelector.svelte (changement de statut)
- [ ] 8.5 Créer le composant GarmentTypeSelector.svelte (sélection types vêtements)
- [ ] 8.6 Créer le composant OrderSearchBar.svelte (recherche commandes)
- [ ] 8.7 Créer le composant OrderFilters.svelte (filtres par statut)
- [ ] 8.8 Ajouter validation frontend avec Zod schema commandes
- [ ] 8.9 Ajouter états de chargement et messages d'erreur

## 9. Pages - Mesures

- [ ] 9.1 Créer la page /clients/[id]/measurements (historique mesures client)
- [ ] 9.2 Créer la page /clients/[id]/measurements/new (prise nouvelle mesures)
- [ ] 9.3 Créer la page /measurements/[id]/edit (modification mesures)
- [ ] 9.4 Intégrer les composants UI mesures dans les pages
- [ ] 9.5 Ajouter navigation depuis page détail client
- [ ] 9.6 Tester le flow complet : client → prendre mesures → historique

## 10. Pages - Commandes

- [ ] 10.1 Créer la page /orders (liste toutes commandes avec filtres)
- [ ] 10.2 Créer la page /orders/new (création nouvelle commande)
- [ ] 10.3 Créer la page /orders/[id] (détails commande)
- [ ] 10.4 Créer la page /orders/[id]/edit (modification commande)
- [ ] 10.5 Intégrer les composants UI commandes dans les pages
- [ ] 10.6 Implémenter les filtres par statut (pending, ready, delivered)
- [ ] 10.7 Implémenter la recherche par numéro, client, type vêtement
- [ ] 10.8 Implémenter le changement de statut depuis page détail
- [ ] 10.9 Implémenter la modale de confirmation de suppression
- [ ] 10.10 Tester le flow complet : créer commande → changer statut → livrer

## 11. Dashboard

- [ ] 11.1 Créer les widgets de statistiques (compteurs par statut)
- [ ] 11.2 Créer le widget "Commandes à livrer cette semaine"
- [ ] 11.3 Créer le widget "Chiffre d'affaires du mois"
- [ ] 11.4 Intégrer les widgets dans la page /dashboard
- [ ] 11.5 Ajouter les liens rapides vers les listes filtrées
- [ ] 11.6 Tester l'affichage avec données réelles

## 12. Enrichissement page client

- [ ] 12.1 Ajouter section "Mesures" sur /clients/[id]
- [ ] 12.2 Afficher les dernières mesures du client
- [ ] 12.3 Ajouter bouton "Prendre mesures" dans la section
- [ ] 12.4 Ajouter bouton "Voir historique" vers /clients/[id]/measurements
- [ ] 12.5 Ajouter section "Commandes" sur /clients/[id]
- [ ] 12.6 Afficher la liste des commandes du client
- [ ] 12.7 Ajouter bouton "Nouvelle commande" dans la section
- [ ] 12.8 Afficher le statut de chaque commande
- [ ] 12.9 Tester la navigation complète depuis page client

## 13. Navigation et layout

- [ ] 13.1 Ajouter lien "Commandes" dans le menu principal
- [ ] 13.2 Ajouter lien "Dashboard" dans le menu principal (si pas déjà présent)
- [ ] 13.3 Mettre à jour le breadcrumb pour les nouvelles pages
- [ ] 13.4 Tester la navigation entre toutes les pages

## 14. Types de données standards

- [ ] 14.1 Définir la liste des types de mesures standards côté frontend
- [ ] 14.2 Définir la liste des types de vêtements standards côté frontend
- [ ] 14.3 Créer les constantes TypeScript pour les listes
- [ ] 14.4 Implémenter l'autocomplete pour mesures personnalisées
- [ ] 14.5 Implémenter l'option "Autre" pour types de vêtements

## 15. Validation et gestion d'erreur

- [ ] 15.1 Valider les valeurs numériques des mesures (positives, décimales)
- [ ] 15.2 Valider les prix de commandes (positifs, numériques)
- [ ] 15.3 Valider les dates de livraison (avertissement si dans le passé)
- [ ] 15.4 Gérer les erreurs de génération de numéro de commande (retry)
- [ ] 15.5 Afficher messages d'erreur clairs en français
- [ ] 15.6 Tester tous les cas d'erreur de validation

## 16. Performance et optimisation

- [ ] 16.1 Optimiser les requêtes d'historique de mesures (pagination si nécessaire)
- [ ] 16.2 Optimiser les requêtes de liste de commandes (pagination)
- [ ] 16.3 Lazy loading des composants lourds (graphiques dashboard)
- [ ] 16.4 Vérifier le bundle size (objectif < 100KB gzipped)
- [ ] 16.5 Tester les performances sur connexion 3G

## 17. Tests fonctionnels

- [ ] 17.1 Tester la création de mesures pour un client
- [ ] 17.2 Tester l'historique et la comparaison de mesures
- [ ] 17.3 Tester la création de commande avec snapshot de mesures
- [ ] 17.4 Tester les transitions de statut (pending → ready → delivered)
- [ ] 17.5 Tester la recherche de commandes (numéro, client, type)
- [ ] 17.6 Tester les filtres par statut
- [ ] 17.7 Tester le dashboard (compteurs, chiffre d'affaires)
- [ ] 17.8 Tester l'enrichissement page client (mesures + commandes)
- [ ] 17.9 Tester l'isolation multi-tenant (2 comptes stylistes différents)
- [ ] 17.10 Tester responsive mobile (320px, 768px, 1024px)

## 18. Documentation

- [ ] 18.1 Documenter le format du numéro de commande
- [ ] 18.2 Documenter les types de mesures standards
- [ ] 18.3 Documenter les types de vêtements standards
- [ ] 18.4 Documenter le workflow des statuts de commande
- [ ] 18.5 Documenter l'utilisation du snapshot de mesures

## 19. Déploiement

- [ ] 19.1 Exécuter les migrations database sur Supabase production
- [ ] 19.2 Vérifier que les policies RLS sont actives en production
- [ ] 19.3 Build et deploy sur Cloudflare Pages
- [ ] 19.4 Smoke tests en production (créer mesures, créer commande, changer statut)
- [ ] 19.5 Vérifier l'isolation multi-tenant en production
