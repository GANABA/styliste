## Purpose

Infrastructure de base de données PostgreSQL avec Prisma ORM, migrations versionnées, et tables essentielles pour l'architecture multi-tenant SaaS de Styliste.com.

## ADDED Requirements

### Requirement: Prisma ORM initialization
Le système SHALL initialiser Prisma ORM avec PostgreSQL comme provider et générer le client Prisma typé.

#### Scenario: Prisma initialized successfully
- **WHEN** Prisma est initialisé via `npx prisma init`
- **THEN** le fichier `prisma/schema.prisma` MUST être créé avec la configuration de base

#### Scenario: PostgreSQL provider configured
- **WHEN** le schéma Prisma est configuré
- **THEN** le datasource MUST spécifier `provider = "postgresql"`

#### Scenario: Prisma client generator configured
- **WHEN** le schéma Prisma est configuré
- **THEN** le generator MUST être configuré avec `provider = "prisma-client-js"`

### Requirement: Neon PostgreSQL database creation
Le système SHALL utiliser Neon comme provider PostgreSQL managé avec une instance de développement configurée.

#### Scenario: Neon database instance created
- **WHEN** l'infrastructure database est créée
- **THEN** une instance Neon PostgreSQL MUST exister avec le nom "styliste-dev"

#### Scenario: Database URL configured
- **WHEN** la base de données Neon est créée
- **THEN** la variable `DATABASE_URL` MUST être configurée dans `.env.local` avec la connection string Neon

#### Scenario: Database connection successful
- **WHEN** Prisma tente de se connecter à la base de données
- **THEN** la connexion MUST réussir sans erreurs

### Requirement: Multi-tenant schema foundation
Le système SHALL implémenter le schéma de base multi-tenant avec les tables essentielles incluant isolation par `stylist_id`.

#### Scenario: User table created
- **WHEN** le schéma est migré
- **THEN** la table `users` MUST exister avec les colonnes: `id` (UUID), `email` (unique), `password`, `name`, `role`, `created_at`, `updated_at`

#### Scenario: Stylist table created
- **WHEN** le schéma est migré
- **THEN** la table `stylists` MUST exister avec les colonnes: `id` (UUID), `user_id` (FK vers users), `business_name`, `phone`, `city`, `address`, `created_at`, `updated_at`

#### Scenario: SubscriptionPlan table created
- **WHEN** le schéma est migré
- **THEN** la table `subscription_plans` MUST exister avec les colonnes: `id` (UUID), `name`, `price`, `features` (JSON), `limits` (JSON), `is_active`, `created_at`, `updated_at`

#### Scenario: Subscription table created
- **WHEN** le schéma est migré
- **THEN** la table `subscriptions` MUST exister avec les colonnes: `id` (UUID), `stylist_id` (FK), `plan_id` (FK), `status`, `current_period_start`, `current_period_end`, `created_at`, `updated_at`

#### Scenario: Stylist ID foreign key on subscriptions
- **WHEN** une subscription est créée
- **THEN** elle MUST avoir une foreign key `stylist_id` référençant la table `stylists`

### Requirement: NextAuth database tables
Le système SHALL créer les tables requises par NextAuth avec Prisma Adapter pour la gestion des sessions et tokens.

#### Scenario: Session table created
- **WHEN** le schéma NextAuth est migré
- **THEN** la table `sessions` MUST exister avec les colonnes: `id` (UUID), `session_token` (unique), `user_id` (FK), `expires`, `created_at`, `updated_at`

#### Scenario: VerificationToken table created
- **WHEN** le schéma NextAuth est migré
- **THEN** la table `verification_tokens` MUST exister avec les colonnes: `identifier`, `token` (unique), `expires`

#### Scenario: Account table created
- **WHEN** le schéma NextAuth est migré
- **THEN** la table `accounts` MUST exister pour supporter OAuth providers (future V1)

### Requirement: Database constraints and indexes
Le système SHALL implémenter les contraintes d'intégrité et les index de performance requis pour l'architecture multi-tenant.

#### Scenario: Unique email constraint
- **WHEN** un utilisateur est créé
- **THEN** la colonne `email` dans `users` MUST avoir une contrainte unique

#### Scenario: Unique session token constraint
- **WHEN** une session est créée
- **THEN** la colonne `session_token` dans `sessions` MUST avoir une contrainte unique

#### Scenario: Index on stylist_id for performance
- **WHEN** les tables tenant-scoped sont créées
- **THEN** un index MUST exister sur la colonne `stylist_id` pour optimiser les requêtes filtrées

#### Scenario: User email index
- **WHEN** la table users est créée
- **THEN** un index MUST exister sur `email` pour optimiser les requêtes de login

### Requirement: Prisma migrations versioning
Le système SHALL utiliser Prisma Migrate pour versionner les changements de schéma avec rollback capabilities.

#### Scenario: Initial migration created
- **WHEN** la première migration est créée via `npx prisma migrate dev --name init`
- **THEN** un fichier SQL MUST être généré dans `prisma/migrations/` avec le nom contenant "init"

#### Scenario: Migration applied successfully
- **WHEN** une migration est appliquée
- **THEN** la base de données MUST être mise à jour avec les changements du schéma

#### Scenario: Prisma client regenerated
- **WHEN** une migration est appliquée
- **THEN** le client Prisma MUST être régénéré automatiquement avec les nouveaux types

### Requirement: Prisma client singleton
Le système SHALL implémenter un singleton Prisma Client pour éviter les connexions multiples en développement.

#### Scenario: Prisma client singleton created
- **WHEN** le fichier `lib/prisma.ts` est créé
- **THEN** il MUST exporter une instance unique de PrismaClient

#### Scenario: Development hot reload handled
- **WHEN** le serveur de développement redémarre
- **THEN** le singleton MUST réutiliser la même connexion PrismaClient au lieu d'en créer une nouvelle

### Requirement: Database seeding
Le système SHALL fournir un script de seed pour peupler la base de données avec les données initiales requises.

#### Scenario: Seed script configured
- **WHEN** le package.json est configuré
- **THEN** un script `prisma.seed` MUST pointer vers `ts-node prisma/seed.ts`

#### Scenario: Subscription plans seeded
- **WHEN** le seed script est exécuté via `npx prisma db seed`
- **THEN** les 3 plans de base (Découverte, Standard, Pro) MUST être créés dans `subscription_plans`

#### Scenario: Admin user seeded
- **WHEN** le seed script est exécuté
- **THEN** un utilisateur admin de test MUST être créé dans `users` avec email et password connus

### Requirement: Database backup strategy
Le système SHALL documenter la stratégie de backup en utilisant les backups automatiques Neon pour le MVP.

#### Scenario: Backup strategy documented
- **WHEN** la documentation d'infrastructure est créée
- **THEN** la stratégie de backup MUST être documentée (Neon automated backups avec 7 jours de rétention)

### Requirement: Soft delete capability
Le système SHALL implémenter la capacité de soft delete avec colonne `deleted_at` sur les tables appropriées.

#### Scenario: Deleted_at column on users
- **WHEN** la table users est créée
- **THEN** elle MUST inclure une colonne `deleted_at` nullable de type DateTime

#### Scenario: Deleted_at column on stylists
- **WHEN** la table stylists est créée
- **THEN** elle MUST inclure une colonne `deleted_at` nullable de type DateTime

### Requirement: Timestamp tracking
Le système SHALL suivre automatiquement les timestamps de création et modification sur toutes les tables.

#### Scenario: Created_at timestamp
- **WHEN** une table est créée
- **THEN** elle MUST inclure une colonne `created_at` avec default value `now()`

#### Scenario: Updated_at timestamp
- **WHEN** une table est créée
- **THEN** elle MUST inclure une colonne `updated_at` avec mise à jour automatique via `@updatedAt` Prisma

### Requirement: UUID as primary keys
Le système SHALL utiliser des UUIDs v4 comme clés primaires pour toutes les tables au lieu d'entiers auto-incrémentés.

#### Scenario: User ID is UUID
- **WHEN** un utilisateur est créé
- **THEN** son `id` MUST être un UUID v4 généré automatiquement

#### Scenario: Stylist ID is UUID
- **WHEN** un styliste est créé
- **THEN** son `id` MUST être un UUID v4 généré automatiquement

#### Scenario: Default UUID generation
- **WHEN** une nouvelle entité est créée sans ID spécifié
- **THEN** Prisma MUST générer automatiquement un UUID v4 via `@default(uuid())`
