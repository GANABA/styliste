## ADDED Requirements

### Requirement: Client table creation
Le système SHALL créer une table `clients` pour stocker les informations des clients des stylistes avec isolation multi-tenant.

#### Scenario: Clients table created
- **WHEN** la migration Prisma est appliquée
- **THEN** la table `clients` MUST exister avec les colonnes: `id` (UUID), `stylist_id` (FK), `name`, `phone`, `email`, `address`, `city`, `notes`, `created_at`, `updated_at`, `deleted_at`

#### Scenario: Client ID is UUID
- **WHEN** un client est créé
- **THEN** son `id` MUST être un UUID v4 généré automatiquement via `@default(uuid())`

#### Scenario: Stylist ID foreign key on clients
- **WHEN** un client est créé
- **THEN** il MUST avoir une foreign key `stylist_id` référençant la table `stylists`

#### Scenario: Client name required
- **WHEN** la table clients est créée
- **THEN** la colonne `name` MUST être NOT NULL

#### Scenario: Client phone required
- **WHEN** la table clients est créée
- **THEN** la colonne `phone` MUST être NOT NULL

#### Scenario: Client email optional
- **WHEN** la table clients est créée
- **THEN** la colonne `email` MUST être nullable

#### Scenario: Client soft delete column
- **WHEN** la table clients est créée
- **THEN** elle MUST inclure une colonne `deleted_at` nullable de type DateTime

#### Scenario: Client timestamps automatic
- **WHEN** la table clients est créée
- **THEN** elle MUST inclure `created_at` avec default `now()` et `updated_at` avec `@updatedAt`

#### Scenario: Index on client stylist_id
- **WHEN** la table clients est créée
- **THEN** un index MUST être créé sur `stylist_id` pour performance multi-tenant

#### Scenario: Cascade delete on stylist deletion
- **WHEN** un styliste est supprimé
- **THEN** ses clients MUST être supprimés en cascade (onDelete: Cascade)

### Requirement: Measurement templates table creation
Le système SHALL créer une table `measurement_templates` pour stocker les templates de mesures customisables par styliste.

#### Scenario: Measurement templates table created
- **WHEN** la migration Prisma est appliquée
- **THEN** la table `measurement_templates` MUST exister avec les colonnes: `id` (UUID), `stylist_id` (FK), `name`, `fields` (JSON), `created_at`, `updated_at`, `deleted_at`

#### Scenario: Template ID is UUID
- **WHEN** un template est créé
- **THEN** son `id` MUST être un UUID v4 généré automatiquement

#### Scenario: Template stylist_id foreign key
- **WHEN** un template est créé
- **THEN** il MUST avoir une foreign key `stylist_id` référençant la table `stylists`

#### Scenario: Template name required
- **WHEN** la table measurement_templates est créée
- **THEN** la colonne `name` MUST être NOT NULL

#### Scenario: Template fields stored as JSON
- **WHEN** la table measurement_templates est créée
- **THEN** la colonne `fields` MUST être de type JSON pour stocker la structure dynamique

#### Scenario: Template soft delete column
- **WHEN** la table measurement_templates est créée
- **THEN** elle MUST inclure une colonne `deleted_at` nullable

#### Scenario: Index on template stylist_id
- **WHEN** la table measurement_templates est créée
- **THEN** un index MUST être créé sur `stylist_id`

#### Scenario: Cascade delete templates on stylist deletion
- **WHEN** un styliste est supprimé
- **THEN** ses templates MUST être supprimés en cascade

### Requirement: Client measurements table creation
Le système SHALL créer une table `client_measurements` pour stocker l'historique versionné des mesures clients.

#### Scenario: Client measurements table created
- **WHEN** la migration Prisma est appliquée
- **THEN** la table `client_measurements` MUST exister avec les colonnes: `id` (UUID), `client_id` (FK), `template_id` (FK), `measurements` (JSON), `measured_at`, `created_at`, `updated_at`

#### Scenario: Measurement ID is UUID
- **WHEN** des mesures sont enregistrées
- **THEN** leur `id` MUST être un UUID v4 généré automatiquement

#### Scenario: Measurement client_id foreign key
- **WHEN** des mesures sont enregistrées
- **THEN** elles MUST avoir une foreign key `client_id` référençant la table `clients`

#### Scenario: Measurement template_id foreign key
- **WHEN** des mesures sont enregistrées
- **THEN** elles MUST avoir une foreign key `template_id` référençant la table `measurement_templates`

#### Scenario: Measurements stored as JSON
- **WHEN** la table client_measurements est créée
- **THEN** la colonne `measurements` MUST être de type JSON pour stocker les valeurs dynamiques

#### Scenario: Measured_at timestamp required
- **WHEN** la table client_measurements est créée
- **THEN** la colonne `measured_at` MUST être NOT NULL de type DateTime

#### Scenario: No soft delete on measurements
- **WHEN** la table client_measurements est créée
- **THEN** elle NE DOIT PAS avoir de colonne `deleted_at` (historique immutable)

#### Scenario: Index on measurement client_id
- **WHEN** la table client_measurements est créée
- **THEN** un index MUST être créé sur `client_id` pour requêtes rapides d'historique

#### Scenario: Index on measurement template_id
- **WHEN** la table client_measurements est créée
- **THEN** un index MUST être créé sur `template_id` pour statistiques templates

#### Scenario: Cascade delete measurements on client deletion
- **WHEN** un client est supprimé
- **THEN** ses mesures MUST être supprimées en cascade

#### Scenario: Restrict delete template if used
- **WHEN** un template est référencé dans client_measurements
- **THEN** la suppression MUST échouer (onDelete: Restrict) pour préserver l'historique

### Requirement: Prisma enums for Sprint 2
Le système SHALL définir les enums Prisma nécessaires si applicable au Sprint 2.

#### Scenario: No new enums required for Sprint 2
- **WHEN** le schéma Sprint 2 est analysé
- **THEN** aucun nouveau enum Prisma ne doit être créé (utilise types existants et JSON)

### Requirement: Migration naming convention
Le système SHALL suivre la convention de nommage des migrations Prisma.

#### Scenario: Migration named descriptively
- **WHEN** la migration Sprint 2 est créée
- **THEN** elle MUST être nommée `add_clients_measurements_tables` ou similaire

#### Scenario: Migration file generated
- **WHEN** `npx prisma migrate dev --name add_clients_measurements_tables` est exécuté
- **THEN** un fichier SQL MUST être généré dans `prisma/migrations/`

### Requirement: Database indexes optimization
Le système SHALL créer les indexes nécessaires pour optimiser les requêtes multi-tenant et historique.

#### Scenario: Composite index on clients for search
- **WHEN** la table clients est créée
- **THEN** un index MUST être créé sur `(stylist_id, deleted_at)` pour filtrage rapide actifs/archivés

#### Scenario: Index on client name for search
- **WHEN** la table clients est créée
- **THEN** un index MUST être créé sur `name` pour recherche textuelle

#### Scenario: Index on client phone for search
- **WHEN** la table clients est créée
- **THEN** un index MUST être créé sur `phone` pour recherche par numéro

#### Scenario: Composite index on measurements for history
- **WHEN** la table client_measurements est créée
- **THEN** un index MUST être créé sur `(client_id, measured_at DESC)` pour récupération rapide des dernières mesures

### Requirement: JSON field type validation
Le système SHALL utiliser le type JSON natif de PostgreSQL pour flexibilité et performance.

#### Scenario: JSON type for template fields
- **WHEN** le schéma Prisma est défini
- **THEN** `measurement_templates.fields` MUST utiliser le type `Json` de Prisma

#### Scenario: JSON type for measurement values
- **WHEN** le schéma Prisma est défini
- **THEN** `client_measurements.measurements` MUST utiliser le type `Json` de Prisma

#### Scenario: JSON validation in application layer
- **WHEN** des données JSON sont écrites
- **THEN** la validation MUST être effectuée avec Zod côté application (Prisma ne valide pas le contenu JSON)

### Requirement: Foreign key constraints with appropriate actions
Le système SHALL configurer les actions de foreign keys pour préserver l'intégrité des données.

#### Scenario: Client cascade on stylist delete
- **WHEN** la relation clients-stylists est définie
- **THEN** elle MUST utiliser `onDelete: Cascade` (suppression styliste = suppression clients)

#### Scenario: Measurements cascade on client delete
- **WHEN** la relation client_measurements-clients est définie
- **THEN** elle MUST utiliser `onDelete: Cascade` (suppression client = suppression mesures)

#### Scenario: Measurements restrict on template delete
- **WHEN** la relation client_measurements-measurement_templates est définie
- **THEN** elle MUST utiliser `onDelete: Restrict` (empêcher suppression template utilisé)

### Requirement: Prisma client regeneration
Le système SHALL régénérer le client Prisma après migration pour typage TypeScript.

#### Scenario: Prisma client includes new models
- **WHEN** la migration est appliquée et `npx prisma generate` est exécuté
- **THEN** le client Prisma MUST inclure les types `Client`, `MeasurementTemplate`, `ClientMeasurement`

#### Scenario: Prisma types include JSON fields
- **WHEN** le client Prisma est généré
- **THEN** les types TypeScript MUST typer `fields` et `measurements` comme `Prisma.JsonValue`

### Requirement: Database migration rollback capability
Le système SHALL permettre le rollback de la migration Sprint 2 si nécessaire.

#### Scenario: Migration reversible
- **WHEN** la migration Sprint 2 pose problème
- **THEN** elle MUST pouvoir être rollback avec `npx prisma migrate resolve --rolled-back`

#### Scenario: No breaking changes to existing tables
- **WHEN** la migration Sprint 2 est appliquée
- **THEN** elle MUST ajouter uniquement de nouvelles tables sans modifier les tables existantes (Sprint 1)
