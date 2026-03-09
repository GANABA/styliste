## ADDED Requirements

### Requirement: Stylist can send order-ready email to client
Le système SHALL permettre à un styliste d'envoyer un email "Commande prête" au client d'une commande dont le `status = 'READY'`. L'email SHALL être envoyé via Resend avec un template React Email. L'envoi SHALL être enregistré dans la table `Notification`.

#### Scenario: Envoi réussi de l'email "commande prête"
- **WHEN** le styliste déclenche l'envoi depuis la fiche commande (statut READY) et le client a un email
- **THEN** le système envoie l'email via Resend, crée un `Notification` avec `status = 'SENT'`, retourne HTTP 200

#### Scenario: Envoi bloqué — client sans email
- **WHEN** le styliste tente d'envoyer une notification mais `client.email` est null
- **THEN** le système retourne HTTP 422 avec `{ error: 'CLIENT_NO_EMAIL' }` et l'UI désactive le bouton avec un message explicatif

#### Scenario: Envoi bloqué — plan insuffisant
- **WHEN** un styliste Free tente d'envoyer une notification email
- **THEN** le système retourne HTTP 403 avec `{ error: 'PLAN_UPGRADE_REQUIRED', requiredPlan: 'STANDARD' }`

#### Scenario: Échec Resend API
- **WHEN** l'API Resend retourne une erreur
- **THEN** le système crée un `Notification` avec `status = 'FAILED'` et `errorMessage`, retourne HTTP 502

---

### Requirement: Stylist can send payment-reminder email to client
Le système SHALL permettre à un styliste d'envoyer un email de rappel de paiement à un client dont le `paymentStatus != 'PAID'`. L'email SHALL inclure le montant total, le montant payé, et le solde restant.

#### Scenario: Envoi réussi du rappel paiement
- **WHEN** le styliste déclenche l'envoi depuis une commande avec `paymentStatus = 'PARTIAL'` ou `'UNPAID'`
- **THEN** le système envoie l'email de rappel avec les montants corrects en FCFA

#### Scenario: Envoi bloqué — commande déjà soldée
- **WHEN** le styliste tente d'envoyer un rappel paiement sur une commande avec `paymentStatus = 'PAID'`
- **THEN** le système retourne HTTP 422 avec `{ error: 'ORDER_ALREADY_PAID' }`

---

### Requirement: Stylist can send pickup-reminder email to client
Le système SHALL permettre à un styliste d'envoyer un email de rappel de retrait à un client dont la commande a `status = 'READY'`.

#### Scenario: Envoi réussi du rappel retrait
- **WHEN** le styliste déclenche l'envoi depuis une commande avec `status = 'READY'`
- **THEN** le système envoie l'email de rappel mentionnant le type de vêtement et la date promise

---

### Requirement: Notification history is tracked per order
Le système SHALL enregistrer chaque tentative d'envoi de notification dans la table `Notification` (type, channel, status, sentAt, errorMessage). L'historique SHALL être visible sur la fiche commande.

#### Scenario: Historique des notifications sur la fiche commande
- **WHEN** le styliste consulte la fiche d'une commande ayant reçu des notifications
- **THEN** la section "Notifications" affiche la liste des envois avec date, type, et statut (envoyé/échoué)

#### Scenario: Isolation multi-tenant des notifications
- **WHEN** le styliste consulte l'historique de ses notifications
- **THEN** le système retourne uniquement les notifications de SES commandes
