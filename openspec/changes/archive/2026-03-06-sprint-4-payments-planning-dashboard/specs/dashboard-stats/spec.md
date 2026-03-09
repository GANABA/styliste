## ADDED Requirements

### Requirement: KPIs temps réel sur le dashboard
Le système SHALL calculer et afficher les indicateurs clés de l'activité du styliste en temps réel depuis les données réelles de la base.

#### Scenario: Chargement des stats
- **WHEN** le styliste accède à `/dashboard`
- **THEN** les 4 KPIs suivants sont affichés avec leurs valeurs réelles : commandes actives, commandes prêtes, CA des 30 derniers jours (en FCFA), nombre de commandes en retard

#### Scenario: Données vides pour un nouveau styliste
- **WHEN** le styliste n'a aucune commande ni paiement
- **THEN** les KPIs affichent 0 (et 0 FCFA pour le CA) sans erreur

### Requirement: Endpoint API de statistiques dashboard
Le système SHALL exposer un endpoint `GET /api/dashboard/stats` retournant toutes les métriques en une seule requête agrégée.

#### Scenario: Réponse correcte
- **WHEN** `GET /api/dashboard/stats` est appelé par un styliste authentifié
- **THEN** la réponse contient : `activeOrders`, `readyOrders`, `overdueOrders`, `revenue30Days`, `recentOrders` (5 dernières), `upcomingDeadlines` (7 prochains jours)

#### Scenario: Isolation multi-tenant
- **WHEN** l'endpoint est appelé
- **THEN** seules les données du styliste authentifié sont incluses dans le calcul

### Requirement: Liste des commandes récentes sur le dashboard
Le système SHALL afficher les 5 dernières commandes créées sur le dashboard avec leur statut et client.

#### Scenario: Affichage des commandes récentes
- **WHEN** le dashboard est chargé
- **THEN** une section "Commandes récentes" liste les 5 dernières commandes avec : numéro, client, type de vêtement, statut, date promise

#### Scenario: Lien vers le détail
- **WHEN** le styliste clique sur une commande récente
- **THEN** il est redirigé vers `/dashboard/orders/[id]`

### Requirement: Prochaines échéances sur le dashboard
Le système SHALL afficher les commandes dont la date promise est dans les 7 prochains jours sur le dashboard.

#### Scenario: Affichage des échéances
- **WHEN** des commandes non livrées ont une `promised_date` dans les 7 prochains jours
- **THEN** elles apparaissent dans une section "Prochaines échéances" triées par date croissante

#### Scenario: Aucune échéance imminente
- **WHEN** aucune commande n'est due dans les 7 prochains jours
- **THEN** la section affiche "Aucune échéance cette semaine"

### Requirement: Accès rapide aux fonctions principales depuis le dashboard
Le système SHALL proposer des boutons d'action rapide vers les sections principales et la création de commande.

#### Scenario: Actions rapides disponibles
- **WHEN** le styliste consulte le dashboard
- **THEN** des liens rapides vers "Nouvelle commande", "Clients", "Planning" et "Paiements" sont visibles
