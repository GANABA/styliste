## Purpose

Permettre aux stylistes de créer, suivre et gérer le cycle de vie complet des commandes de vêtements sur mesure. Les commandes sont liées aux clients et incluent un snapshot des mesures au moment de la création pour garantir la cohérence historique.

## ADDED Requirements

### Requirement: System SHALL allow creating orders for clients

Le système doit permettre au styliste de créer une nouvelle commande liée à un client existant.

#### Scenario: Creating order with required fields
- **WHEN** le styliste sélectionne un client, remplit le type de vêtement, la description et le prix, puis clique sur "Créer commande"
- **THEN** le système crée la commande avec un numéro unique au format STY-{YYYY}{MM}-{NNNN}, statut "pending" et affiche un message de succès

#### Scenario: Automatically capturing measurement snapshot
- **WHEN** le styliste crée une commande pour un client qui a des mesures enregistrées
- **THEN** le système capture automatiquement les dernières mesures du client dans un champ JSONB de la commande

#### Scenario: Creating order without measurements
- **WHEN** le styliste crée une commande pour un client sans mesures enregistrées
- **THEN** le système crée la commande avec un snapshot vide et affiche un avertissement "Aucune mesure enregistrée pour ce client"

#### Scenario: Setting optional due date
- **WHEN** le styliste spécifie une date de livraison prévue
- **THEN** le système enregistre la date et l'affiche sur la commande

---

### Requirement: System SHALL generate unique order numbers

Le système doit générer automatiquement un numéro de commande unique et lisible pour chaque nouvelle commande.

#### Scenario: Order number format
- **WHEN** une commande est créée en janvier 2026
- **THEN** le numéro de commande suit le format STY-202601-{NNNN} où NNNN est un compteur séquentiel

#### Scenario: Order numbers are unique per styliste
- **WHEN** deux stylistes créent une commande le même jour
- **THEN** chaque commande reçoit un numéro unique basé sur le compteur du styliste

#### Scenario: Collision handling
- **WHEN** deux commandes sont créées simultanément par le même styliste
- **THEN** le système garantit l'unicité via une transaction PostgreSQL et incrémente le compteur sans collision

---

### Requirement: System SHALL manage order status workflow

Le système doit permettre de faire évoluer le statut d'une commande selon un workflow défini : pending → ready → delivered.

#### Scenario: Default status is pending
- **WHEN** une commande est créée
- **THEN** le statut par défaut est "pending" (En cours)

#### Scenario: Updating status to ready
- **WHEN** le styliste clique sur "Marquer comme prêt" depuis une commande en statut "pending"
- **THEN** le système change le statut à "ready" et affiche un message de succès

#### Scenario: Updating status to delivered
- **WHEN** le styliste clique sur "Marquer comme livré" depuis une commande en statut "ready"
- **THEN** le système change le statut à "delivered", enregistre la date/heure de livraison (delivered_at) et affiche un message de succès

#### Scenario: Reverting ready to pending
- **WHEN** le styliste clique sur "Remettre en cours" depuis une commande en statut "ready"
- **THEN** le système change le statut à "pending" (permet les retouches)

#### Scenario: Delivered is final status
- **WHEN** une commande est en statut "delivered"
- **THEN** le système n'affiche plus d'options de changement de statut (état final)

---

### Requirement: System SHALL provide order filtering by status

Le styliste doit pouvoir filtrer et visualiser les commandes par statut.

#### Scenario: Viewing all orders
- **WHEN** le styliste accède à la page /orders
- **THEN** le système affiche toutes les commandes triées par date de création (plus récente en premier)

#### Scenario: Filtering by pending status
- **WHEN** le styliste clique sur le filtre "En cours"
- **THEN** le système affiche uniquement les commandes avec statut "pending"

#### Scenario: Filtering by ready status
- **WHEN** le styliste clique sur le filtre "Prêt"
- **THEN** le système affiche uniquement les commandes avec statut "ready"

#### Scenario: Filtering by delivered status
- **WHEN** le styliste clique sur le filtre "Livré"
- **THEN** le système affiche uniquement les commandes avec statut "delivered"

---

### Requirement: System SHALL display order statistics on dashboard

Le tableau de bord doit afficher des statistiques synthétiques sur les commandes.

#### Scenario: Displaying order counts by status
- **WHEN** le styliste accède au dashboard
- **THEN** le système affiche 3 compteurs : nombre de commandes en cours, prêtes et livrées ce mois

#### Scenario: Displaying upcoming deliveries
- **WHEN** le styliste accède au dashboard
- **THEN** le système affiche la liste des commandes à livrer cette semaine (due_date dans les 7 prochains jours)

#### Scenario: Displaying monthly revenue
- **WHEN** le styliste accède au dashboard
- **THEN** le système affiche le chiffre d'affaires du mois (somme des prix des commandes livrées ce mois)

---

### Requirement: System SHALL allow updating order details

Le styliste doit pouvoir modifier les détails d'une commande existante (tant qu'elle n'est pas livrée).

#### Scenario: Editing order description
- **WHEN** le styliste modifie la description d'une commande en statut "pending" ou "ready" et sauvegarde
- **THEN** le système met à jour la description et affiche un message de succès

#### Scenario: Editing order price
- **WHEN** le styliste modifie le prix d'une commande et sauvegarde
- **THEN** le système met à jour le prix

#### Scenario: Cannot edit delivered orders
- **WHEN** le styliste tente de modifier une commande en statut "delivered"
- **THEN** le système affiche un message "Impossible de modifier une commande livrée"

---

### Requirement: System SHALL allow deleting orders

Le styliste doit pouvoir supprimer une commande (soft delete pour éviter perte de données).

#### Scenario: Deleting a pending order
- **WHEN** le styliste clique sur "Supprimer" depuis une commande en statut "pending" et confirme
- **THEN** le système marque la commande comme supprimée (soft delete avec deleted_at) et la retire de la liste

#### Scenario: Cannot delete delivered orders
- **WHEN** le styliste tente de supprimer une commande en statut "delivered"
- **THEN** le système affiche un message "Impossible de supprimer une commande livrée"

#### Scenario: Confirmation before deletion
- **WHEN** le styliste clique sur "Supprimer"
- **THEN** le système affiche une modale de confirmation "Êtes-vous sûr de vouloir supprimer cette commande ?"

---

### Requirement: System SHALL enforce multi-tenant isolation for orders

Le système doit garantir que chaque styliste ne peut accéder qu'à ses propres commandes via Row Level Security.

#### Scenario: Styliste can only view own orders
- **WHEN** le styliste A tente d'accéder à une commande du styliste B via API directe
- **THEN** le système retourne une erreur 404 (Not Found) grâce à RLS PostgreSQL

#### Scenario: Orders are filtered by styliste
- **WHEN** le styliste consulte la liste des commandes ou le dashboard
- **THEN** le système retourne uniquement les commandes créées par ce styliste

---

### Requirement: System SHALL validate order data

Le système doit valider les données de commande avant sauvegarde.

#### Scenario: Required fields validation
- **WHEN** le styliste tente de créer une commande sans spécifier le type de vêtement
- **THEN** le système affiche un message d'erreur "Le type de vêtement est obligatoire"

#### Scenario: Price validation
- **WHEN** le styliste saisit un prix négatif ou non numérique
- **THEN** le système affiche un message d'erreur "Le prix doit être un nombre positif"

#### Scenario: Due date validation
- **WHEN** le styliste spécifie une date de livraison prévue dans le passé
- **THEN** le système affiche un avertissement "La date de livraison est dans le passé"

---

### Requirement: System SHALL display orders on client detail page

Les commandes du client doivent être visibles directement sur la page de détail du client.

#### Scenario: Viewing client orders on client page
- **WHEN** le styliste consulte la page détail d'un client
- **THEN** le système affiche une section "Commandes" avec la liste des commandes de ce client

#### Scenario: Quick access to create order
- **WHEN** le styliste consulte la page détail d'un client
- **THEN** le système affiche un bouton "Nouvelle commande" dans la section commandes

#### Scenario: Order status is visible
- **WHEN** le styliste consulte les commandes d'un client
- **THEN** chaque commande affiche son statut actuel (En cours / Prêt / Livré)

---

### Requirement: System SHALL provide order search functionality

Le styliste doit pouvoir rechercher des commandes par numéro, client ou type de vêtement.

#### Scenario: Searching by order number
- **WHEN** le styliste saisit un numéro de commande dans la barre de recherche (ex: "STY-202601-0042")
- **THEN** le système affiche la commande correspondante

#### Scenario: Searching by client name
- **WHEN** le styliste saisit le nom d'un client
- **THEN** le système affiche toutes les commandes de ce client

#### Scenario: Searching by garment type
- **WHEN** le styliste saisit un type de vêtement (ex: "Robe")
- **THEN** le système affiche toutes les commandes de ce type

---

### Requirement: System SHALL support predefined garment types

Le système doit proposer des types de vêtements pré-définis pour faciliter la saisie.

#### Scenario: Display garment type options
- **WHEN** le styliste crée ou modifie une commande
- **THEN** le système affiche une liste déroulante avec les types : Robe, Costume, Boubou, Chemise, Pantalon, Jupe, Veste, Autre

#### Scenario: Allow custom garment type
- **WHEN** le styliste sélectionne "Autre" et saisit un type personnalisé
- **THEN** le système enregistre le type personnalisé
