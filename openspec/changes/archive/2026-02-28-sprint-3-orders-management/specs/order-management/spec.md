## ADDED Requirements

### Requirement: Stylist can create an order
Le système SHALL permettre à un styliste authentifié de créer une nouvelle commande pour un client existant. La commande SHALL contenir : client, type de vêtement, date promise, prix total, provenance du tissu, et niveau d'urgence. Un numéro unique SHALL être généré automatiquement au format `ORD-YYYY-XXXX` (incrémental par styliste).

#### Scenario: Création réussie d'une commande
- **WHEN** le styliste soumet un formulaire valide avec clientId, garmentType, promisedDate, totalPrice, fabricProvidedBy
- **THEN** le système crée la commande avec `status = 'quote'`, génère un `orderNumber` unique, et retourne HTTP 201 avec l'objet commande complet

#### Scenario: Création bloquée — limite de capacité atteinte
- **WHEN** le styliste a déjà 15 commandes actives (status IN quote, in_progress, ready) et tente d'en créer une nouvelle
- **THEN** le système retourne HTTP 422 avec `{ error: 'CAPACITY_EXCEEDED', activeOrders: 15, limit: 15 }`

#### Scenario: Création échouée — client inexistant ou n'appartient pas au styliste
- **WHEN** le styliste soumet un `clientId` qui n'existe pas ou appartient à un autre styliste
- **THEN** le système retourne HTTP 404 avec `{ error: 'CLIENT_NOT_FOUND' }`

#### Scenario: Création échouée — champs obligatoires manquants
- **WHEN** le styliste soumet le formulaire sans `garmentType` ou sans `promisedDate` ou sans `totalPrice`
- **THEN** le système retourne HTTP 400 avec les détails des champs invalides

---

### Requirement: Stylist can list their orders
Le système SHALL retourner la liste paginée des commandes du styliste authentifié. La liste SHALL supporter le filtrage par statut et le tri par date promise (ascendant par défaut). Les commandes supprimées (soft delete) SHALL être exclues.

#### Scenario: Liste toutes les commandes
- **WHEN** le styliste appelle `GET /api/orders` sans paramètres
- **THEN** le système retourne toutes ses commandes non supprimées, triées par `promisedDate` ASC, avec le nom du client inclus

#### Scenario: Filtrage par statut
- **WHEN** le styliste appelle `GET /api/orders?status=in_progress`
- **THEN** le système retourne uniquement les commandes avec `status = 'in_progress'`

#### Scenario: Isolation multi-tenant
- **WHEN** le styliste authentifié appelle `GET /api/orders`
- **THEN** le système retourne uniquement SES commandes, jamais celles d'un autre styliste

---

### Requirement: Stylist can view order details
Le système SHALL retourner le détail complet d'une commande, incluant les infos du client, les photos associées, et l'historique des modifications.

#### Scenario: Consultation d'une commande existante
- **WHEN** le styliste appelle `GET /api/orders/:id` avec un id valide lui appartenant
- **THEN** le système retourne l'objet commande avec les relations `client`, `photos`, et `history`

#### Scenario: Accès refusé à la commande d'un autre styliste
- **WHEN** le styliste authentifié tente d'accéder à une commande appartenant à un autre styliste
- **THEN** le système retourne HTTP 404

---

### Requirement: Stylist can update an order
Le système SHALL permettre la modification des champs d'une commande (description, date promise, prix, tissu, notes). Toute modification SHALL créer un enregistrement dans `OrderHistory` avec l'ancien et le nouveau statut.

#### Scenario: Mise à jour réussie
- **WHEN** le styliste soumet un `PATCH /api/orders/:id` avec des champs valides
- **THEN** le système met à jour les champs et crée un `OrderHistory` de type `description_change` ou `date_change` selon les champs modifiés

#### Scenario: Tentative de modification d'une commande annulée ou livrée
- **WHEN** le styliste tente de modifier une commande avec `status = 'delivered'` ou `status = 'canceled'`
- **THEN** le système retourne HTTP 422 avec `{ error: 'ORDER_NOT_EDITABLE' }`

---

### Requirement: Stylist can soft-delete an order
Le système SHALL permettre la suppression logique d'une commande (en posant `deletedAt`). Seules les commandes `quote` ou `canceled` SHALL être supprimables.

#### Scenario: Suppression d'un devis
- **WHEN** le styliste appelle `DELETE /api/orders/:id` sur une commande avec `status = 'quote'`
- **THEN** le système pose `deletedAt = NOW()` et retourne HTTP 204

#### Scenario: Suppression refusée — commande en cours
- **WHEN** le styliste tente de supprimer une commande avec `status = 'in_progress'` ou `status = 'ready'`
- **THEN** le système retourne HTTP 422 avec `{ error: 'ORDER_NOT_DELETABLE' }`

---

### Requirement: Order number is unique per stylist
Le système SHALL garantir l'unicité du numéro de commande par styliste au format `ORD-YYYY-XXXX` via une contrainte UNIQUE en base de données et une génération transactionnelle.

#### Scenario: Numéro auto-incrémenté correctement
- **WHEN** un styliste crée sa 5ème commande de l'année 2026
- **THEN** le `orderNumber` généré est `ORD-2026-0005`

#### Scenario: Remise à zéro au changement d'année
- **WHEN** un styliste crée sa première commande en 2027 (alors qu'il en avait en 2026)
- **THEN** le `orderNumber` généré est `ORD-2027-0001`
