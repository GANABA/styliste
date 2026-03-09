## Context

Les sprints 1-3 ont livré : auth, gestion clients/mesures, commandes avec photos et workflow de statuts. Le schéma Prisma contient les modèles `Order`, `Client`, `Stylist` et le champ `payment_status` sur `Order`. Le dashboard affiche des valeurs statiques ("—"). Sprint 4 complète le cycle de vie d'une commande en ajoutant la traçabilité financière, la vue calendrier et les KPIs réels.

Contraintes :
- Mobile-first, connexion 3G — minimiser les bundles et les requêtes
- Vercel serverless — pas de longues tâches bloquantes (timeout 10s)
- Pas de gateway de paiement réelle pour le MVP (Fedapay en Phase 3)

## Goals / Non-Goals

**Goals:**
- Enregistrement manuel des paiements (cash, mobile money, virement) avec calcul automatique du solde
- Génération d'un reçu PDF simple côté serveur (API route Next.js)
- Vue planning liste des commandes triées par date promise avec code couleur statut
- Dashboard avec KPIs temps réel via une seule requête API agrégée

**Non-Goals:**
- Intégration Fedapay / paiement en ligne (Phase 3)
- Calendrier drag-and-drop (trop lourd pour MVP)
- Graphiques de revenus (reporté Sprint 5 si budget le permet)
- Notifications automatiques de rappel de paiement (Sprint 5)
- Export CSV des paiements (Sprint 6)

## Decisions

### 1. Modèle `Payment` séparé de `Order`

**Choix** : Table `Payment` indépendante avec FK vers `Order` et `Stylist`.

**Pourquoi** : Un seul champ `advance_amount` sur `Order` ne permet pas l'historique (plusieurs versements successifs). La table séparée donne un log complet, facilite les remboursements et s'aligne avec le schéma documenté dans `DATABASE_SCHEMA.md`.

**Alternative écartée** : JSONB `payments_log` sur `Order` — difficile à requêter et à faire évoluer.

### 2. PDF généré côté serveur via API route

**Choix** : Utiliser `jspdf` dans une API route Next.js (`GET /api/payments/[id]/receipt`) qui retourne un `application/pdf`.

**Pourquoi** : La génération côté client avec jsPDF expose la logique métier et dépend du navigateur. Côté serveur : sécurisé, testable, fonctionnel même sur PWA offline-first (le PDF est téléchargé quand connexion disponible).

**Alternative écartée** : `@react-pdf/renderer` — bundle trop lourd (+300KB), conçu pour le client.

**Contrainte Vercel** : la génération doit rester sous 2s (reçu simple, pas de rendu complexe). Documenté comme limite connue.

### 3. Planning : vue liste, pas de calendrier visuel

**Choix** : Page `/dashboard/calendar` avec liste chronologique (groupée par semaine) et code couleur par statut, sans bibliothèque de calendrier.

**Pourquoi** : `@fullcalendar/react` = +500KB gzip, incompatible avec l'objectif bundle mobile. Une liste triée par date couvre 90% du besoin (savoir ce qui est dû quand). Le drag-and-drop est reporté.

**Alternative écartée** : FullCalendar avec lazy load — complexité injustifiée pour MVP.

### 4. Dashboard stats : agrégation côté API, un seul endpoint

**Choix** : `GET /api/dashboard/stats` retourne toutes les métriques en une requête Prisma agrégée.

**Pourquoi** : Évite 4-5 appels séparés depuis le client (coûteux sur 3G). L'agrégation en DB est plus performante que côté JS.

```typescript
// Structure de la réponse
{
  activeOrders: number,       // statuts IN_PROGRESS + READY
  readyOrders: number,        // statut READY
  overdueOrders: number,      // promised_date < aujourd'hui, non livré
  revenue30Days: number,      // somme payments 30 derniers jours
  recentOrders: Order[],      // 5 dernières commandes
  upcomingDeadlines: Order[]  // 7 prochains jours, non livrées
}
```

## Risks / Trade-offs

- **PDF timeout Vercel** : si la commande a beaucoup de données, la génération pourrait dépasser 10s → Mitigation : reçu minimaliste (champs essentiels uniquement, pas d'images)
- **Cohérence `total_paid` sur `Order`** : le champ doit être mis à jour à chaque nouveau paiement → Mitigation : mise à jour atomique dans la même transaction Prisma que l'insert Payment
- **jsPDF bundle** : ~250KB côté serveur, acceptable car non chargé côté client → Mitigation : import dynamique dans l'API route uniquement

## Migration Plan

1. Ajouter le modèle `Payment` dans `schema.prisma`
2. `npx prisma migrate dev --name add-payments`
3. Déployer sans downtime (ajout de table, pas de modification de colonnes existantes)
4. Rollback : `npx prisma migrate resolve --rolled-back add-payments` (supprime la table vide)

## Open Questions

- Faut-il afficher le graphique de revenus (Chart.js/Recharts) dès Sprint 4 ou le reporter à Sprint 5 ? → Décision : reporter, garder le dashboard simple avec KPIs textuels pour MVP
