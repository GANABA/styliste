## Purpose

Système de templates de mesures customisables et versioning automatique de l'historique des mesures corporelles des clients pour remplacer les cahiers papier des stylistes.

## ADDED Requirements

### Requirement: Measurement template creation
Le système SHALL permettre aux stylistes de créer des templates de mesures personnalisés avec champs dynamiques.

#### Scenario: Create template page accessible
- **WHEN** un styliste navigue vers `/dashboard/clients/measurement-templates`
- **THEN** la page de gestion des templates MUST s'afficher

#### Scenario: Successful template creation
- **WHEN** un styliste crée un template avec nom et liste de champs
- **THEN** un nouvel enregistrement MUST être créé dans `measurement_templates` avec `stylist_id`

#### Scenario: Template name required
- **WHEN** un styliste tente de créer un template sans nom
- **THEN** le système MUST afficher une erreur "Le nom du template est obligatoire"

#### Scenario: Template must have at least one field
- **WHEN** un styliste tente de créer un template sans champs
- **THEN** le système MUST afficher une erreur "Au moins un champ de mesure est requis"

#### Scenario: Template field structure validation
- **WHEN** un champ de template est créé
- **THEN** il MUST avoir obligatoirement `name`, `label`, `unit` et `required` (booléen)

#### Scenario: Template fields stored as JSON
- **WHEN** un template est sauvegardé
- **THEN** les champs MUST être stockés dans la colonne `fields` au format JSON validé par Zod

### Requirement: Default measurement templates
Le système SHALL fournir 3 templates par défaut lors du premier accès au module mesures.

#### Scenario: Default templates seeded on first access
- **WHEN** un styliste accède pour la première fois à la page templates ET n'a aucun template
- **THEN** 3 templates par défaut MUST être créés automatiquement (Homme, Femme, Enfant)

#### Scenario: Template Homme default fields
- **WHEN** le template "Homme" par défaut est créé
- **THEN** il MUST contenir les champs : tour_poitrine, tour_taille, longueur_pantalon, tour_cou, longueur_manche, tour_hanche

#### Scenario: Template Femme default fields
- **WHEN** le template "Femme" par défaut est créé
- **THEN** il MUST contenir les champs : tour_poitrine, tour_taille, tour_hanche, longueur_robe, longueur_jupe, tour_bras

#### Scenario: Template Enfant default fields
- **WHEN** le template "Enfant" par défaut est créé
- **THEN** il MUST contenir les champs : tour_poitrine, tour_taille, hauteur, longueur_pantalon

#### Scenario: Default templates use centimeters
- **WHEN** les templates par défaut sont créés
- **THEN** tous les champs MUST avoir `unit: "cm"` (centimètres)

#### Scenario: Default templates skip if already exists
- **WHEN** un styliste a déjà des templates créés
- **THEN** le lazy seeding MUST être ignoré

### Requirement: Measurement template modification
Le système SHALL permettre de modifier un template de mesures existant.

#### Scenario: Edit template page accessible
- **WHEN** un styliste clique sur "Modifier" depuis la liste templates
- **THEN** un formulaire pré-rempli avec le template MUST s'afficher

#### Scenario: Successful template update
- **WHEN** un styliste modifie un template et soumet le formulaire
- **THEN** les changements MUST être sauvegardés dans la base de données

#### Scenario: Add field to existing template
- **WHEN** un styliste ajoute un nouveau champ à un template
- **THEN** le nouveau champ MUST être ajouté au JSON `fields`

#### Scenario: Remove field from template
- **WHEN** un styliste supprime un champ d'un template
- **THEN** le champ MUST être retiré du JSON `fields`

#### Scenario: Template modification affects future measurements only
- **WHEN** un template est modifié
- **THEN** les mesures déjà enregistrées avec ce template MUST rester inchangées (immutabilité)

#### Scenario: Access control on template modification
- **WHEN** un styliste tente de modifier un template qui ne lui appartient pas
- **THEN** le système MUST retourner une erreur 403 Forbidden

### Requirement: Measurement template deletion
Le système SHALL permettre de supprimer un template de mesures non utilisé.

#### Scenario: Delete unused template
- **WHEN** un styliste supprime un template qui n'a jamais été utilisé pour enregistrer des mesures
- **THEN** le template MUST être supprimé de la base de données

#### Scenario: Prevent deletion of used template
- **WHEN** un styliste tente de supprimer un template déjà utilisé dans `client_measurements`
- **THEN** le système MUST afficher une erreur "Ce template est utilisé par des mesures existantes"

#### Scenario: Soft delete template if used
- **WHEN** un template utilisé doit être archivé
- **THEN** il MUST être soft deleted avec `deleted_at` plutôt que supprimé définitivement

### Requirement: Template list display
Le système SHALL afficher la liste des templates de mesures du styliste.

#### Scenario: Template list page accessible
- **WHEN** un styliste navigue vers la page templates
- **THEN** la liste de tous ses templates MUST s'afficher

#### Scenario: Template list shows stylist's templates only
- **WHEN** la liste templates est affichée
- **THEN** seuls les templates avec `stylist_id` du styliste connecté MUST être visibles

#### Scenario: Template list displays essential info
- **WHEN** la liste templates est affichée
- **THEN** chaque template MUST montrer nom, nombre de champs, date de création

#### Scenario: Template usage count displayed
- **WHEN** un template est affiché dans la liste
- **THEN** le nombre de fois qu'il a été utilisé pour des mesures MUST être affiché

### Requirement: Client measurement recording
Le système SHALL permettre d'enregistrer les mesures d'un client avec un template sélectionné.

#### Scenario: Measurement form accessible from client detail
- **WHEN** un styliste est sur la page de détail client
- **THEN** un bouton "Prendre mesures" MUST être visible

#### Scenario: Template selection required
- **WHEN** un styliste clique sur "Prendre mesures"
- **THEN** il MUST sélectionner un template de mesures avant de saisir les valeurs

#### Scenario: Measurement form displays template fields
- **WHEN** un template est sélectionné
- **THEN** le formulaire MUST afficher tous les champs définis dans le template avec labels et unités

#### Scenario: Required fields validation
- **WHEN** un champ de template a `required: true`
- **THEN** le système MUST empêcher la soumission si ce champ est vide

#### Scenario: Numeric validation for measurements
- **WHEN** un styliste entre une valeur de mesure
- **THEN** le système MUST valider que c'est un nombre positif

#### Scenario: Successful measurement recording
- **WHEN** un styliste soumet le formulaire de mesures
- **THEN** un nouvel enregistrement MUST être créé dans `client_measurements` avec `client_id`, `template_id`, `measurements` (JSON), et `measured_at` (timestamp)

#### Scenario: Measurement date automatically set
- **WHEN** des mesures sont enregistrées
- **THEN** la colonne `measured_at` MUST être remplie avec la date/heure actuelle

#### Scenario: Measurements stored as JSON
- **WHEN** les mesures sont sauvegardées
- **THEN** elles MUST être stockées dans la colonne `measurements` au format JSON clé-valeur

### Requirement: Measurement history versioning
Le système SHALL créer un nouvel enregistrement à chaque prise de mesures (immutable history).

#### Scenario: New measurement creates new record
- **WHEN** un styliste enregistre de nouvelles mesures pour un client déjà mesuré
- **THEN** un NOUVEAU record MUST être créé (pas de mise à jour de l'existant)

#### Scenario: Multiple measurements for same client
- **WHEN** un client a plusieurs prises de mesures
- **THEN** tous les enregistrements MUST être conservés dans `client_measurements`

#### Scenario: Measurements ordered by date
- **WHEN** l'historique des mesures est récupéré
- **THEN** il MUST être trié par `measured_at DESC` (plus récent en premier)

#### Scenario: Latest measurement easily identified
- **WHEN** on affiche les dernières mesures d'un client
- **THEN** le système MUST requêter avec `ORDER BY measured_at DESC LIMIT 1`

### Requirement: Measurement history display
Le système SHALL afficher l'historique complet des mesures d'un client.

#### Scenario: Measurement history accessible from client detail
- **WHEN** un styliste est sur la page de détail client
- **THEN** un bouton "Voir historique mesures" MUST être visible

#### Scenario: History displays all measurements chronologically
- **WHEN** l'historique est affiché
- **THEN** toutes les prises de mesures MUST être listées avec date et template utilisé

#### Scenario: Latest measurements highlighted
- **WHEN** l'historique est affiché
- **THEN** les dernières mesures MUST être visuellement mises en évidence (badge "Actuel")

#### Scenario: Measurement details expandable
- **WHEN** un styliste clique sur une mesure dans l'historique
- **THEN** tous les détails (champs et valeurs) MUST s'afficher

#### Scenario: Empty history state
- **WHEN** un client n'a jamais été mesuré
- **THEN** un message MUST s'afficher "Aucune mesure enregistrée. Cliquez sur Prendre mesures."

### Requirement: Measurement comparison
Le système SHALL permettre de comparer visuellement deux prises de mesures.

#### Scenario: Compare measurements from history
- **WHEN** un styliste sélectionne 2 mesures dans l'historique
- **THEN** une vue comparative côte à côte MUST s'afficher

#### Scenario: Highlight differences between measurements
- **WHEN** deux mesures sont comparées
- **THEN** les champs avec valeurs différentes MUST être visuellement marqués

#### Scenario: Show measurement evolution
- **WHEN** deux mesures sont comparées
- **THEN** la différence numérique (+/-) MUST être affichée pour chaque champ

#### Scenario: Compare only same template measurements
- **WHEN** un styliste compare des mesures
- **THEN** seules les mesures utilisant le même template MUST être comparables

### Requirement: Multi-tenant isolation for templates
Le système SHALL garantir l'isolation stricte des templates entre stylistes.

#### Scenario: Template list filtered by stylist_id
- **WHEN** un styliste accède à sa liste templates
- **THEN** seuls ses templates (`stylist_id` correspondant) MUST être visibles

#### Scenario: Prevent cross-stylist template access
- **WHEN** un styliste tente d'accéder à un template d'un autre styliste
- **THEN** le système MUST retourner 403 Forbidden

#### Scenario: Template ID validation on measurement recording
- **WHEN** un styliste enregistre des mesures avec un template_id
- **THEN** le système MUST vérifier que le template appartient bien au styliste

### Requirement: Multi-tenant isolation for measurements
Le système SHALL garantir l'isolation stricte des mesures via client_id.

#### Scenario: Measurements accessible only via owned client
- **WHEN** un styliste accède aux mesures d'un client
- **THEN** le système MUST d'abord valider que le client appartient au styliste (`client.stylist_id`)

#### Scenario: Prevent cross-stylist measurement access
- **WHEN** un styliste tente d'accéder aux mesures d'un client d'un autre styliste
- **THEN** le système MUST retourner 403 Forbidden

### Requirement: Measurement data type safety
Le système SHALL valider les données de mesures avec Zod pour garantir la cohérence.

#### Scenario: Template fields schema validated
- **WHEN** un template est créé ou modifié
- **THEN** le JSON `fields` MUST être validé contre un schéma Zod strict

#### Scenario: Measurement values schema validated
- **WHEN** des mesures sont enregistrées
- **THEN** le JSON `measurements` MUST être validé contre le schéma du template utilisé

#### Scenario: Invalid JSON rejected
- **WHEN** des données JSON invalides sont soumises
- **THEN** le système MUST retourner une erreur 400 Bad Request avec détails de validation

### Requirement: Mobile-first measurement input
Le système SHALL optimiser la saisie de mesures pour smartphone.

#### Scenario: Numeric keyboard for measurements
- **WHEN** un champ de mesure est focusé sur mobile
- **THEN** le clavier numérique MUST s'afficher (input type="number")

#### Scenario: Large input fields on mobile
- **WHEN** le formulaire de mesures est affiché sur mobile
- **THEN** les champs MUST avoir une hauteur minimale de 44px

#### Scenario: Unit displayed next to input
- **WHEN** un champ de mesure est affiché
- **THEN** l'unité (cm, pouces) MUST être visible à droite du champ

#### Scenario: Quick save on mobile
- **WHEN** un styliste saisit des mesures sur mobile
- **THEN** un bouton "Enregistrer" fixe en bas d'écran MUST être visible

### Requirement: Performance optimization for measurements
Le système SHALL optimiser les requêtes de mesures pour performance sur 3G.

#### Scenario: Measurements lazy loaded
- **WHEN** la page de détail client est affichée
- **THEN** l'historique complet des mesures MUST être chargé uniquement si demandé

#### Scenario: Latest measurements eagerly loaded
- **WHEN** la page de détail client est affichée
- **THEN** seules les dernières mesures MUST être chargées automatiquement

#### Scenario: Index on client_id for performance
- **WHEN** les mesures d'un client sont requêtées
- **THEN** la requête MUST utiliser l'index sur `client_measurements.client_id`

#### Scenario: Pagination for large history
- **WHEN** un client a plus de 20 prises de mesures
- **THEN** l'historique MUST être paginé par 20
