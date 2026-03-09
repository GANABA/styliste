## ADDED Requirements

### Requirement: Enregistrement d'un paiement sur une commande
Le système SHALL permettre au styliste d'enregistrer un paiement sur une commande existante en spécifiant le montant, le type (avance/partiel/solde) et la méthode de paiement.

#### Scenario: Enregistrement d'une avance
- **WHEN** le styliste soumet un paiement de type "avance" avec un montant valide sur une commande
- **THEN** le paiement est créé en base, le champ `total_paid` de la commande est mis à jour, et le `payment_status` passe à "PARTIAL" si le montant est inférieur au total

#### Scenario: Enregistrement du solde final
- **WHEN** le styliste enregistre un paiement dont le cumul atteint ou dépasse le `total_price` de la commande
- **THEN** le `payment_status` de la commande passe à "PAID"

#### Scenario: Montant invalide
- **WHEN** le styliste soumet un paiement avec un montant négatif ou nul
- **THEN** le système retourne une erreur de validation et n'enregistre aucun paiement

### Requirement: Historique des paiements par commande
Le système SHALL afficher la liste chronologique de tous les paiements d'une commande avec leur montant, type, méthode et date.

#### Scenario: Affichage de l'historique
- **WHEN** le styliste consulte la fiche d'une commande ayant des paiements enregistrés
- **THEN** la section paiement affiche chaque paiement avec : montant, type, méthode, date, et le solde restant dû

#### Scenario: Commande sans paiement
- **WHEN** la commande n'a aucun paiement enregistré
- **THEN** la section paiement affiche le montant total dû et un bouton pour enregistrer le premier paiement

### Requirement: Historique global des paiements
Le système SHALL fournir une page listant tous les paiements du styliste, toutes commandes confondues, avec filtres et total.

#### Scenario: Accès à l'historique global
- **WHEN** le styliste accède à `/dashboard/payments`
- **THEN** il voit la liste de tous ses paiements triés par date décroissante, avec le numéro de commande, le client, le montant et la méthode

#### Scenario: Isolation multi-tenant
- **WHEN** l'API `GET /api/payments` est appelée
- **THEN** seuls les paiements liés au styliste authentifié sont retournés

### Requirement: Génération de reçu PDF
Le système SHALL générer un reçu PDF téléchargeable pour chaque paiement enregistré.

#### Scenario: Téléchargement du reçu
- **WHEN** le styliste clique sur "Télécharger le reçu" pour un paiement
- **THEN** le système génère et retourne un PDF contenant : nom du styliste, nom du client, numéro de commande, montant payé, méthode, date, et solde restant

#### Scenario: Reçu inaccessible à un autre styliste
- **WHEN** un styliste tente d'accéder au reçu d'un paiement qui ne lui appartient pas
- **THEN** le système retourne une erreur 403

### Requirement: Méthodes de paiement supportées
Le système SHALL accepter les méthodes : Cash, Mobile Money (MTN/Moov/Orange), Virement bancaire.

#### Scenario: Sélection Mobile Money
- **WHEN** le styliste sélectionne "Mobile Money" comme méthode
- **THEN** un champ optionnel "Opérateur" (MTN / Moov / Orange) et "Numéro" apparaissent dans le formulaire
