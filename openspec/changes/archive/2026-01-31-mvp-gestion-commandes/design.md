## Context

Ce change implémente la fonctionnalité centrale du MVP Styliste.com : la gestion des commandes de vêtements sur mesure. Cette fonctionnalité s'appuie sur l'infrastructure existante (authentification, CRM clients, gestion des mesures) déjà mise en place dans les changes précédents.

**État actuel** : Le CRM client et la gestion des mesures sont fonctionnels, mais il manque la fonctionnalité core business : créer et suivre les commandes.

**Contraintes** :
- Mobile-first, optimisé pour connexions instables (Afrique de l'Ouest)
- Architecture multi-tenant stricte (isolation RLS PostgreSQL)
- Performance : Bundle < 100KB, TTI < 3s sur 3G
- Stack : SvelteKit + Supabase + PostgreSQL + Drizzle ORM
- Réutilisation des composants UI existants
- Intégration transparente avec les mesures existantes

**Stakeholders** : Stylistes africains (Bénin en priorité), cible B2B.

## Goals / Non-Goals

**Goals:**
- Permettre au styliste de créer des commandes liées à un client avec snapshot automatique des mesures
- Gérer le workflow complet du statut des commandes (En cours → Prêt → Livré)
- Fournir une recherche et un filtrage efficaces (par statut, client, type de vêtement)
- Afficher des statistiques synthétiques sur le dashboard (compteurs par statut, CA mensuel)
- Enrichir la page client avec l'affichage des commandes
- Assurer l'isolation multi-tenant stricte via RLS PostgreSQL
- Générer des numéros de commande uniques et lisibles

**Non-Goals:**
- Notifications automatiques aux clients (autre change MVP)
- Gestion des paiements et factures (V1)
- Planning et calendrier (autre change MVP)
- Gestion des stocks de tissus (V1)
- Multi-employés (V1)
- Workflow de statut complexe avec approbations (V1)

## Decisions

### 1. Schéma de données : Table orders avec snapshot des mesures

**Décision** : Créer une table `orders` avec un champ JSONB `measurements_snapshot` pour stocker une copie des mesures au moment de la création de la commande.

**Rationale** :
- Les mesures d'un client peuvent évoluer dans le temps (perte/prise de poids)
- Une commande doit toujours référencer les mesures exactes utilisées lors de sa création
- Évite les incohérences si les mesures sont mises à jour après création de la commande
- Facilite les retouches (on sait exactement quelles mesures ont été utilisées)
- Pattern déjà validé dans le change précédent (mesures)

**Schéma** :
```sql
orders (
  id UUID PRIMARY KEY,
  styliste_id UUID REFERENCES stylistes(id) NOT NULL,
  client_id UUID REFERENCES clients(id) NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  garment_type TEXT NOT NULL,
  description TEXT,
  measurements_snapshot JSONB, -- snapshot des dernières mesures du client
  price NUMERIC,
  currency TEXT DEFAULT 'XOF',
  status TEXT NOT NULL DEFAULT 'pending', -- pending | ready | delivered
  due_date DATE,
  delivered_at TIMESTAMPTZ,
  notes TEXT,
  deleted_at TIMESTAMPTZ, -- soft delete
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- Index pour performance
CREATE INDEX idx_orders_styliste_status ON orders(styliste_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_client ON orders(client_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_created ON orders(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_due_date ON orders(styliste_id, due_date) WHERE deleted_at IS NULL AND status != 'delivered';
```

**Format du snapshot JSONB** :
```json
{
  "tour_poitrine": { "value": 95, "unit": "cm" },
  "tour_taille": { "value": 78, "unit": "cm" },
  "tour_hanches": { "value": 102, "unit": "cm" },
  "taken_at": "2026-01-30T10:30:00Z"
}
```

**Alternatives considérées** :
- **Référence vers measurements via FK** : Problème si les mesures sont mises à jour après création de la commande
- **Recalculer à chaque affichage** : Incohérent et coûteux en requêtes

### 2. Génération du numéro de commande : Format STY-{YYYY}{MM}-{NNNN}

**Décision** : Générer automatiquement un numéro de commande au format `STY-202601-0042` avec un compteur séquentiel par styliste et par mois.

**Rationale** :
- Lisible et facile à communiquer au client par téléphone
- Séquentiel par mois pour limiter la taille du numéro
- Préfixe `STY` pour éviter confusion avec d'autres numéros (téléphone, etc.)
- Format facile à rechercher et à trier

**Implémentation** :
```typescript
// Helper function
async function generateOrderNumber(stylisteId: string, db: DrizzleDB): Promise<string> {
  const now = new Date();
  const yearMonth = format(now, 'yyyyMM'); // "202601"
  const prefix = `STY-${yearMonth}-`;

  // Récupérer le dernier numéro du mois pour ce styliste
  const [lastOrder] = await db
    .select({ orderNumber: orders.orderNumber })
    .from(orders)
    .where(
      and(
        eq(orders.stylisteId, stylisteId),
        like(orders.orderNumber, `${prefix}%`)
      )
    )
    .orderBy(desc(orders.orderNumber))
    .limit(1);

  let nextNumber = 1;
  if (lastOrder) {
    const lastNumber = parseInt(lastOrder.orderNumber.split('-')[2], 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}
```

**Protection contre les collisions** :
- Index unique sur `order_number`
- Transaction PostgreSQL lors de la création
- Retry automatique en cas de collision (très rare)

**Alternatives considérées** :
- **UUID comme numéro de commande** : Pas lisible, difficile à communiquer par téléphone
- **Séquence globale sans mois** : Numéros très longs après quelques années
- **Compteur Redis** : Dépendance externe non nécessaire pour ce volume

### 3. Workflow de statut : Machine à états simple (3 statuts)

**Décision** : Utiliser un workflow linéaire avec 3 statuts : `pending` (En cours), `ready` (Prêt), `delivered` (Livré).

**Rationale** :
- Simplicité : workflow facile à comprendre pour les stylistes
- Couverture des besoins MVP : 95% des cas d'usage
- Extensible : facile d'ajouter des statuts intermédiaires en V1 si besoin (ex: "En retouche", "Payé")
- Adapté au contexte africain : les stylistes utilisent actuellement des cahiers papier, un workflow simple favorise l'adoption

**Transitions autorisées** :
```
pending → ready → delivered (workflow normal)
ready → pending (retouches)
delivered = état final (pas de transition possible)
```

**Implémentation** :
```typescript
export const ORDER_STATUSES = ['pending', 'ready', 'delivered'] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En cours',
  ready: 'Prêt',
  delivered: 'Livré',
};

// Validation des transitions
export function canTransitionTo(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  if (currentStatus === 'delivered') return false; // État final
  if (currentStatus === 'pending' && newStatus === 'ready') return true;
  if (currentStatus === 'ready' && newStatus === 'delivered') return true;
  if (currentStatus === 'ready' && newStatus === 'pending') return true; // Retouche
  return false;
}
```

**Alternatives considérées** :
- **Workflow complexe avec 7+ statuts** : Trop complexe pour le MVP, risque de confondre les utilisateurs
- **Pas de workflow (juste un booléen "terminé")** : Pas assez de granularité, ne permet pas de distinguer "prêt" et "livré"

### 4. Types de vêtements : Liste pré-définie + option "Autre"

**Décision** : Fournir une liste de types de vêtements pré-définis avec une option "Autre" pour les cas personnalisés.

**Rationale** :
- Les types standards couvrent 90% des besoins des stylistes africains
- Facilite la recherche et le filtrage (types normalisés)
- Option "Autre" offre la flexibilité nécessaire sans complexité
- Évite les doublons et fautes de frappe

**Types pré-définis** :
```typescript
export const GARMENT_TYPES = [
  'Robe',
  'Costume',
  'Boubou',
  'Chemise',
  'Pantalon',
  'Jupe',
  'Veste',
  'Caftan',
  'Autre',
] as const;
```

**Implémentation UI** :
- Select dropdown avec les types pré-définis
- Si "Autre" sélectionné, afficher un champ texte pour saisie libre

**Alternatives considérées** :
- **Saisie libre uniquement** : Risque de doublons ("Robe" vs "robe" vs "ROBE")
- **Table garment_types** : Trop complexe pour le MVP, ajouterait de la latence

### 5. Suppression des commandes : Soft delete

**Décision** : Implémenter un soft delete avec une colonne `deleted_at` au lieu de supprimer réellement les enregistrements.

**Rationale** :
- Évite la perte de données accidentelle
- Permet de restaurer une commande supprimée par erreur
- Conserve l'historique pour les statistiques et le CA
- Pattern standard et sûr

**Implémentation** :
```typescript
// Soft delete
await db
  .update(orders)
  .set({ deletedAt: new Date() })
  .where(eq(orders.id, orderId));

// Filtrer les commandes supprimées dans toutes les requêtes
const activeOrders = await db
  .select()
  .from(orders)
  .where(
    and(
      eq(orders.stylisteId, stylisteId),
      isNull(orders.deletedAt) // Exclure les supprimées
    )
  );
```

**Alternatives considérées** :
- **Hard delete** : Risque de perte de données, pas de possibilité de restauration
- **Table orders_deleted séparée** : Complexité inutile pour le MVP

### 6. Dashboard : Statistiques synthétiques

**Décision** : Créer un endpoint `/api/orders/stats` qui retourne des compteurs pré-calculés pour le dashboard.

**Rationale** :
- Performance : un seul appel API pour toutes les stats
- Simplicité : pas de calculs côté client
- Évolutif : facile d'ajouter de nouvelles métriques

**Métriques dashboard** :
```typescript
interface OrderStats {
  pending: number;      // Commandes en cours
  ready: number;        // Commandes prêtes
  delivered: number;    // Commandes livrées ce mois
  dueThisWeek: Order[]; // Commandes à livrer cette semaine
  monthlyRevenue: number; // CA du mois (somme des commandes livrées)
}
```

**Requête optimisée** :
```typescript
const now = new Date();
const startOfMonth = startOfMonth(now);
const endOfWeek = addDays(now, 7);

// Une seule requête avec compteurs
const stats = await db
  .select({
    status: orders.status,
    count: sql<number>`count(*)`,
    revenue: sql<number>`sum(CASE WHEN status = 'delivered' AND delivered_at >= ${startOfMonth} THEN price ELSE 0 END)`,
  })
  .from(orders)
  .where(
    and(
      eq(orders.stylisteId, stylisteId),
      isNull(orders.deletedAt)
    )
  )
  .groupBy(orders.status);
```

**Alternatives considérées** :
- **Calculs côté client** : Lent, consomme plus de data (mobile)
- **Cache Redis** : Overkill pour le MVP, ajoute une dépendance

### 7. Devise : XOF (Franc CFA) par défaut

**Décision** : Utiliser XOF (Franc CFA) comme devise par défaut avec possibilité d'extension future.

**Rationale** :
- Marché cible MVP : Bénin (utilise XOF)
- Simplifie l'implémentation initiale
- Colonne `currency` déjà prévue dans le schéma pour extension future

**Implémentation** :
```typescript
const createOrderSchema = z.object({
  // ...
  price: z.number().positive().max(10000000), // 10M XOF max
  currency: z.enum(['XOF']).default('XOF'),
});
```

**Extension V1** : Ajouter EUR, USD, autres devises africaines selon expansion géographique.

### 8. Enrichissement de la page client

**Décision** : Ajouter une section "Commandes" sur la page `/clients/[id]` avec liste des commandes du client.

**Rationale** :
- Vue holistique du client (infos + mesures + commandes)
- Workflow naturel : consulter client → voir historique → créer commande
- Évite de multiplier les pages et la navigation

**Structure** :
```svelte
<!-- src/routes/(app)/clients/[id]/+page.svelte -->
<section class="commandes">
  <h2>Commandes</h2>

  {#if orders.length === 0}
    <EmptyState>
      <a href="/orders/new?clientId={client.id}">Créer une commande</a>
    </EmptyState>
  {:else}
    <OrderList {orders} />
    <a href="/orders/new?clientId={client.id}">Nouvelle commande</a>
  {/if}
</section>
```

**Alternatives considérées** :
- **Page séparée `/clients/[id]/orders`** : Navigation supplémentaire, mauvaise UX mobile
- **Onglets dans la page client** : Trop complexe pour le MVP

## Risks / Trade-offs

### [Risque] Génération de numéros de commande : Collisions en haute concurrence

**Contexte** : Si deux commandes sont créées simultanément par le même styliste, risque de collision de numéro.

**Mitigation** :
- Index unique sur `order_number` → PostgreSQL rejette les doublons
- Transaction lors de la création
- Retry automatique avec nouveau numéro en cas d'échec (max 3 tentatives)
- En pratique, très rare pour un styliste individuel (faible concurrence)

**Code** :
```typescript
async function createOrderWithRetry(data, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const orderNumber = await generateOrderNumber(data.stylisteId, db);
      return await db.insert(orders).values({ ...data, orderNumber });
    } catch (error) {
      if (error.code === '23505' && i < maxRetries - 1) {
        // Unique violation, retry
        continue;
      }
      throw error;
    }
  }
}
```

### [Trade-off] Snapshot des mesures : Duplication de données

**Accepté car** :
- La cohérence historique prime sur la normalisation
- Coût de stockage négligeable (quelques KB par commande, ~10 mesures max)
- Simplifie les requêtes (pas de JOIN complexe pour afficher les mesures d'une commande)
- Garantit que les mesures d'une commande ne changent jamais

**Impact** :
- Si un styliste a 1000 commandes/an avec 10 mesures/commande : ~100KB de duplication
- Acceptable pour un gain de cohérence et simplicité

### [Trade-off] Workflow simple (3 statuts) vs workflow complexe

**Accepté car** :
- 95% des stylistes n'utilisent pas de workflow complexe actuellement (gestion papier)
- Simplicité favorise l'adoption (principe MVP)
- Extensible facilement en V1 si besoin identifié après usage réel
- Évite la paralysie par l'analyse

**Feedback utilisateur attendu** :
- Si les stylistes demandent des statuts supplémentaires (ex: "En attente de tissu", "En retouche"), on pourra les ajouter en V1

### [Risque] Types de vêtements personnalisés : Doublons possibles

**Contexte** : Si plusieurs stylistes utilisent "Autre" et saisissent le même type différemment ("Kaftan" vs "Caftan").

**Mitigation** :
- Liste pré-définie couvre les types courants (réduit l'usage de "Autre")
- Normalisation côté frontend (trim, capitalisation)
- V1 : Ajout de suggestions basées sur les types personnalisés existants du styliste

**Impact acceptable pour MVP** : Pas bloquant, amélioration progressive en V1.

### [Risque] Performance dashboard avec beaucoup de commandes

**Contexte** : Si un styliste a des milliers de commandes, le calcul des stats pourrait être lent.

**Mitigation** :
- Index sur `(styliste_id, status)` et `(styliste_id, due_date)`
- Requête optimisée avec `count()` et `sum()` côté PostgreSQL (pas côté app)
- Filtre `deleted_at IS NULL` dans l'index (partial index)
- Limite "Commandes à livrer cette semaine" à 50 max

**Dégradation progressive** :
- < 1000 commandes : < 50ms
- 1000-5000 commandes : < 200ms
- > 5000 commandes : Envisager cache ou matérialized view (V1)

En pratique, peu probable qu'un styliste individuel atteigne 5000 commandes (13 commandes/jour pendant 1 an).

## Migration Plan

**Déploiement initial** :

1. **Database setup** :
   - La table `orders` existe déjà (créée dans le change précédent)
   - Appliquer les scripts RLS et indexes manquants :
     ```sql
     -- RLS Policies
     ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

     CREATE POLICY "Stylistes can view own orders"
       ON orders FOR SELECT
       USING (styliste_id = auth.uid());

     CREATE POLICY "Stylistes can insert own orders"
       ON orders FOR INSERT
       WITH CHECK (styliste_id = auth.uid());

     CREATE POLICY "Stylistes can update own orders"
       ON orders FOR UPDATE
       USING (styliste_id = auth.uid());

     CREATE POLICY "Stylistes can soft delete own orders"
       ON orders FOR UPDATE
       USING (styliste_id = auth.uid());

     -- Indexes
     CREATE INDEX idx_orders_styliste_status ON orders(styliste_id, status) WHERE deleted_at IS NULL;
     CREATE INDEX idx_orders_client ON orders(client_id) WHERE deleted_at IS NULL;
     CREATE INDEX idx_orders_created ON orders(created_at DESC) WHERE deleted_at IS NULL;
     CREATE INDEX idx_orders_due_date ON orders(styliste_id, due_date) WHERE deleted_at IS NULL AND status != 'delivered';
     ```

2. **Backend deployment** :
   - Déployer les 7 nouveaux endpoints API
   - Tester en staging avec données de test
   - Vérifier les performances des requêtes (EXPLAIN ANALYZE)

3. **Frontend deployment** :
   - Build SvelteKit (`npm run build`)
   - Vérifier bundle size (target < 100KB)
   - Deploy sur Cloudflare Pages
   - Aucune nouvelle variable d'environnement nécessaire

4. **Smoke tests** :
   - Créer une commande pour un client test
   - Vérifier le snapshot des mesures dans JSONB
   - Tester les transitions de statut (pending → ready → delivered)
   - Vérifier le soft delete
   - Tester le dashboard (compteurs et CA mensuel)
   - Vérifier l'affichage sur la page client
   - Tester l'isolation multi-tenant (2 comptes stylistes différents)

**Rollback** :
- Cloudflare Pages permet rollback instantané vers version précédente
- Base de données : les RLS policies et indexes peuvent rester (pas d'impact sur l'existant)
- Aucune migration destructive (pas de DROP ou ALTER COLUMN)

**Monitoring post-déploiement** :
- Surveiller les erreurs Sentry sur les endpoints orders
- Vérifier les performances des requêtes dashboard via logs Supabase
- Feedback utilisateurs sur le workflow de statut

## Open Questions

**Q1: Faut-il permettre la modification d'une commande livrée ?**
→ **Décision suggérée** : Non, `delivered` est un état final. Si modification nécessaire, créer une nouvelle commande (retouche).

**Q2: Devise : Faut-il permettre d'autres devises que XOF pour le MVP ?**
→ **Décision suggérée** : XOF uniquement pour MVP Bénin. Extension en V1 pour multi-pays (EUR, USD, autres devises africaines).

**Q3: Unité de prix : Stocker en centimes ou en unités entières ?**
→ **Décision suggérée** : Stocker en unités entières (ex: 15000 XOF, pas 1500000 centimes). Le Franc CFA n'a pas de subdivision couramment utilisée.

**Q4: Permettre la suppression d'une commande livrée ?**
→ **Décision suggérée** : Non, afficher un message d'erreur "Impossible de supprimer une commande livrée". Protéger l'historique et le CA.

**Q5: Recherche : Faut-il supporter la recherche full-text sur description et notes ?**
→ **Décision suggérée** : MVP : recherche simple par numéro de commande, client, type de vêtement (LIKE). V1 : envisager PostgreSQL full-text search si demandé.
