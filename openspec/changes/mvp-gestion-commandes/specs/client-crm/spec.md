## MODIFIED Requirements

### Requirement: Styliste peut consulter les détails d'un client

Le système DOIT permettre au styliste de consulter les détails complets d'une fiche client, incluant ses mesures et commandes associées.

#### Scenario: Affichage détails client
- **WHEN** le styliste clique sur un client dans la liste
- **THEN** le système affiche tous les détails du client (nom, téléphone, email, notes, date de création)

#### Scenario: Affichage des mesures du client
- **WHEN** le styliste consulte les détails d'un client
- **THEN** le système affiche une section "Mesures" avec les dernières mesures corporelles enregistrées pour ce client

#### Scenario: Affichage des commandes du client
- **WHEN** le styliste consulte les détails d'un client
- **THEN** le système affiche une section "Commandes" avec la liste de toutes les commandes de ce client (en cours, prêtes, livrées)

#### Scenario: Accès rapide aux mesures
- **WHEN** le styliste consulte les détails d'un client
- **THEN** le système affiche un bouton "Prendre mesures" dans la section mesures

#### Scenario: Accès rapide aux commandes
- **WHEN** le styliste consulte les détails d'un client
- **THEN** le système affiche un bouton "Nouvelle commande" dans la section commandes
