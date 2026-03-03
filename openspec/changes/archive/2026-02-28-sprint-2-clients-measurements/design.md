## Context

Le Sprint 2 introduit le module de gestion des clients, qui est la première fonctionnalité métier après l'authentification (Sprint 1). Le système doit permettre aux stylistes de gérer leurs clients et leurs mesures corporelles de manière flexible et versionnée, remplaçant ainsi les cahiers papier.

**État actuel** :
- Infrastructure d'authentification complète (Sprint 1)
- Base de données Prisma avec tables `users`, `stylists`, `subscriptions`
- Dashboard avec sidebar et header fonctionnels
- Isolation multi-tenant par `stylist_id` déjà établie

**Contraintes** :
- Architecture multi-tenant stricte : chaque styliste ne voit que ses propres clients
- Limites par plan d'abonnement (Free: 20 clients, Standard: 100, Pro: illimité)
- Mobile-first obligatoire (95% des utilisateurs sur smartphones)
- Offline-ready pour Sprint futur (architecture préparée mais pas implémentée au Sprint 2)
- Connexions 3G instables en Afrique : minimiser les requêtes API
- Pas de nouvelles dépendances NPM sauf justification critique

**Stakeholders** :
- Stylistes béninois (utilisateurs finaux)
- Équipe produit (validation UX mobile-first)
- Développeur full-stack (implémentation)

## Goals / Non-Goals

**Goals:**
- Permettre aux stylistes de créer, modifier, rechercher et archiver leurs clients
- Système de templates de mesures 100% customisable par styliste (champs dynamiques)
- Versioning automatique des mesures avec historique complet et daté
- Validation des limites d'abonnement côté serveur (empêcher dépassement)
- Interface mobile-first optimisée pour saisie rapide sur smartphone
- API sécurisée avec isolation multi-tenant stricte (RLS côté application)
- Performance : liste clients avec pagination (50 par page) pour gérer 100+ clients

**Non-Goals:**
- Partage de clients entre stylistes (chaque client appartient à UN styliste)
- Import/export CSV de clients (feature V2)
- Synchronisation offline (architecture préparée mais implémentation Sprint futur)
- Notifications SMS/email aux clients (Sprint 5)
- Photos de clients (Sprint 3 avec module Commandes)
- Recherche full-text avancée (simple search par nom/téléphone suffit pour MVP)
- Gestion des rendez-vous/calendrier (Sprint 4)

## Decisions

### 1. Schéma de données : JSON flexible vs colonnes fixes pour mesures

**Décision** : Stocker les mesures dans un champ JSON dynamique plutôt que des colonnes fixes.

**Rationale** :
- Chaque styliste a des besoins différents (homme/femme/enfant, traditionnelle africaine vs moderne)
- Impossibilité de prévoir tous les champs nécessaires (tour de taille, longueur boubou, etc.)
- Permet l'évolution sans migration de schéma à chaque nouveau type de mesure
- TypeScript typing via Zod pour validation côté client et serveur

**Alternatives considérées** :
- ❌ Colonnes Prisma fixes : rigide, nécessite migrations fréquentes
- ❌ Table EAV (Entity-Attribute-Value) : complexité de requêtes, mauvaise performance
- ✅ **JSON avec validation Zod** : flexibilité maximale + type-safety

**Structure JSON pour `measurement_templates.fields`** :
```json
{
  "fields": [
    { "name": "tour_poitrine", "label": "Tour de poitrine", "unit": "cm", "required": true },
    { "name": "tour_taille", "label": "Tour de taille", "unit": "cm", "required": true },
    { "name": "longueur_robe", "label": "Longueur robe", "unit": "cm", "required": false }
  ]
}
```

**Structure JSON pour `client_measurements.measurements`** :
```json
{
  "tour_poitrine": 95,
  "tour_taille": 75,
  "longueur_robe": 120
}
```

### 2. Templates de mesures : Par défaut vs 100% custom

**Décision** : Créer 3 templates par défaut (Homme, Femme, Enfant) au premier accès + permettre création custom.

**Rationale** :
- Réduit la friction pour nouveaux utilisateurs (templates pré-remplis)
- Templates par défaut basés sur mesures standard de couture africaine
- Stylistes peuvent modifier ou créer leurs propres templates
- Seed data injecté lors de la première création de client (lazy seeding)

**Alternatives considérées** :
- ❌ 100% custom dès le départ : barrière à l'entrée trop élevée
- ❌ Templates globaux partagés : pas assez flexibles
- ✅ **Defaults + custom** : meilleur compromis onboarding/flexibilité

**Templates par défaut** :
- Homme : tour_poitrine, tour_taille, longueur_pantalon, tour_cou, longueur_manche, tour_hanche
- Femme : tour_poitrine, tour_taille, tour_hanche, longueur_robe, longueur_jupe, tour_bras
- Enfant : tour_poitrine, tour_taille, hauteur, longueur_pantalon

### 3. Versioning des mesures : Immutable records vs Update in place

**Décision** : Créer un nouveau record `client_measurements` à chaque prise de mesures (immutable).

**Rationale** :
- Permet de tracker l'évolution du corps (perte/prise de poids, grossesse, etc.)
- Utile pour contentieux (preuve que mesures étaient correctes à la date X)
- Simplifie la logique (pas de colonnes `previous_value`, `updated_at` complexes)
- Query simple : `ORDER BY measured_at DESC LIMIT 1` pour dernières mesures

**Alternatives considérées** :
- ❌ Update in place avec historique JSON : complexe à requêter
- ❌ Colonnes `previous_*` : explosion du nombre de colonnes
- ✅ **Immutable records** : simple, performant, auditabilité

**Implémentation** :
- Chaque prise de mesures = nouvel enregistrement avec `measured_at` timestamp
- Afficher "Dernières mesures" + bouton "Voir historique" (liste chronologique)
- Comparer visuellement 2 versions côte à côte (feature nice-to-have Sprint 2, sinon Sprint futur)

### 4. Recherche clients : Full-text search vs Simple LIKE

**Décision** : Utiliser `WHERE name ILIKE '%query%' OR phone LIKE '%query%'` pour MVP.

**Rationale** :
- Suffisant pour 100-200 clients par styliste (plan Pro)
- Postgres `ILIKE` performant avec index sur `name` et `phone`
- Évite dépendance ElasticSearch ou pg_trgm pour MVP
- Recherche instantanée côté client avec React Query cache

**Alternatives considérées** :
- ❌ ElasticSearch : overkill pour MVP, coût infrastructure
- ❌ PostgreSQL Full-Text Search (pg_trgm) : complexité setup
- ✅ **Simple ILIKE** : rapide, pas de dépendance

**Optimisations** :
- Index GIN sur `name` et `phone` pour performance
- Pagination 50 clients par page
- Debounce 300ms sur input de recherche côté client

### 5. Soft delete vs Hard delete pour clients

**Décision** : Soft delete avec colonne `deleted_at` (déjà standard dans le projet).

**Rationale** :
- Respect GDPR/équivalent : permettre export avant suppression définitive
- Contentieux : garder trace 30 jours après suppression
- Facile à restaurer en cas d'erreur utilisateur
- Cohérent avec architecture existante (tous les modèles ont `deleted_at`)

**Implémentation** :
- Filtre par défaut : `WHERE deleted_at IS NULL`
- Bouton "Afficher archivés" pour voir clients supprimés
- Hard delete automatique après 30 jours (cron job futur, hors Sprint 2)

### 6. Validation limites abonnement : Client-side vs Server-side

**Décision** : Validation obligatoire côté serveur + indication côté client.

**Rationale** :
- Sécurité : client-side bypassable, server-side authoritative
- UX : afficher le compteur "15/20 clients" pour éviter frustration
- Bloquer création si limite atteinte avec message clair

**Implémentation** :
```typescript
// API route POST /api/clients
const clientCount = await prisma.client.count({
  where: { stylistId, deletedAt: null }
});

const plan = await getCurrentPlan(stylistId);
if (clientCount >= plan.limits.maxClients) {
  return res.status(403).json({
    error: "Limite de clients atteinte. Passez au plan supérieur."
  });
}
```

**Alternatives considérées** :
- ❌ Client-side uniquement : non sécurisé
- ❌ Server-side uniquement : mauvaise UX (erreur après submit)
- ✅ **Les deux** : sécurité + UX

### 7. Interface clients : Liste table vs Cards

**Décision** : Cards sur mobile, table sur desktop (responsive).

**Rationale** :
- Mobile-first : cards plus faciles à taper sur petit écran
- Desktop : table plus dense, permet tri et scan rapide
- Composant shadcn/ui `Card` déjà disponible

**Breakpoint** :
- Mobile (< 768px) : Cards empilées avec nom, téléphone, dernière modification
- Desktop (≥ 768px) : Table avec colonnes Nom, Téléphone, Email, Ville, Actions

### 8. Pagination : Infinite scroll vs Numérotée

**Décision** : Pagination numérotée (1, 2, 3...) pour MVP.

**Rationale** :
- Infinite scroll complexe avec React Query
- Pagination numérotée plus prévisible pour utilisateurs non tech
- Permet d'aller directement à la page N

**Implémentation** :
- 50 clients par page (bon compromis mobile/desktop)
- `?page=1&limit=50` query params
- Composant shadcn/ui Pagination (si existe, sinon custom simple)

## Risks / Trade-offs

### [Risk] JSON schema sans validation stricte → données corrompues
**Mitigation** :
- Validation Zod stricte côté serveur pour chaque template
- UI ne permet pas saisie libre (uniquement champs définis dans template)
- Migration script futur si besoin de changer structure JSON

### [Risk] Performance queries avec JSON fields sur 1000+ clients
**Mitigation** :
- Pagination agressive (50/page)
- Index sur `stylist_id` pour isolation rapide
- Plan Pro limité à usage raisonnable (~500 clients max attendus)
- Si problème : migration vers JSONB + GIN index (Postgres natif)

### [Risk] Limites plans bypassées via manipulation API
**Mitigation** :
- Validation server-side obligatoire sur TOUTES les routes API
- Middleware de vérification de plan réutilisable
- Tests automatisés des limites (Sprint 2 tasks)

### [Risk] UX confusante pour templates de mesures (trop technique)
**Mitigation** :
- Templates par défaut pour onboarding rapide
- UI simple : formulaire "Ajouter un champ" avec label + unité
- Tutoriel contextuel (tooltip) pour expliquer customisation
- Phase de test utilisateur avant Sprint 3

### [Trade-off] Pas de photos clients → identification difficile
**Accepté** : Photos arrivent au Sprint 3 avec module Commandes. Pour MVP, nom + téléphone suffisent (stylistes connaissent leurs clients).

### [Trade-off] Pas de synchronisation offline → perte de données si déconnexion
**Accepté** : Architecture préparée (IndexedDB + Service Worker) mais implémentation reportée post-MVP. Risque mitigé par sauvegarde auto toutes les 30s côté client.

## Migration Plan

### Étapes de déploiement

1. **Migration base de données** (Prisma migrate)
   ```bash
   npx prisma migrate dev --name add_clients_measurements
   npx prisma generate
   ```

2. **Seed templates par défaut** (optionnel, ou lazy lors de première utilisation)
   ```bash
   npx prisma db seed # Ajouter templates dans seed.ts
   ```

3. **Déploiement Vercel**
   - Build automatique sur push main
   - Variables d'environnement déjà configurées (DATABASE_URL)
   - Vérifier migration appliquée sur DB production

4. **Activation UI**
   - Menu "Clients" devient cliquable dans sidebar
   - Redirection vers `/dashboard/clients`

### Rollback strategy

**Si bug critique détecté** :
1. Désactiver menu "Clients" dans sidebar (commit rapide)
2. Déployer hotfix Vercel (< 2 min)
3. Investiguer problème en local
4. Rollback migration Prisma si nécessaire :
   ```bash
   npx prisma migrate resolve --rolled-back <migration-name>
   ```

**Migration réversible** : Les 3 nouvelles tables n'affectent pas les tables existantes (pas de foreign keys vers `clients` depuis d'autres modules). Suppression safe.

## Open Questions

**Q1** : Faut-il permettre de supprimer un template de mesures encore utilisé par des clients ?
- **Option A** : Bloquer suppression si utilisé (référence integrity)
- **Option B** : Soft delete template + garder données mesures en JSON
- **Réponse à trancher** : Sprint 2 tasks incluront décision finale (penche vers Option B)

**Q2** : Les clients partagent-ils les mêmes templates ou chaque client a son propre template assigné ?
- **Clarification** : Template = modèle réutilisable. Client A et B peuvent utiliser "Template Femme".
- `client_measurements.template_id` référence le template utilisé LORS de la prise de mesures.

**Q3** : Doit-on permettre de modifier les mesures historiques (ex: correction d'erreur de saisie) ?
- **Réponse** : Non pour MVP. Immutable history = principe. Si erreur, créer nouvelle entrée avec note "Correction de mesures du JJ/MM".
- Feature "Éditer mesures" peut être ajoutée Sprint futur si demande utilisateur forte.

**Q4** : Quelle unité par défaut pour les mesures (cm, pouces) ?
- **Réponse** : Centimètres (cm) par défaut pour marché africain francophone.
- Chaque champ de template peut spécifier son unité (cm, pouces, etc.) pour flexibilité future.
