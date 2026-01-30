## 1. Configuration du projet et dépendances

- [x] 1.1 Initialiser le projet SvelteKit avec TypeScript
- [x] 1.2 Configurer TailwindCSS 4.x avec configuration mobile-first
- [x] 1.3 Installer et configurer Drizzle ORM pour PostgreSQL
- [x] 1.4 Installer et configurer Supabase client (@supabase/supabase-js)
- [x] 1.5 Installer Zod pour validation des schemas
- [x] 1.6 Configurer les variables d'environnement (.env avec PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)

## 2. Configuration base de données et migrations

- [x] 2.1 Créer le schema Drizzle pour la table `stylistes`
- [x] 2.2 Créer le schema Drizzle pour la table `clients`
- [x] 2.3 Générer et appliquer la migration Drizzle pour créer les tables
- [x] 2.4 Créer le script SQL pour activer Row Level Security sur `stylistes`
- [x] 2.5 Créer le script SQL pour activer Row Level Security sur `clients`
- [x] 2.6 Créer les policies RLS pour isolation multi-tenant sur `stylistes`
- [x] 2.7 Créer les policies RLS pour isolation multi-tenant sur `clients`
- [x] 2.8 Créer les index de performance (styliste_id sur clients, user_id sur stylistes)

## 3. Schemas de validation Zod

- [x] 3.1 Créer le schema Zod pour l'inscription (phone/email)
- [x] 3.2 Créer le schema Zod pour le profil styliste (salon_name, description, phone, email, address, city, country)
- [x] 3.3 Créer le schema Zod pour les clients (name, phone, email, notes)
- [x] 3.4 Exporter les types TypeScript à partir des schemas Zod

## 4. Services backend et utilitaires

- [x] 4.1 Créer le service auth wrapper (src/lib/services/auth.ts) pour Supabase Auth
- [x] 4.2 Créer les utilitaires de gestion d'erreur standardisée (format { data, error })
- [x] 4.3 Créer le helper RLS pour récupérer le styliste_id depuis auth.uid()
- [x] 4.4 Créer le middleware de rate limiting pour les requêtes OTP

## 5. API Routes - Authentification

- [x] 5.1 Créer l'endpoint POST /api/auth/signup (phone OTP)
- [x] 5.2 Créer l'endpoint POST /api/auth/signup/email (email/password)
- [x] 5.3 Créer l'endpoint POST /api/auth/verify-otp (vérification code SMS)
- [x] 5.4 Créer l'endpoint POST /api/auth/signin (phone OTP)
- [x] 5.5 Créer l'endpoint POST /api/auth/signin/email (email/password)
- [x] 5.6 Créer l'endpoint POST /api/auth/signout (déconnexion)
- [x] 5.7 Ajouter validation Zod sur tous les endpoints auth
- [x] 5.8 Ajouter rate limiting sur les endpoints OTP (max 3/hour/phone)

## 6. API Routes - Profil Styliste

- [x] 6.1 Créer l'endpoint POST /api/styliste/profile (création profil)
- [x] 6.2 Créer l'endpoint GET /api/styliste/profile (récupération profil)
- [x] 6.3 Créer l'endpoint PATCH /api/styliste/profile (modification profil)
- [x] 6.4 Ajouter validation Zod sur tous les endpoints profil
- [x] 6.5 Vérifier isolation RLS (styliste ne peut accéder qu'à son propre profil)

## 7. API Routes - CRM Clients

- [x] 7.1 Créer l'endpoint POST /api/clients (création client)
- [x] 7.2 Créer l'endpoint GET /api/clients (liste clients avec pagination)
- [x] 7.3 Créer l'endpoint GET /api/clients/[id] (détails client)
- [x] 7.4 Créer l'endpoint PATCH /api/clients/[id] (modification client)
- [x] 7.5 Créer l'endpoint DELETE /api/clients/[id] (suppression client)
- [x] 7.6 Créer l'endpoint GET /api/clients/search?q=... (recherche clients)
- [x] 7.7 Ajouter validation Zod sur tous les endpoints clients
- [x] 7.8 Vérifier isolation RLS (styliste ne peut accéder qu'à ses propres clients)

## 8. Composants UI réutilisables

- [x] 8.1 Créer le composant Button.svelte (variants: primary, secondary, danger)
- [x] 8.2 Créer le composant Input.svelte (types: text, tel, email, textarea)
- [x] 8.3 Créer le composant Form.svelte avec gestion d'erreur
- [x] 8.4 Créer le composant Card.svelte pour les layouts
- [x] 8.5 Créer le composant Modal.svelte pour les dialogues de confirmation
- [x] 8.6 Créer le composant Toast.svelte pour les notifications utilisateur
- [x] 8.7 Créer le composant Spinner.svelte pour les états de chargement

## 9. Pages - Authentification

- [x] 9.1 Créer la page /signup (inscription avec choix phone/email)
- [x] 9.2 Créer la page /signin (connexion avec choix phone/email)
- [x] 9.3 Ajouter la validation frontend avec Zod schemas
- [x] 9.4 Ajouter les états de chargement et messages d'erreur
- [x] 9.5 Implémenter la logique d'envoi et vérification OTP
- [x] 9.6 Ajouter la redirection post-connexion (vers /profile/create si profil incomplet, sinon /dashboard)

## 10. Pages - Profil Styliste

- [x] 10.1 Créer la page /profile/create (création profil obligatoire après inscription)
- [x] 10.2 Créer la page /profile (affichage et modification profil)
- [x] 10.3 Ajouter la validation frontend avec Zod schema profil
- [x] 10.4 Ajouter les états de chargement et messages d'erreur
- [x] 10.5 Implémenter la redirection forcée vers /profile/create si profil incomplet
- [x] 10.6 Ajouter le bouton de déconnexion dans la page profil

## 11. Pages - CRM Clients

- [x] 11.1 Créer la page /clients (liste des clients avec recherche)
- [x] 11.2 Créer la page /clients/new (création nouveau client)
- [x] 11.3 Créer la page /clients/[id] (détails client)
- [x] 11.4 Créer la page /clients/[id]/edit (modification client)
- [x] 11.5 Ajouter la validation frontend avec Zod schema client
- [x] 11.6 Implémenter la fonctionnalité de recherche (nom/téléphone)
- [x] 11.7 Implémenter la modale de confirmation pour suppression client
- [x] 11.8 Ajouter les états de chargement et messages d'erreur

## 12. Layout et Navigation

- [x] 12.1 Créer le layout principal avec navigation (sidebar/header)
- [x] 12.2 Ajouter les liens de navigation (Dashboard, Clients, Profil)
- [x] 12.3 Implémenter la protection des routes (redirect vers /signin si non authentifié)
- [x] 12.4 Ajouter l'indicateur de session utilisateur (nom salon, bouton déconnexion)

## 13. Performance et optimisation

- [x] 13.1 Configurer le code splitting par route (SvelteKit automatique)
- [x] 13.2 Optimiser les images (lazy loading, compression)
- [x] 13.3 Vérifier le bundle size (objectif < 100KB gzipped)
- [x] 13.4 Configurer la compression Brotli (Cloudflare Pages par défaut)

## 14. Sécurité

- [x] 14.1 Vérifier que toutes les clés API sont côté serveur uniquement
- [x] 14.2 Activer CSRF protection (SvelteKit built-in)
- [x] 14.3 Ajouter Content Security Policy headers
- [x] 14.4 Tester l'isolation multi-tenant (tenter d'accéder aux données d'un autre styliste)
- [x] 14.5 Vérifier la sanitisation XSS sur tous les champs texte (html-escaper)

## 15. Tests et validation

- [x] 15.1 Tester le flow d'inscription complet (phone + email)
- [x] 15.2 Tester le flow de connexion complet (phone + email)
- [x] 15.3 Tester la création et modification de profil styliste
- [x] 15.4 Tester le CRUD complet des clients
- [x] 15.5 Tester la recherche de clients
- [x] 15.6 Tester l'isolation multi-tenant (2 comptes stylistes différents)
- [x] 15.7 Tester le rate limiting OTP
- [x] 15.8 Tester la responsive mobile (320px, 768px, 1024px)
- [x] 15.9 Vérifier Lighthouse score > 90 mobile
- [x] 15.10 Tester sur connexion 3G throttling

## 16. Déploiement

- [x] 16.1 Exécuter les migrations database sur Supabase production
- [x] 16.2 Configurer les variables d'environnement sur Cloudflare Pages
- [x] 16.3 Ajouter SUPABASE_SERVICE_ROLE_KEY dans Cloudflare Secrets
- [x] 16.4 Build et deploy sur Cloudflare Pages
- [x] 16.5 Smoke tests en production (créer compte, ajouter client, vérifier isolation)
