## ADDED Requirements

### Requirement: Stylist can send a notification to a client from an order
Le système SHALL permettre à un styliste d'envoyer une notification email au client d'une commande depuis la fiche commande. Le styliste SHALL pouvoir choisir le type de notification : commande prête (`ORDER_READY`), rappel paiement (`PAYMENT_REMINDER`), ou rappel retrait (`PICKUP_REMINDER`). Le bouton SHALL être désactivé si le client n'a pas d'email.

#### Scenario: Bouton "Notifier" visible sur la fiche commande
- **WHEN** le styliste consulte une commande dont le client a un email
- **THEN** la fiche commande affiche un bouton "Notifier le client" avec une liste déroulante des types de notification disponibles

#### Scenario: Bouton "Notifier" désactivé sans email client
- **WHEN** le styliste consulte une commande dont le client n'a pas d'email
- **THEN** le bouton "Notifier" est affiché mais désactivé avec un tooltip "Ce client n'a pas d'adresse email"

#### Scenario: Notification envoyée avec succès depuis la fiche commande
- **WHEN** le styliste sélectionne un type de notification et confirme l'envoi
- **THEN** le système appelle `POST /api/orders/[id]/notify`, envoie l'email, et affiche un toast de confirmation

#### Scenario: Historique notifications visible sur la fiche commande
- **WHEN** le styliste consulte la section "Notifications" de la fiche commande
- **THEN** la liste des notifications envoyées s'affiche avec date, type, et statut (Envoyé / Échec)
