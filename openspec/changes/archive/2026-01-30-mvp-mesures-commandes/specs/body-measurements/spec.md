## Purpose

Permettre aux stylistes d'enregistrer, consulter et gérer l'historique des mesures corporelles de leurs clients. Les mesures sont essentielles pour la création de vêtements sur mesure et doivent être tracées dans le temps pour suivre l'évolution morphologique des clients.

## ADDED Requirements

### Requirement: System SHALL allow recording client body measurements

Le système doit permettre au styliste d'enregistrer les mesures corporelles d'un client avec un timestamp et des notes optionnelles.

#### Scenario: Recording measurements for a client
- **WHEN** le styliste sélectionne un client et clique sur "Prendre mesures"
- **THEN** le système affiche un formulaire avec les types de mesures standards (tour de poitrine, taille, hanches, etc.)

#### Scenario: Saving measurements successfully
- **WHEN** le styliste remplit au moins une mesure et clique sur "Enregistrer"
- **THEN** le système sauvegarde les mesures avec la date/heure actuelle et affiche un message de succès

#### Scenario: Adding custom measurement types
- **WHEN** le styliste ajoute un type de mesure personnalisé (ex: "Tour de poignet")
- **THEN** le système enregistre ce type personnalisé et le propose en autocomplete pour les futures prises de mesures

---

### Requirement: System SHALL provide standard measurement types

Le système doit proposer des types de mesures standards pré-définis pour faciliter la saisie.

#### Scenario: Display standard measurement types
- **WHEN** le styliste ouvre le formulaire de prise de mesures
- **THEN** le système affiche les types standards : Tour de poitrine, Tour de taille, Tour de hanches, Longueur d'épaule, Longueur de bras, Longueur de torse, Tour de cou, Longueur de jambe, Tour de cuisse

#### Scenario: All measurements are optional
- **WHEN** le styliste remplit uniquement certaines mesures (pas toutes)
- **THEN** le système enregistre uniquement les mesures renseignées sans erreur de validation

---

### Requirement: System SHALL maintain measurement history

Le système doit conserver un historique complet de toutes les prises de mesures pour chaque client, avec horodatage.

#### Scenario: Viewing measurement history
- **WHEN** le styliste consulte les mesures d'un client
- **THEN** le système affiche toutes les prises de mesures passées, triées de la plus récente à la plus ancienne

#### Scenario: Comparing measurements over time
- **WHEN** le styliste sélectionne deux dates dans l'historique
- **THEN** le système affiche côte à côte les mesures des deux dates avec indication des différences

#### Scenario: Latest measurements are highlighted
- **WHEN** le styliste consulte les mesures d'un client
- **THEN** le système met en évidence les mesures les plus récentes (dernière prise)

---

### Requirement: System SHALL allow updating measurements

Le styliste doit pouvoir modifier les mesures d'une prise existante ou créer une nouvelle prise de mesures.

#### Scenario: Creating new measurement entry
- **WHEN** le styliste clique sur "Nouvelle prise de mesures" depuis l'historique
- **THEN** le système ouvre un formulaire vierge pour une nouvelle entrée

#### Scenario: Editing existing measurements
- **WHEN** le styliste modifie une mesure existante et sauvegarde
- **THEN** le système met à jour l'entrée de mesures avec un timestamp de modification (updated_at)

---

### Requirement: System SHALL enforce multi-tenant isolation for measurements

Le système doit garantir que chaque styliste ne peut accéder qu'aux mesures de ses propres clients via Row Level Security.

#### Scenario: Styliste can only view own client measurements
- **WHEN** le styliste A tente d'accéder aux mesures d'un client du styliste B via API directe
- **THEN** le système retourne une erreur 404 (Not Found) grâce à RLS PostgreSQL

#### Scenario: Measurements are filtered by styliste
- **WHEN** le styliste consulte la liste des mesures
- **THEN** le système retourne uniquement les mesures liées aux clients de ce styliste

---

### Requirement: System SHALL validate measurement values

Le système doit valider que les valeurs de mesures sont des nombres positifs en centimètres.

#### Scenario: Accepting valid measurement values
- **WHEN** le styliste saisit une valeur numérique positive (ex: 95.5 cm)
- **THEN** le système accepte la valeur et l'enregistre

#### Scenario: Rejecting invalid measurement values
- **WHEN** le styliste saisit une valeur négative ou non numérique
- **THEN** le système affiche un message d'erreur "Valeur invalide. Veuillez saisir un nombre positif"

#### Scenario: Supporting decimal values
- **WHEN** le styliste saisit une valeur décimale (ex: 92.3)
- **THEN** le système accepte et enregistre la valeur avec précision

---

### Requirement: System SHALL allow adding notes to measurements

Le styliste doit pouvoir ajouter des notes contextuelles à une prise de mesures (ex: "Client a perdu du poids", "Grossesse").

#### Scenario: Adding notes to measurements
- **WHEN** le styliste saisit des notes dans le champ "Notes" et sauvegarde
- **THEN** le système enregistre les notes avec les mesures

#### Scenario: Notes are displayed in history
- **WHEN** le styliste consulte l'historique des mesures
- **THEN** le système affiche les notes associées à chaque prise de mesures

---

### Requirement: System SHALL display measurements on client detail page

Les mesures du client doivent être visibles directement sur la page de détail du client.

#### Scenario: Viewing latest measurements on client page
- **WHEN** le styliste consulte la page détail d'un client
- **THEN** le système affiche une section "Mesures" avec les dernières mesures du client

#### Scenario: Quick access to take measurements
- **WHEN** le styliste consulte la page détail d'un client
- **THEN** le système affiche un bouton "Prendre mesures" dans la section mesures

#### Scenario: Link to full measurement history
- **WHEN** le styliste clique sur "Voir historique" depuis la page client
- **THEN** le système affiche l'historique complet des mesures de ce client
