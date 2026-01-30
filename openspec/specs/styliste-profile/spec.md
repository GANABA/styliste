## ADDED Requirements

### Requirement: Styliste MUST complete profile after account creation

Le système DOIT exiger la complétion du profil professionnel immédiatement après la création du compte.

#### Scenario: Redirection vers création de profil
- **WHEN** le styliste termine la création de son compte (auth.users créé)
- **THEN** le système redirige automatiquement vers le formulaire de création de profil

#### Scenario: Profil incomplet bloque l'accès au dashboard
- **WHEN** le styliste tente d'accéder au dashboard sans avoir complété son profil
- **THEN** le système redirige vers le formulaire de création de profil

### Requirement: Styliste peut créer son profil professionnel

Le système DOIT permettre au styliste de créer son profil professionnel avec les informations du salon.

#### Scenario: Création de profil réussie
- **WHEN** le styliste saisit nom du salon (min 2 caractères), téléphone valide, et optionnellement description/email/adresse/ville
- **THEN** le système crée une entrée dans la table `stylistes` liée à son auth.users et redirige vers le dashboard

#### Scenario: Nom du salon trop court
- **WHEN** le styliste saisit un nom de salon de moins de 2 caractères
- **THEN** le système affiche une erreur de validation

#### Scenario: Téléphone invalide
- **WHEN** le styliste saisit un numéro de téléphone invalide (format incorrect)
- **THEN** le système affiche une erreur de validation

### Requirement: Styliste peut consulter son profil professionnel

Le système DOIT permettre au styliste de consulter son profil professionnel.

#### Scenario: Affichage du profil
- **WHEN** le styliste accède à la page "Mon profil"
- **THEN** le système affiche toutes les informations du profil (nom salon, description, contacts, localisation)

### Requirement: Styliste peut modifier son profil professionnel

Le système DOIT permettre au styliste de modifier son profil professionnel.

#### Scenario: Modification réussie
- **WHEN** le styliste modifie un ou plusieurs champs du profil et enregistre
- **THEN** le système met à jour les informations dans la table `stylistes` et affiche un message de confirmation

#### Scenario: Modification avec données invalides
- **WHEN** le styliste tente de modifier son profil avec des données invalides (ex: téléphone incorrect)
- **THEN** le système affiche des erreurs de validation sans enregistrer les modifications

### Requirement: System SHALL enforce profile data isolation per styliste

Le système DOIT garantir l'isolation stricte des données de profil par styliste.

#### Scenario: Styliste ne peut voir que son propre profil
- **WHEN** le styliste fait une requête API pour récupérer un profil
- **THEN** le système retourne uniquement le profil associé à son auth.uid() (RLS actif)

#### Scenario: Styliste ne peut modifier que son propre profil
- **WHEN** le styliste tente de modifier un profil (via API)
- **THEN** le système vérifie via RLS que le profil appartient bien au styliste connecté avant d'autoriser la modification

### Requirement: System SHALL validate profile data before saving

Le système DOIT valider toutes les données du profil avant enregistrement.

#### Scenario: Validation Zod côté serveur
- **WHEN** le styliste soumet le formulaire de profil
- **THEN** le système valide les données avec le schema Zod côté serveur avant insertion en base

#### Scenario: Protection XSS sur champs texte
- **WHEN** le styliste saisit du contenu HTML/script dans description ou adresse
- **THEN** le système échappe ou rejette le contenu dangereux pour prévenir les attaques XSS
