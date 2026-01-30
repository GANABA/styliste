## ADDED Requirements

### Requirement: Styliste peut créer une fiche client

Le système DOIT permettre au styliste de créer une fiche pour un nouveau client.

#### Scenario: Création de client réussie
- **WHEN** le styliste saisit nom (min 2 caractères) et téléphone valide, et optionnellement email et notes
- **THEN** le système crée une entrée dans la table `clients` avec `styliste_id` = ID du styliste connecté

#### Scenario: Nom de client trop court
- **WHEN** le styliste saisit un nom de client de moins de 2 caractères
- **THEN** le système affiche une erreur de validation

#### Scenario: Téléphone client invalide
- **WHEN** le styliste saisit un numéro de téléphone invalide (format incorrect)
- **THEN** le système affiche une erreur de validation

### Requirement: Styliste peut consulter la liste de ses clients

Le système DOIT permettre au styliste de consulter la liste complète de ses clients.

#### Scenario: Affichage liste clients
- **WHEN** le styliste accède à la page "Mes clients"
- **THEN** le système affiche uniquement les clients où `styliste_id` = ID du styliste (RLS actif)

#### Scenario: Liste vide pour nouveau styliste
- **WHEN** un styliste sans clients accède à la page "Mes clients"
- **THEN** le système affiche un message "Aucun client" avec un bouton "Ajouter un client"

### Requirement: Styliste peut consulter les détails d'un client

Le système DOIT permettre au styliste de consulter les détails complets d'une fiche client.

#### Scenario: Affichage détails client
- **WHEN** le styliste clique sur un client dans la liste
- **THEN** le système affiche tous les détails du client (nom, téléphone, email, notes, date de création)

### Requirement: Styliste peut modifier une fiche client

Le système DOIT permettre au styliste de modifier les informations d'un client existant.

#### Scenario: Modification client réussie
- **WHEN** le styliste modifie un ou plusieurs champs d'un client et enregistre
- **THEN** le système met à jour les informations dans la table `clients` et affiche un message de confirmation

#### Scenario: Modification avec données invalides
- **WHEN** le styliste tente de modifier un client avec des données invalides (ex: téléphone incorrect)
- **THEN** le système affiche des erreurs de validation sans enregistrer les modifications

### Requirement: Styliste peut supprimer une fiche client

Le système DOIT permettre au styliste de supprimer un client de sa liste.

#### Scenario: Suppression client réussie
- **WHEN** le styliste confirme la suppression d'un client
- **THEN** le système supprime l'entrée de la table `clients` et affiche un message de confirmation

#### Scenario: Demande de confirmation avant suppression
- **WHEN** le styliste clique sur le bouton "Supprimer" d'un client
- **THEN** le système affiche une modale de confirmation avant de procéder à la suppression

### Requirement: Styliste peut rechercher parmi ses clients

Le système DOIT permettre au styliste de rechercher un client par nom ou téléphone.

#### Scenario: Recherche par nom
- **WHEN** le styliste saisit un terme de recherche dans le champ de recherche
- **THEN** le système filtre la liste des clients pour afficher uniquement ceux dont le nom contient le terme (insensible à la casse)

#### Scenario: Recherche par téléphone
- **WHEN** le styliste saisit des chiffres dans le champ de recherche
- **THEN** le système filtre la liste des clients pour afficher uniquement ceux dont le téléphone contient les chiffres

#### Scenario: Aucun résultat
- **WHEN** le styliste effectue une recherche sans résultat
- **THEN** le système affiche un message "Aucun client trouvé"

### Requirement: System SHALL enforce strict client data isolation per styliste

Le système DOIT garantir l'isolation stricte des clients par styliste via Row Level Security.

#### Scenario: Styliste ne peut voir que ses propres clients
- **WHEN** le styliste fait une requête API pour lister ses clients
- **THEN** le système retourne uniquement les clients où `styliste_id` correspond au styliste connecté (RLS actif)

#### Scenario: Styliste ne peut modifier que ses propres clients
- **WHEN** le styliste tente de modifier un client via API
- **THEN** le système vérifie via RLS que le client appartient bien au styliste avant d'autoriser la modification

#### Scenario: Styliste ne peut supprimer que ses propres clients
- **WHEN** le styliste tente de supprimer un client via API
- **THEN** le système vérifie via RLS que le client appartient bien au styliste avant d'autoriser la suppression

#### Scenario: Tentative d'accès aux clients d'un autre styliste
- **WHEN** le styliste tente d'accéder à un client ID qui ne lui appartient pas (via URL directe)
- **THEN** le système retourne une erreur 404 (RLS bloque la requête)

### Requirement: System SHALL validate client data before saving

Le système DOIT valider toutes les données client avant enregistrement.

#### Scenario: Validation Zod côté serveur
- **WHEN** le styliste soumet le formulaire de création/modification client
- **THEN** le système valide les données avec le schema Zod côté serveur avant insertion/update en base

#### Scenario: Protection XSS sur champs texte
- **WHEN** le styliste saisit du contenu HTML/script dans les notes ou nom
- **THEN** le système échappe ou rejette le contenu dangereux pour prévenir les attaques XSS

### Requirement: System SHALL track client creation and update timestamps

Le système DOIT enregistrer automatiquement les timestamps de création et modification des clients.

#### Scenario: Timestamps créés automatiquement
- **WHEN** le styliste crée un nouveau client
- **THEN** le système enregistre automatiquement `created_at` et `updated_at` avec la date/heure actuelle

#### Scenario: Timestamp de modification mis à jour
- **WHEN** le styliste modifie un client existant
- **THEN** le système met à jour automatiquement le champ `updated_at` avec la date/heure actuelle
