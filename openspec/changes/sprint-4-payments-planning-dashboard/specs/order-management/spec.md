## MODIFIED Requirements

### Requirement: Affichage du récapitulatif de paiement sur la fiche commande
La fiche commande SHALL afficher un récapitulatif paiement intégré montrant : prix total, total payé, solde restant dû, et le statut de paiement actuel (`payment_status`). Ce récapitulatif SHALL être mis à jour en temps réel après chaque enregistrement de paiement.

#### Scenario: Commande non payée
- **WHEN** le styliste consulte une commande avec `payment_status = UNPAID`
- **THEN** la section paiement affiche "0 FCFA payé / [total] FCFA dû" avec un badge rouge "Non payé" et un bouton "Enregistrer un paiement"

#### Scenario: Commande partiellement payée
- **WHEN** le styliste consulte une commande avec `payment_status = PARTIAL`
- **THEN** la section paiement affiche le total payé, le solde restant et un badge orange "Partiel"

#### Scenario: Commande soldée
- **WHEN** le styliste consulte une commande avec `payment_status = PAID`
- **THEN** la section paiement affiche "Soldé" avec un badge vert et masque le bouton "Enregistrer un paiement"
