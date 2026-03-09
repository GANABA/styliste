## ADDED Requirements

### Requirement: Routes admin protégées par rôle ADMIN
Le système SHALL bloquer l'accès à toutes les routes `/admin/*` et `/api/admin/*` pour tout utilisateur dont le rôle n'est pas `ADMIN`.

#### Scenario: Accès refusé à un utilisateur standard
- **WHEN** un utilisateur avec `role = "USER"` tente d'accéder à `/admin/dashboard`
- **THEN** le middleware redirige vers `/dashboard` avec un message d'accès refusé

#### Scenario: Accès autorisé pour un admin
- **WHEN** un utilisateur avec `role = "ADMIN"` accède à `/admin/dashboard`
- **THEN** le système affiche le dashboard admin sans redirection

### Requirement: Dashboard admin affiche les statistiques globales de la plateforme
Le système SHALL afficher sur `/admin/dashboard` les métriques clés : nombre total de stylistes, stylistes actifs (connectés dans les 7 derniers jours), revenus simulés (total des abonnements payants), répartition des plans.

#### Scenario: KPIs globaux affichés
- **WHEN** l'admin accède au dashboard
- **THEN** le système affiche : total stylistes inscrits, stylistes actifs 7j, répartition par plan (Découverte/Standard/Pro/Premium), nombre total de commandes créées sur la plateforme

#### Scenario: Données en temps réel
- **WHEN** l'admin actualise le dashboard
- **THEN** les statistiques reflètent l'état actuel de la base de données (pas de cache stale)

### Requirement: Admin peut consulter et filtrer la liste des stylistes
Le système SHALL afficher sur `/admin/stylists` un tableau paginé de tous les stylistes avec filtres par plan et statut.

#### Scenario: Liste paginée des stylistes
- **WHEN** l'admin accède à `/admin/stylists`
- **THEN** le système affiche un tableau avec : nom, email, plan actuel, date d'inscription, statut (actif/suspendu), nombre de clients, nombre de commandes

#### Scenario: Filtrage par plan
- **WHEN** l'admin sélectionne le filtre "Pro" dans la liste
- **THEN** seuls les stylistes avec le plan Pro sont affichés

#### Scenario: Recherche par nom ou email
- **WHEN** l'admin tape un terme dans le champ de recherche
- **THEN** la liste est filtrée en temps réel par nom ou email du styliste

### Requirement: Admin peut modifier le plan d'un styliste
Le système SHALL permettre à l'admin de changer le plan d'abonnement d'un styliste directement depuis son profil admin.

#### Scenario: Changement de plan par l'admin
- **WHEN** l'admin sélectionne un nouveau plan dans le dropdown de la fiche styliste et confirme
- **THEN** le système met à jour le plan via `PUT /api/admin/stylists/[id]` et enregistre l'action dans `AuditLog`

### Requirement: Admin peut suspendre et réactiver un styliste
Le système SHALL permettre à l'admin de suspendre un compte styliste (blocage de connexion) ou de le réactiver.

#### Scenario: Suspension d'un styliste
- **WHEN** l'admin clique "Suspendre" sur un styliste actif et confirme
- **THEN** le système met à jour `user.suspended = true`, empêche les futures connexions de ce compte, et enregistre l'action dans `AuditLog`

#### Scenario: Réactivation d'un styliste suspendu
- **WHEN** l'admin clique "Réactiver" sur un styliste suspendu
- **THEN** le système remet `user.suspended = false` et enregistre l'action dans `AuditLog`

#### Scenario: Tentative de connexion d'un compte suspendu
- **WHEN** un styliste suspendu tente de se connecter
- **THEN** NextAuth retourne une erreur d'authentification avec le message "Votre compte est suspendu. Contactez le support."

### Requirement: Les actions sensibles admin sont enregistrées dans un log d'audit
Le système SHALL créer un enregistrement `AuditLog` pour chaque action sensible effectuée par un admin (suspension, réactivation, changement de plan).

#### Scenario: Log créé à chaque action admin
- **WHEN** l'admin effectue une action sensible (suspension/réactivation/changement de plan)
- **THEN** un enregistrement `AuditLog` est créé avec : adminId, action (ex. "SUSPEND_STYLIST"), targetType ("stylist"), targetId, timestamp
