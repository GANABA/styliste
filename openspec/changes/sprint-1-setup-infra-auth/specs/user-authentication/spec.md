## Purpose

Système d'authentification complet avec NextAuth v5 incluant inscription, connexion, déconnexion, gestion des sessions JWT, et protection des routes pour la plateforme Styliste.com.

## ADDED Requirements

### Requirement: NextAuth configuration
Le système SHALL configurer NextAuth v5 (Auth.js) avec Prisma Adapter, JWT strategy, et credentials provider pour email/password.

#### Scenario: NextAuth config file created
- **WHEN** NextAuth est configuré
- **THEN** le fichier `lib/auth.ts` MUST exister avec la configuration complète NextAuth

#### Scenario: Prisma adapter configured
- **WHEN** NextAuth est configuré
- **THEN** le PrismaAdapter MUST être configuré pour persister les sessions en base de données

#### Scenario: JWT strategy enabled
- **WHEN** NextAuth est configuré
- **THEN** la strategy JWT MUST être activée pour des sessions stateless scalables

#### Scenario: Credentials provider configured
- **WHEN** NextAuth est configuré
- **THEN** le credentials provider MUST être configuré pour accepter email/password

### Requirement: NextAuth API route
Le système SHALL exposer les endpoints NextAuth via App Router API routes pour gérer l'authentification.

#### Scenario: NextAuth route handler created
- **WHEN** l'API auth est configurée
- **THEN** le fichier `app/api/auth/[...nextauth]/route.ts` MUST exister avec les handlers GET et POST

#### Scenario: NextAuth endpoints accessible
- **WHEN** un client fait une requête vers `/api/auth/signin`
- **THEN** la route MUST retourner la page de signin NextAuth

### Requirement: User registration
Le système SHALL permettre aux nouveaux utilisateurs de créer un compte avec email, password, nom, et type de compte (styliste).

#### Scenario: Registration page exists
- **WHEN** un utilisateur navigue vers `/register`
- **THEN** la page d'inscription MUST s'afficher avec un formulaire

#### Scenario: Registration form validation
- **WHEN** l'utilisateur soumet le formulaire d'inscription
- **THEN** les champs email, password, name MUST être validés côté client avec Zod

#### Scenario: Email format validation
- **WHEN** l'utilisateur entre un email
- **THEN** le système MUST valider que l'email a un format valide

#### Scenario: Password strength validation
- **WHEN** l'utilisateur entre un password
- **THEN** le système MUST valider que le password contient au moins 8 caractères

#### Scenario: Unique email validation
- **WHEN** l'utilisateur s'inscrit avec un email déjà existant
- **THEN** le système MUST retourner une erreur "Email already exists"

#### Scenario: Successful registration creates user
- **WHEN** l'inscription est réussie
- **THEN** un nouvel enregistrement MUST être créé dans la table `users` avec password hashé

#### Scenario: Successful registration creates stylist
- **WHEN** l'inscription est réussie pour un styliste
- **THEN** un nouvel enregistrement MUST être créé dans la table `stylists` lié au user

#### Scenario: Default subscription assigned
- **WHEN** un styliste s'inscrit
- **THEN** une subscription au plan "Découverte" (Free) MUST être automatiquement créée

#### Scenario: Password hashing with bcrypt
- **WHEN** un password est stocké
- **THEN** il MUST être hashé avec bcrypt (12 rounds minimum)

### Requirement: User login
Le système SHALL permettre aux utilisateurs de se connecter avec leur email et password.

#### Scenario: Login page exists
- **WHEN** un utilisateur navigue vers `/login`
- **THEN** la page de connexion MUST s'afficher avec un formulaire

#### Scenario: Login form fields
- **WHEN** la page de login s'affiche
- **THEN** elle MUST contenir les champs email et password

#### Scenario: Successful login with valid credentials
- **WHEN** l'utilisateur entre des credentials valides et soumet
- **THEN** le système MUST créer une session et rediriger vers `/dashboard`

#### Scenario: Failed login with invalid email
- **WHEN** l'utilisateur entre un email qui n'existe pas
- **THEN** le système MUST retourner une erreur "Invalid credentials"

#### Scenario: Failed login with invalid password
- **WHEN** l'utilisateur entre un password incorrect
- **THEN** le système MUST retourner une erreur "Invalid credentials"

#### Scenario: Session token created on login
- **WHEN** l'utilisateur se connecte avec succès
- **THEN** un JWT session token MUST être créé et stocké dans un HttpOnly cookie

#### Scenario: Session persisted in database
- **WHEN** l'utilisateur se connecte avec succès
- **THEN** une entrée MUST être créée dans la table `sessions` avec `user_id` et `expires`

### Requirement: Session management
Le système SHALL gérer les sessions utilisateur avec JWT tokens et expiration automatique.

#### Scenario: Session token in HttpOnly cookie
- **WHEN** une session est créée
- **THEN** le JWT token MUST être stocké dans un cookie HttpOnly pour prévenir XSS

#### Scenario: Session expiration configured
- **WHEN** une session est créée
- **THEN** elle MUST expirer après 7 jours par défaut

#### Scenario: Session refresh on activity
- **WHEN** l'utilisateur fait une requête avec une session valide proche de l'expiration
- **THEN** le système MUST rafraîchir automatiquement le token

#### Scenario: Expired session handling
- **WHEN** l'utilisateur fait une requête avec une session expirée
- **THEN** le système MUST rediriger vers `/login`

### Requirement: User logout
Le système SHALL permettre aux utilisateurs de se déconnecter et invalider leur session.

#### Scenario: Logout endpoint available
- **WHEN** l'utilisateur clique sur le bouton "Logout"
- **THEN** le système MUST appeler l'endpoint NextAuth de logout

#### Scenario: Session deleted on logout
- **WHEN** l'utilisateur se déconnecte
- **THEN** l'entrée de session MUST être supprimée de la table `sessions`

#### Scenario: Cookie cleared on logout
- **WHEN** l'utilisateur se déconnecte
- **THEN** le cookie HttpOnly contenant le JWT MUST être supprimé

#### Scenario: Redirect after logout
- **WHEN** l'utilisateur se déconnecte
- **THEN** il MUST être redirigé vers `/login`

### Requirement: Route protection middleware
Le système SHALL implémenter un middleware pour protéger les routes du dashboard et rediriger les utilisateurs non authentifiés.

#### Scenario: Middleware file created
- **WHEN** la protection des routes est configurée
- **THEN** le fichier `middleware.ts` MUST exister à la racine du projet

#### Scenario: Dashboard routes protected
- **WHEN** un utilisateur non authentifié accède à `/dashboard/*`
- **THEN** le middleware MUST rediriger vers `/login`

#### Scenario: Authenticated access allowed
- **WHEN** un utilisateur authentifié accède à `/dashboard/*`
- **THEN** le middleware MUST autoriser l'accès

#### Scenario: Public routes accessible
- **WHEN** un utilisateur non authentifié accède à `/login` ou `/register`
- **THEN** le middleware MUST autoriser l'accès sans redirection

#### Scenario: API routes protected
- **WHEN** un utilisateur non authentifié accède à `/api/*` (hors `/api/auth`)
- **THEN** le middleware MUST retourner une erreur 401 Unauthorized

### Requirement: Session context provider
Le système SHALL exposer le contexte de session utilisateur aux composants React via un provider.

#### Scenario: Session provider wraps application
- **WHEN** l'application est initialisée
- **THEN** le SessionProvider NextAuth MUST wrapper le layout racine

#### Scenario: useSession hook available
- **WHEN** un composant a besoin des données de session
- **THEN** il MUST pouvoir utiliser le hook `useSession()` de NextAuth

#### Scenario: Session data includes user info
- **WHEN** useSession() est appelé pour un utilisateur connecté
- **THEN** il MUST retourner les données: `user.id`, `user.email`, `user.name`, `user.role`, `user.stylistId`

### Requirement: Authentication error handling
Le système SHALL gérer les erreurs d'authentification de manière sécurisée et user-friendly.

#### Scenario: Generic error messages
- **WHEN** l'authentification échoue
- **THEN** le message d'erreur MUST être générique ("Invalid credentials") pour éviter l'énumération d'emails

#### Scenario: Rate limiting on auth endpoints
- **WHEN** trop de tentatives de login échouent (5 en 5 minutes)
- **THEN** le système MUST temporairement bloquer les tentatives (rate limiting)

#### Scenario: Error display on login page
- **WHEN** une erreur d'authentification se produit
- **THEN** le message MUST s'afficher au-dessus du formulaire de login

### Requirement: Security headers configuration
Le système SHALL configurer les headers de sécurité HTTP requis pour protéger l'authentification.

#### Scenario: CSRF protection enabled
- **WHEN** NextAuth est configuré
- **THEN** la protection CSRF MUST être activée par défaut

#### Scenario: Secure cookie in production
- **WHEN** l'application est en production
- **THEN** les cookies de session MUST avoir le flag `Secure` (HTTPS uniquement)

#### Scenario: SameSite cookie attribute
- **WHEN** un cookie de session est créé
- **THEN** il MUST avoir l'attribut `SameSite=Lax` pour prévenir CSRF

### Requirement: Password reset foundation
Le système SHALL préparer la base pour le password reset (implémentation complète en Phase 2).

#### Scenario: Verification tokens table exists
- **WHEN** le schéma database est créé
- **THEN** la table `verification_tokens` MUST exister pour supporter les tokens de reset

#### Scenario: Password reset placeholder page
- **WHEN** un utilisateur clique sur "Forgot password?" sur `/login`
- **THEN** un message MUST s'afficher indiquant que cette fonctionnalité arrive prochainement

### Requirement: User role management
Le système SHALL gérer les rôles utilisateurs (STYLIST, ADMIN) pour la future autorisation.

#### Scenario: Role column in users table
- **WHEN** la table users est créée
- **THEN** elle MUST inclure une colonne `role` avec enum (STYLIST, ADMIN)

#### Scenario: Default role on registration
- **WHEN** un utilisateur s'inscrit
- **THEN** le rôle par défaut MUST être "STYLIST"

#### Scenario: Role included in session
- **WHEN** useSession() retourne les données utilisateur
- **THEN** le champ `user.role` MUST être inclus

### Requirement: Environment variables security
Le système SHALL protéger les secrets d'authentification via des variables d'environnement sécurisées.

#### Scenario: NEXTAUTH_SECRET required
- **WHEN** NextAuth est configuré en production
- **THEN** la variable `NEXTAUTH_SECRET` MUST être définie avec une valeur générée cryptographiquement

#### Scenario: NEXTAUTH_URL configured
- **WHEN** NextAuth est configuré
- **THEN** la variable `NEXTAUTH_URL` MUST pointer vers l'URL de base de l'application

#### Scenario: Secrets not committed
- **WHEN** le code est commité
- **THEN** le fichier `.env.local` contenant les secrets MUST être dans `.gitignore`
