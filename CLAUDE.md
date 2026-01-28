# Guide de développement - Styliste.com

## Aperçu de l'objectif du projet

Styliste.com est une plateforme SaaS B2B destinée aux stylistes, tailleurs et couturiers africains. L'objectif est de leur permettre de :

- Gérer efficacement leur activité quotidienne (clients, mesures, commandes, planning)
- Disposer d'une vitrine professionnelle en ligne (portfolio)
- Communiquer simplement avec leurs clients via notifications multi-canal
- Moderniser progressivement leur métier grâce à l'IA

**Cible principale :** Bénin → Afrique de l'Ouest → Afrique entière

**Principe clé :** Le styliste est l'unique utilisateur du SaaS. Les clients finaux n'ont pas de compte sur la plateforme.

---

## Aperçu de l'architecture globale

### Stack technique

**Frontend :**
- SvelteKit 2.x (SSR + hydration)
- TypeScript 5.x
- TailwindCSS 4.x
- Vite 5.x (build tool)
- PWA (offline-first)

**Backend :**
- Cloudflare Workers (API edge functions)
- Node.js 20 LTS (background jobs sur Railway)
- SvelteKit API Routes
- BullMQ (queue notifications)

**Base de données :**
- PostgreSQL 15 (Supabase managed)
- Drizzle ORM (type-safe)
- Row Level Security (RLS) pour isolation multi-tenant

**Infrastructure :**
- Cloudflare Pages (hosting frontend)
- Cloudflare R2 (images portfolio)
- Supabase (database, auth, storage avatars)
- Railway (background jobs)

**Intégrations :**
- Auth : Supabase Auth (Phone OTP, Email, OAuth)
- Notifications : Termii (SMS), Meta Cloud API (WhatsApp), Resend (Email)
- Paiements : Fedapay (MVP Bénin), CinetPay (V1), Stripe (International)

### Principes architecturaux

- **Mobile-first et offline-first** : Connexions instables
- **Performance optimisée** : Bundle JS minimal (~20KB gzipped)
- **Disponibilité globale** : CDN avec POPs en Afrique (Lagos, Johannesburg)
- **Scalabilité progressive** : 100 à 5000+ stylistes sans refonte
- **Coûts maîtrisés** : Free tiers → scaling progressif

---

## Style visuel

### Design system

- **Interface claire et minimaliste**
- **Pas de mode sombre pour le MVP**
- Design mobile-first adapté aux connexions instables
- Utilisation optimale de TailwindCSS
- Bundle CSS minimal via purge automatique
- Composants réutilisables et cohérents

### Principes UI/UX

- Simplicité avant exhaustivité
- Faible consommation de données
- Notifications plutôt que tableaux complexes
- Actions principales toujours visibles
- Feedback immédiat sur les actions utilisateur

---

## Contraintes et Politiques

### Sécurité

- **NE JAMAIS exposer les clés API au client**
- Toutes les clés API doivent être stockées côté serveur (Cloudflare Secrets, variables d'environnement)
- Utiliser des proxies backend pour les appels API externes
- Valider TOUTES les entrées utilisateur (frontend + backend avec Zod)
- Appliquer Row Level Security (RLS) sur PostgreSQL
- CSRF protection activé (SvelteKit built-in)
- Rate limiting sur les endpoints sensibles

### Performance

- Bundle First Load : < 100KB gzipped
- Time to Interactive : < 3s sur connexion 3G
- Lighthouse Score : > 90 mobile
- Lazy loading systématique des images
- Code splitting automatique par route
- Compression Brotli niveau 11

### Contexte africain

- Support connexions intermittentes (PWA offline)
- Optimisation data (pagination stricte, compression)
- POPs CDN en Afrique (Lagos, Johannesburg)
- Support Mobile Money (MTN, Moov, Orange, Wave)
- Multi-langue : Français et Anglais

---

## Dépendances

### Politique de gestion

- **Préférer les composants existants plutôt que d'ajouter de nouvelles bibliothèques UI**
- Éviter les dépendances lourdes qui impactent le bundle size
- Privilégier les solutions natives quand c'est possible
- Vérifier la compatibilité avec Cloudflare Workers (edge runtime)
- Utiliser les utilities TailwindCSS plutôt que des bibliothèques CSS-in-JS

### Bibliothèques approuvées

**Core :**
- SvelteKit, TypeScript, TailwindCSS, Vite (déjà dans la stack)
- Drizzle ORM (database)
- Zod (validation)
- Vite PWA Plugin (progressive web app)

**UI Components :**
- Utiliser les composants du projet (`src/lib/components/ui/`)
- Créer des composants réutilisables avant d'ajouter une bibliothèque externe

**Utilities :**
- date-fns (manipulation dates, léger)
- html-escaper (XSS prevention)
- @sentry/svelte (error tracking)

---

## Testing et qualité

### Tests automatisés avec playwright-skill

**À la fin de chaque développement qui implique l'interface graphique :**

1. Tester avec playwright-skill l'interface pour vérifier :
   - ✅ **Responsive** : L'interface fonctionne sur mobile, tablette et desktop
   - ✅ **Fonctionnel** : Tous les éléments interactifs fonctionnent correctement
   - ✅ **Besoin développé** : La fonctionnalité répond au besoin spécifié

2. Cas de tests minimum :
   - Navigation et liens
   - Formulaires (validation, soumission, messages d'erreur)
   - Actions utilisateur (boutons, modales, notifications)
   - Responsive design (320px, 768px, 1024px, 1920px)
   - États de chargement et erreurs

3. Exemple de commande :
   ```bash
   # Tester la page de création de client
   playwright-skill test clients/new
   ```

### Critères de qualité

- Code TypeScript sans erreurs
- Validation Zod sur toutes les entrées
- Gestion d'erreur appropriée (try/catch + Sentry)
- Pas de secrets exposés côté client
- Performance respectant les métriques cibles
- Accessibilité basique (labels, ARIA, keyboard navigation)

---

## Documentation

### Documents de référence

- **[PRD.md](./PRD.md)** - Product Requirements Document
  - Vision du produit
  - Fonctionnalités par phase (MVP, V1, V2)
  - Modèle d'abonnement
  - Contraintes contextuelles africaines

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture Technique
  - Stack technique détaillé
  - Infrastructure et déploiement
  - Schéma de base de données
  - Sécurité et performance
  - Patterns et conventions

### Structure de la documentation

- `PRD.md` : Quoi construire et pourquoi
- `ARCHITECTURE.md` : Comment construire (technique)
- `CLAUDE.md` : Guide de développement (ce fichier)
- `README.md` : Guide de démarrage rapide (à créer)

---

## Context7 - Documentation automatique

### Utilisation obligatoire

**Utilise toujours Context7 lorsque j'ai besoin de :**

- Génération de code avec des bibliothèques externes
- Étapes de configuration ou d'installation
- Documentation de bibliothèque/API à jour
- Exemples de code pour des cas d'usage spécifiques
- Bonnes pratiques avec une technologie

**Cela signifie que tu dois automatiquement utiliser les outils MCP Context7** pour :
1. Résoudre l'identifiant de bibliothèque (`resolve-library-id`)
2. Obtenir la documentation à jour (`query-docs`)

**Sans que j'aie à le demander explicitement.**

### Exemples d'utilisation

```
Moi : "Implémente l'authentification avec Supabase Auth"
→ Tu utilises automatiquement Context7 pour Supabase

Moi : "Configure Drizzle ORM avec PostgreSQL"
→ Tu utilises automatiquement Context7 pour Drizzle

Moi : "Intègre Fedapay pour les paiements"
→ Tu utilises automatiquement Context7 pour Fedapay
```

---

## Spécifications et langue

### Langue des documents

**Toutes les spécifications doivent être rédigées en français**, y compris :

- Spécifications OpenSpec (sections **Purpose** et **Scenarios**)
- Documentation technique
- Commentaires de code
- Messages d'erreur utilisateur
- Commits git

**Exception :** Les titres de **Requirements** dans OpenSpec doivent rester en anglais avec les mots-clés `SHALL`/`MUST` pour la validation OpenSpec.

### Exemple OpenSpec conforme

```yaml
# ✅ CORRECT
purpose: |
  Permettre au styliste de créer une nouvelle commande pour un client existant.

scenarios:
  - name: Création commande réussie
    description: Le styliste remplit le formulaire et crée la commande

requirements:
  - id: REQ-001
    title: System SHALL validate client exists
    description: Le système doit vérifier que le client existe avant de créer la commande
```

---

## Workflow de développement

### 1. Planification
- Lire PRD.md et ARCHITECTURE.md pour contexte
- Utiliser `/opsx:new` pour créer un change OpenSpec
- Définir les specs avec `/opsx:continue`

### 2. Implémentation
- Utiliser Context7 pour la documentation des bibliothèques
- Respecter les conventions (voir ARCHITECTURE.md section 9)
- Suivre les contraintes de sécurité et performance
- Préférer les composants existants

### 3. Testing
- Tester avec playwright-skill (responsive, fonctionnel)
- Vérifier la performance (bundle size, Lighthouse)
- Tester sur connexion lente (throttling 3G)

### 4. Finalisation
- Utiliser `/opsx:verify` pour valider l'implémentation
- Commit avec message en français
- Archiver le change avec `/opsx:archive`

---

## Commandes utiles

### OpenSpec Workflow
```bash
/opsx:new          # Créer un nouveau change
/opsx:continue     # Créer le prochain artifact
/opsx:ff           # Fast-forward (tous les artifacts)
/opsx:apply        # Implémenter les tâches
/opsx:verify       # Vérifier l'implémentation
/opsx:archive      # Archiver le change terminé
```

### Testing
```bash
/playwright-skill  # Lancer les tests Playwright
```

### Développement
```bash
npm run dev        # Démarrer le serveur de développement
npm run build      # Build production
npm run preview    # Prévisualiser le build
```

---

## Notes importantes

- **Mobile-first** : Toujours développer d'abord pour mobile
- **Offline-first** : Penser aux cas sans connexion (PWA)
- **Performance** : Surveiller le bundle size à chaque ajout
- **Sécurité** : Jamais de secrets côté client
- **Simplicité** : Éviter la sur-ingénierie
- **Context Africain** : Toujours considérer les contraintes réseau et data
