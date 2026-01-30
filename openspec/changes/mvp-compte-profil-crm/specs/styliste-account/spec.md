## ADDED Requirements

### Requirement: Styliste peut créer un compte avec numéro de téléphone

Le système DOIT permettre à un styliste de créer un compte en utilisant son numéro de téléphone.

#### Scenario: Inscription réussie avec Phone OTP
- **WHEN** le styliste saisit un numéro de téléphone valide et reçoit un code OTP par SMS
- **THEN** le système crée un compte auth.users et redirige vers la création du profil

#### Scenario: Numéro de téléphone invalide
- **WHEN** le styliste saisit un numéro de téléphone invalide (moins de 8 chiffres)
- **THEN** le système affiche une erreur de validation sans envoyer de SMS

#### Scenario: Code OTP incorrect
- **WHEN** le styliste saisit un code OTP incorrect
- **THEN** le système affiche une erreur et permet de renvoyer un nouveau code

### Requirement: Styliste peut créer un compte avec email

Le système DOIT permettre à un styliste de créer un compte en utilisant son email et un mot de passe.

#### Scenario: Inscription réussie avec email
- **WHEN** le styliste saisit un email valide et un mot de passe fort (min 8 caractères)
- **THEN** le système crée un compte auth.users et envoie un email de confirmation

#### Scenario: Email déjà utilisé
- **WHEN** le styliste tente de s'inscrire avec un email déjà enregistré
- **THEN** le système affiche une erreur indiquant que l'email existe déjà

#### Scenario: Mot de passe trop faible
- **WHEN** le styliste saisit un mot de passe de moins de 8 caractères
- **THEN** le système affiche une erreur de validation

### Requirement: Styliste peut se connecter avec ses identifiants

Le système DOIT permettre à un styliste authentifié de se connecter à son compte.

#### Scenario: Connexion réussie avec téléphone
- **WHEN** le styliste saisit son numéro de téléphone et le code OTP reçu
- **THEN** le système authentifie le styliste et redirige vers son dashboard

#### Scenario: Connexion réussie avec email
- **WHEN** le styliste saisit son email et mot de passe corrects
- **THEN** le système authentifie le styliste et redirige vers son dashboard

#### Scenario: Identifiants incorrects
- **WHEN** le styliste saisit des identifiants incorrects (email/password ou phone/OTP invalides)
- **THEN** le système affiche une erreur générique sans indiquer quel champ est incorrect

### Requirement: Styliste peut se déconnecter

Le système DOIT permettre à un styliste connecté de se déconnecter de son compte.

#### Scenario: Déconnexion réussie
- **WHEN** le styliste clique sur le bouton "Déconnexion"
- **THEN** le système invalide la session et redirige vers la page de connexion

### Requirement: System SHALL enforce rate limiting on OTP requests

Le système DOIT limiter les demandes de codes OTP pour prévenir les abus.

#### Scenario: Limite de requêtes OTP atteinte
- **WHEN** le styliste demande plus de 3 codes OTP en moins d'une heure pour le même numéro
- **THEN** le système bloque les nouvelles demandes et affiche un message d'erreur avec délai d'attente

### Requirement: System SHALL create session with appropriate expiry

Le système DOIT créer une session avec expiration appropriée lors de l'authentification.

#### Scenario: Session créée avec expiration 7 jours
- **WHEN** le styliste se connecte avec succès
- **THEN** le système crée une session valide pendant 7 jours

#### Scenario: Session expirée
- **WHEN** le styliste tente d'accéder au dashboard après expiration de la session
- **THEN** le système redirige vers la page de connexion
