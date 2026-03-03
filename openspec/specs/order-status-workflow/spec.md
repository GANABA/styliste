## ADDED Requirements

### Requirement: Order status follows a defined transition graph
Le système SHALL enforcer les transitions de statut valides selon le graphe suivant :
- `quote` → `in_progress` | `canceled`
- `in_progress` → `ready` | `canceled`
- `ready` → `delivered` | `canceled`
- `delivered` → (terminal, aucune transition possible)
- `canceled` → (terminal, aucune transition possible)

Toute tentative de transition invalide (ex : `ready` → `in_progress`) SHALL être rejetée.

#### Scenario: Transition valide quote → in_progress
- **WHEN** le styliste appelle `PUT /api/orders/:id/status` avec `{ status: 'in_progress' }` sur une commande `quote`
- **THEN** le système met à jour le statut, crée un `OrderHistory` de type `status_change`, et retourne HTTP 200 avec la commande mise à jour

#### Scenario: Transition invalide rejetée
- **WHEN** le styliste tente de passer une commande de `ready` à `in_progress`
- **THEN** le système retourne HTTP 422 avec `{ error: 'INVALID_TRANSITION', from: 'ready', to: 'in_progress' }`

#### Scenario: Transition sur statut terminal
- **WHEN** le styliste tente de modifier le statut d'une commande `delivered`
- **THEN** le système retourne HTTP 422 avec `{ error: 'INVALID_TRANSITION', from: 'delivered', to: '<any>' }`

---

### Requirement: Every status transition is logged in order history
Le système SHALL créer automatiquement un enregistrement `OrderHistory` à chaque changement de statut, avec l'ancien statut, le nouveau statut, et l'identifiant de l'utilisateur ayant effectué le changement.

#### Scenario: Log créé lors d'un passage en livraison
- **WHEN** le styliste passe une commande de `ready` à `delivered`
- **THEN** un enregistrement `OrderHistory` est créé avec `changeType = 'status_change'`, `oldValue = 'ready'`, `newValue = 'delivered'`, `changedByUserId = stylist.userId`

#### Scenario: Historique disponible via l'API
- **WHEN** le styliste appelle `GET /api/orders/:id/history`
- **THEN** le système retourne la liste de tous les enregistrements `OrderHistory` pour cette commande, triés par `createdAt` DESC

---

### Requirement: Cancellation requires a reason
Le système SHALL exiger un champ `cancellationReason` (non vide) lors d'une annulation de commande (transition vers `canceled`).

#### Scenario: Annulation avec raison
- **WHEN** le styliste soumet `{ status: 'canceled', cancellationReason: 'Client a annulé' }`
- **THEN** le système pose `status = 'canceled'`, `cancellationReason = 'Client a annulé'`, `canceledAt = NOW()`, et log dans l'historique

#### Scenario: Annulation sans raison rejetée
- **WHEN** le styliste soumet `{ status: 'canceled' }` sans `cancellationReason`
- **THEN** le système retourne HTTP 400 avec `{ error: 'CANCELLATION_REASON_REQUIRED' }`

---

### Requirement: Delivered order sets actual delivery date
Le système SHALL automatiquement poser `actualDeliveryDate = today` lors du passage au statut `delivered`, si ce champ n'est pas déjà renseigné.

#### Scenario: Date de livraison posée automatiquement
- **WHEN** le styliste passe une commande au statut `delivered` sans fournir `actualDeliveryDate`
- **THEN** le système pose `actualDeliveryDate = CURRENT_DATE`

#### Scenario: Date de livraison surchargeable
- **WHEN** le styliste passe une commande au statut `delivered` en fournissant `actualDeliveryDate = '2026-02-20'`
- **THEN** le système utilise la date fournie, pas la date du jour
