## Purpose

Gestion complète du cycle de vie des clients pour les stylistes incluant création, modification, recherche, archivage avec isolation multi-tenant stricte et validation des limites d'abonnement.

## ADDED Requirements

### Requirement: Client creation
Le système SHALL permettre aux stylistes de créer des fiches clients avec informations de contact et notes personnelles.

#### Scenario: Successful client creation
- **WHEN** un styliste soumet le formulaire de création client avec nom et téléphone
- **THEN** un nouveau client MUST être créé dans la table `clients` avec `stylist_id` du styliste connecté

#### Scenario: Client creation with all optional fields
- **WHEN** un styliste crée un client avec nom, téléphone, email, adresse et notes
- **THEN** toutes les informations MUST être sauvegardées dans la base de données

#### Scenario: Client creation requires name
- **WHEN** un styliste tente de créer un client sans nom
- **THEN** le système MUST afficher une erreur "Le nom est obligatoire"

#### Scenario: Client creation requires phone
- **WHEN** un styliste tente de créer un client sans téléphone
- **THEN** le système MUST afficher une erreur "Le téléphone est obligatoire"

#### Scenario: Phone number format validation
- **WHEN** un styliste entre un numéro de téléphone
- **THEN** le système MUST accepter les formats internationaux (+229, 00229) et locaux (sans préfixe)

#### Scenario: Email format validation
- **WHEN** un styliste entre une adresse email
- **THEN** le système MUST valider que l'email a un format valide ou être vide

#### Scenario: Client associated with stylist
- **WHEN** un client est créé
- **THEN** il MUST avoir une foreign key `stylist_id` référençant le styliste connecté

### Requirement: Client list display
Le système SHALL afficher la liste des clients du styliste avec pagination et recherche.

#### Scenario: Client list page accessible
- **WHEN** un styliste navigue vers `/dashboard/clients`
- **THEN** la page de liste des clients MUST s'afficher

#### Scenario: Client list shows stylist's clients only
- **WHEN** un styliste accède à sa liste clients
- **THEN** seuls les clients avec `stylist_id` correspondant MUST être affichés

#### Scenario: Client list pagination
- **WHEN** un styliste a plus de 50 clients
- **THEN** la liste MUST être paginée avec 50 clients par page

#### Scenario: Client list displays essential info
- **WHEN** la liste des clients est affichée
- **THEN** chaque client MUST montrer nom, téléphone, ville (si renseignée), et date de dernière modification

#### Scenario: Empty state for new stylist
- **WHEN** un styliste n'a aucun client
- **THEN** un message MUST s'afficher avec un bouton "Créer mon premier client"

#### Scenario: Client list responsive layout
- **WHEN** la liste est affichée sur mobile (< 768px)
- **THEN** les clients MUST être affichés en cards empilées

#### Scenario: Client list table on desktop
- **WHEN** la liste est affichée sur desktop (≥ 768px)
- **THEN** les clients MUST être affichés dans une table avec colonnes triables

### Requirement: Client search and filtering
Le système SHALL permettre de rechercher des clients par nom ou téléphone et filtrer par statut.

#### Scenario: Search clients by name
- **WHEN** un styliste entre un texte dans la barre de recherche
- **THEN** le système MUST filtrer les clients dont le nom contient le texte (insensible à la casse)

#### Scenario: Search clients by phone
- **WHEN** un styliste entre des chiffres dans la barre de recherche
- **THEN** le système MUST filtrer les clients dont le téléphone contient ces chiffres

#### Scenario: Search with debounce
- **WHEN** un styliste tape dans la barre de recherche
- **THEN** la recherche MUST attendre 300ms après le dernier caractère avant d'exécuter

#### Scenario: Filter active clients
- **WHEN** un styliste sélectionne le filtre "Actifs"
- **THEN** seuls les clients avec `deleted_at = NULL` MUST être affichés

#### Scenario: Filter archived clients
- **WHEN** un styliste sélectionne le filtre "Archivés"
- **THEN** seuls les clients avec `deleted_at != NULL` MUST être affichés

#### Scenario: Combined search and filter
- **WHEN** un styliste utilise la recherche ET un filtre
- **THEN** les résultats MUST respecter les deux critères

### Requirement: Client detail view
Le système SHALL afficher tous les détails d'un client avec ses mesures et historique.

#### Scenario: Client detail page accessible
- **WHEN** un styliste clique sur un client dans la liste
- **THEN** la page `/dashboard/clients/[id]` MUST s'afficher avec tous les détails

#### Scenario: Client detail shows all information
- **WHEN** la page de détail est affichée
- **THEN** elle MUST afficher nom, téléphone, email, adresse, notes, date de création, dernière modification

#### Scenario: Client detail shows latest measurements
- **WHEN** le client a des mesures enregistrées
- **THEN** les dernières mesures MUST être affichées avec la date de prise

#### Scenario: Access control on client detail
- **WHEN** un styliste tente d'accéder à la page d'un client qui ne lui appartient pas
- **THEN** le système MUST retourner une erreur 403 Forbidden

### Requirement: Client modification
Le système SHALL permettre de modifier les informations d'un client existant.

#### Scenario: Edit client page accessible
- **WHEN** un styliste clique sur "Modifier" depuis la page de détail
- **THEN** un formulaire pré-rempli MUST s'afficher

#### Scenario: Successful client update
- **WHEN** un styliste modifie les informations et soumet le formulaire
- **THEN** les changements MUST être sauvegardés dans la base de données

#### Scenario: Updated_at timestamp automatic
- **WHEN** un client est modifié
- **THEN** la colonne `updated_at` MUST être mise à jour automatiquement

#### Scenario: Name and phone still required on update
- **WHEN** un styliste tente de modifier un client en vidant nom ou téléphone
- **THEN** le système MUST afficher une erreur de validation

#### Scenario: Access control on client update
- **WHEN** un styliste tente de modifier un client qui ne lui appartient pas
- **THEN** le système MUST retourner une erreur 403 Forbidden

### Requirement: Client archiving (soft delete)
Le système SHALL permettre d'archiver des clients sans les supprimer définitivement.

#### Scenario: Archive client from detail page
- **WHEN** un styliste clique sur "Archiver" depuis la page de détail
- **THEN** une confirmation MUST être demandée avant l'archivage

#### Scenario: Successful client archiving
- **WHEN** un styliste confirme l'archivage
- **THEN** la colonne `deleted_at` MUST être remplie avec la date/heure actuelle

#### Scenario: Archived client hidden from default list
- **WHEN** un client est archivé
- **THEN** il MUST disparaître de la liste par défaut (filtre "Actifs")

#### Scenario: Archived client visible in archived filter
- **WHEN** un styliste sélectionne le filtre "Archivés"
- **THEN** les clients archivés MUST être visibles avec indication "Archivé le JJ/MM/AAAA"

#### Scenario: Access control on client archiving
- **WHEN** un styliste tente d'archiver un client qui ne lui appartient pas
- **THEN** le système MUST retourner une erreur 403 Forbidden

### Requirement: Client unarchiving
Le système SHALL permettre de restaurer un client archivé.

#### Scenario: Unarchive client from archived list
- **WHEN** un styliste clique sur "Restaurer" depuis la liste des archivés
- **THEN** la colonne `deleted_at` MUST être remise à NULL

#### Scenario: Restored client appears in active list
- **WHEN** un client est restauré
- **THEN** il MUST réapparaître dans la liste par défaut (filtre "Actifs")

### Requirement: Subscription plan limits validation
Le système SHALL valider les limites de clients selon le plan d'abonnement du styliste.

#### Scenario: Count active clients for limit check
- **WHEN** un styliste tente de créer un nouveau client
- **THEN** le système MUST compter les clients actifs (`deleted_at = NULL`) du styliste

#### Scenario: Free plan limit enforced
- **WHEN** un styliste sur plan Free (limite 20) tente de créer son 21ème client
- **THEN** le système MUST retourner une erreur 403 avec message "Limite de 20 clients atteinte. Passez au plan Standard."

#### Scenario: Standard plan limit enforced
- **WHEN** un styliste sur plan Standard (limite 100) tente de créer son 101ème client
- **THEN** le système MUST retourner une erreur 403 avec message "Limite de 100 clients atteinte. Passez au plan Pro."

#### Scenario: Pro plan unlimited clients
- **WHEN** un styliste sur plan Pro tente de créer un client
- **THEN** aucune limite de nombre MUST être appliquée

#### Scenario: Client counter displayed in UI
- **WHEN** un styliste est sur la page liste clients
- **THEN** un compteur MUST afficher "X/Y clients" selon son plan (sauf Pro : "X clients")

#### Scenario: Archived clients not counted in limit
- **WHEN** le système compte les clients pour vérifier la limite
- **THEN** les clients archivés (`deleted_at != NULL`) MUST être exclus du compte

### Requirement: Multi-tenant isolation enforcement
Le système SHALL garantir l'isolation stricte des données clients entre stylistes.

#### Scenario: API routes enforce stylist_id filter
- **WHEN** une API route clients est appelée
- **THEN** elle MUST automatiquement filtrer par `stylist_id` du styliste connecté

#### Scenario: Prevent cross-stylist data access
- **WHEN** un styliste A tente d'accéder à un client du styliste B via URL directe
- **THEN** le système MUST retourner 403 Forbidden ou 404 Not Found

#### Scenario: Session stylist_id used for isolation
- **WHEN** le système récupère le `stylist_id`
- **THEN** il MUST utiliser la session NextAuth et non un paramètre client

### Requirement: Mobile-first UI optimization
Le système SHALL fournir une interface optimisée pour saisie mobile sur smartphone.

#### Scenario: Touch targets minimum size
- **WHEN** les boutons et liens sont affichés
- **THEN** ils MUST avoir une taille minimale de 44x44px

#### Scenario: Forms optimized for mobile input
- **WHEN** un formulaire client est affiché sur mobile
- **THEN** les champs MUST utiliser les types HTML appropriés (tel, email) pour clavier adapté

#### Scenario: Client cards stack on mobile
- **WHEN** la liste clients est affichée sur écran < 768px
- **THEN** les clients MUST être affichés en cards verticales, pas en table

#### Scenario: Fast loading on 3G
- **WHEN** la page clients charge sur connexion lente
- **THEN** elle MUST afficher un skeleton loader pendant le chargement

### Requirement: Navigation menu activation
Le système SHALL activer le menu "Clients" dans la sidebar dashboard.

#### Scenario: Clients menu item clickable
- **WHEN** un styliste est dans le dashboard
- **THEN** l'item "Clients" dans la sidebar MUST être cliquable (pas disabled)

#### Scenario: Active route highlighting
- **WHEN** un styliste est sur une page `/dashboard/clients/*`
- **THEN** l'item "Clients" dans la sidebar MUST être visuellement mis en évidence

#### Scenario: Clients icon displayed
- **WHEN** l'item "Clients" est affiché dans la sidebar
- **THEN** il MUST afficher l'icône `Users` de Lucide
