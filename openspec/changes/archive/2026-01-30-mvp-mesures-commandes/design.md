## Context

Ce change implémente deux fonctionnalités critiques du MVP Styliste.com : la gestion des mesures corporelles et la gestion des commandes. Ces fonctionnalités s'appuient sur l'infrastructure existante (authentification, CRM clients, profil styliste) déjà mise en place dans le change précédent `mvp-compte-profil-crm`.

**État actuel** : Le CRM client est fonctionnel mais ne permet pas encore de stocker les mesures ni de créer des commandes.

**Contraintes** :
- Mobile-first, optimisé pour connexions instables (Afrique de l'Ouest)
- Architecture multi-tenant stricte (isolation RLS PostgreSQL)
- Performance : Bundle < 100KB, TTI < 3s sur 3G
- Stack : SvelteKit + Supabase + PostgreSQL + Drizzle ORM
- Réutilisation des composants UI existants

**Stakeholders** : Stylistes africains (Bénin en priorité), cible B2B.

## Goals / Non-Goals

**Goals:**
- Permettre au styliste d'enregistrer et consulter les mesures corporelles de ses clients
- Maintenir un historique des mesures (évolution dans le temps)
- Permettre au styliste de créer et suivre l'état des commandes (En cours, Prêt, Livré)
- Lier automatiquement commandes, clients et mesures
- Fournir un tableau de bord avec vue d'ensemble des commandes par statut
- Enrichir la page détail client avec mesures et commandes associées
- Assurer l'isolation multi-tenant stricte (RLS PostgreSQL)

**Non-Goals:**
- Notifications automatiques aux clients (autre change MVP)
- Planning et calendrier (autre change MVP)
- Gestion des paiements (V1)
- Factures (V1)
- Gestion des stocks tissus (V1)
- Multi-employés (V1)
- Génération IA de modèles (V2)

## Decisions

### 1. Schéma de données : Historique des mesures via versioning

**Décision** : Stocker chaque prise de mesures comme une entrée distincte avec timestamp, plutôt qu'écraser les anciennes valeurs.

**Rationale** :
- Permet de suivre l'évolution morphologique du client dans le temps
- Utile pour les retouches et ajustements
- Permet de comparer les mesures entre deux dates
- Réversibilité : possibilité de restaurer d'anciennes mesures

**Schéma** :
```sql
measurements (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(id) NOT NULL,
  styliste_id UUID REFERENCES stylistes(id) NOT NULL, -- pour RLS
  measurement_type TEXT NOT NULL, -- "tour_poitrine", "tour_taille", etc.
  value NUMERIC NOT NULL, -- en centimètres
  unit TEXT DEFAULT 'cm',
  notes TEXT,
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Index pour récupérer rapidement les dernières mesures d'un client
CREATE INDEX idx_measurements_client_date ON measurements(client_id, taken_at DESC);
CREATE INDEX idx_measurements_styliste ON measurements(styliste_id);
```

**Alternatives considérées** :
- **Stocker toutes les mesures dans un JSON** : Moins flexible pour les requêtes, difficile à étendre
- **Table unique avec colonnes par type de mesure** : Rigide, pas adaptable aux mesures personnalisées

### 2. Types de mesures : Standards + Personnalisées

**Décision** : Fournir des types de mesures standards (pré-remplis) + possibilité d'ajouter des mesures personnalisées par styliste.

**Rationale** :
- Les mesures standards couvrent 90% des besoins (tour de poitrine, taille, hanches, longueur bras, etc.)
- Les stylistes africains utilisent parfois des mesures spécifiques selon le type de tenue
- Flexibilité sans complexité

**Types standards (pré-définis côté frontend)** :
- Tour de poitrine
- Tour de taille
- Tour de hanches
- Longueur d'épaule
- Longueur de bras
- Longueur de torse
- Tour de cou
- Longueur de jambe
- Tour de cuisse

**Mesures personnalisées** : Stockées avec un `measurement_type` custom (ex: "tour_poignet_custom").

**Alternatives considérées** :
- **Table `measurement_types`** : Trop complexe pour le MVP, ajouterait de la latence
- **Mesures uniquement personnalisées** : Mauvaise UX, chaque styliste devrait tout recréer

### 3. Workflow des commandes : Machine à états simple

**Décision** : Utiliser un workflow linéaire à 3 statuts : `pending` (En cours), `ready` (Prêt), `delivered` (Livré).

**Rationale** :
- Simplicité : workflow facile à comprendre
- Couverture des besoins MVP : 95% des cas d'usage
- Extensible : facile d'ajouter des statuts intermédiaires en V1 si besoin (ex: "En retouche", "Payé")

**Schéma** :
```sql
orders (
  id UUID PRIMARY KEY,
  styliste_id UUID REFERENCES stylistes(id) NOT NULL,
  client_id UUID REFERENCES clients(id) NOT NULL,
  order_number TEXT UNIQUE NOT NULL, -- généré automatiquement
  garment_type TEXT NOT NULL, -- "Robe", "Costume", "Boubou", etc.
  description TEXT,
  measurements_snapshot JSONB, -- snapshot des mesures au moment de la commande
  price NUMERIC,
  currency TEXT DEFAULT 'XOF',
  status TEXT NOT NULL DEFAULT 'pending', -- pending | ready | delivered
  due_date DATE,
  delivered_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- Index pour filtrer par statut et récupérer les commandes récentes
CREATE INDEX idx_orders_styliste_status ON orders(styliste_id, status);
CREATE INDEX idx_orders_client ON orders(client_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
```

**Transitions autorisées** :
- `pending` → `ready` → `delivered`
- `ready` → `pending` (retouche)
- `delivered` est un état final

**Alternatives considérées** :
- **Workflow complexe avec 7+ statuts** : Trop complexe pour le MVP, utilisateurs africains préfèrent simplicité
- **Pas de workflow (juste un booléen "terminé")** : Pas assez de granularité

### 4. Numéro de commande : Auto-généré avec format lisible

**Décision** : Générer automatiquement un numéro de commande au format `STY-{YYYY}{MM}-{NNNN}` (ex: `STY-202601-0042`).

**Rationale** :
- Lisible et facile à communiquer au client par téléphone
- Unique et séquentiel par mois
- Préfixe `STY` pour éviter confusion avec autres numéros
- Format facile à rechercher

**Implémentation** : Fonction PostgreSQL ou génération côté API avec compteur par styliste/mois.

**Alternatives considérées** :
- **UUID comme numéro de commande** : Pas lisible, difficile à communiquer
- **Séquence globale** : Collision possible en multi-tenant

### 5. Snapshot des mesures dans la commande

**Décision** : Stocker un snapshot (copie) des mesures du client dans la commande au moment de sa création (champ JSONB `measurements_snapshot`).

**Rationale** :
- Les mesures peuvent évoluer dans le temps
- Une commande doit toujours faire référence aux mesures utilisées lors de sa création
- Permet d'éviter les incohérences si le client perd/prend du poids
- Facilite les retouches (on sait quelles mesures ont été utilisées)

**Format JSONB** :
```json
{
  "tour_poitrine": 95,
  "tour_taille": 78,
  "tour_hanches": 102,
  "taken_at": "2026-01-15T10:30:00Z"
}
```

**Alternatives considérées** :
- **Référence vers `measurements` via FK** : Problème si les mesures sont mises à jour après création commande
- **Recalculer à chaque fois** : Incohérent et coûteux

### 6. Dashboard : Vue synthétique par statut

**Décision** : Créer une page dashboard avec compteurs par statut et liste des commandes prioritaires.

**Rationale** :
- Permet au styliste de voir d'un coup d'œil l'état de son activité
- Aide à prioriser le travail (commandes à livrer bientôt)
- Métrique simple : nombre de commandes par statut

**Vue dashboard** :
- Compteurs : X commandes en cours, Y prêtes, Z livrées (ce mois)
- Liste : Commandes à livrer cette semaine (triées par due_date)
- Chiffre d'affaires du mois (somme des commandes livrées)

**Alternatives considérées** :
- **Dashboard complexe avec graphiques** : Trop lourd pour MVP, mauvaise performance mobile
- **Pas de dashboard** : Mauvaise UX, le styliste doit naviguer dans plusieurs pages

### 7. Enrichissement du détail client

**Décision** : Ajouter deux sections dans la page détail client (`/clients/[id]`) :
- Section "Mesures" avec dernières mesures + bouton "Prendre mesures"
- Section "Commandes" avec liste des commandes du client

**Rationale** :
- Vue holistique du client (toutes les infos au même endroit)
- Workflow naturel : consulter client → voir mesures → créer commande
- Évite de multiplier les pages

**Alternatives considérées** :
- **Pages séparées pour mesures et commandes** : Trop de navigation, mauvaise UX mobile

## Risks / Trade-offs

### [Risque] Génération de numéros de commande : Collisions potentielles en charge élevée

**Mitigation** :
- Utiliser une transaction PostgreSQL avec `SELECT FOR UPDATE` pour garantir unicité
- Ajouter un index unique sur `order_number`
- Si collision détectée : retry automatique avec nouveau numéro

### [Trade-off] Snapshot des mesures : Duplication de données

**Accepté car** :
- La cohérence historique prime sur la normalisation
- Coût de stockage négligeable (quelques KB par commande)
- Simplifie les requêtes (pas de JOIN complexe)

### [Risque] Performance avec historique de mesures volumineux

**Mitigation** :
- Index sur `(client_id, taken_at DESC)` pour récupérer rapidement les dernières mesures
- Pagination si > 20 mesures par client (rare en pratique)
- Lazy loading de l'historique (charger uniquement à la demande)

### [Trade-off] Workflow simple (3 statuts) vs workflow complexe

**Accepté car** :
- 95% des stylistes n'utilisent pas de workflow complexe actuellement (cahiers papier)
- Extensible facilement en V1 si besoin identifié après usage réel
- Simplicité favorise adoption

### [Risque] Mesures personnalisées : Possibilité de créer des doublons (ex: "Tour poitrine" vs "tour_poitrine")

**Mitigation** :
- Normalisation côté frontend (trim, lowercase)
- Suggestions autocomplete basées sur mesures existantes du styliste
- Documentation claire des types standards

## Migration Plan

**Déploiement initial (aucune donnée existante)** :

1. **Database setup** :
   - Exécuter migrations Drizzle pour créer tables `measurements` et `orders`
   - Activer RLS sur les deux tables
   - Créer les policies RLS
   - Créer les index de performance

2. **Frontend deployment** :
   - Build SvelteKit (`npm run build`)
   - Deploy sur Cloudflare Pages
   - Aucune nouvelle variable d'environnement nécessaire

3. **Smoke tests** :
   - Ajouter des mesures pour un client test
   - Créer une commande liée à ce client
   - Vérifier les transitions de statut (pending → ready → delivered)
   - Vérifier le snapshot des mesures dans la commande
   - Tester l'isolation multi-tenant (2 comptes stylistes différents)
   - Vérifier le dashboard (compteurs)

**Rollback** :
- Cloudflare Pages permet rollback instantané vers version précédente
- Migrations database à gérer manuellement si nécessaire
- Tables `measurements` et `orders` peuvent être supprimées sans impact sur CRM existant

## Open Questions

- **Types de tenues (garment_type)** : Faut-il pré-définir une liste ou laisser libre ?
  → **Décision suggérée** : Liste pré-définie + option "Autre" pour flexibilité (ex: Robe, Costume, Boubou, Chemise, Pantalon, Autre)

- **Devise par défaut** : Toujours XOF (Franc CFA) ou permettre d'autres devises ?
  → **Décision suggérée** : XOF par défaut pour MVP Bénin, extensible en V1 pour multi-pays

- **Unité des mesures** : Toujours en centimètres ou permettre pouces ?
  → **Décision suggérée** : Centimètres uniquement pour MVP (standard en Afrique de l'Ouest)

- **Suppression des commandes** : Soft delete ou hard delete ?
  → **Décision suggérée** : Soft delete (ajout colonne `deleted_at`) pour éviter perte de données
