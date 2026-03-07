## 1. Schéma & Migration

- [x] 1.1 Ajouter le modèle `Payment` dans `prisma/schema.prisma` (id, orderId, stylistId, amount, paymentType, paymentMethod, mobileMoneyProvider, mobileMoneyNumber, transactionReference, paymentStatus, paymentDate, notes, receiptUrl, createdAt, updatedAt)
- [x] 1.2 Ajouter les enums Prisma `PaymentType` (ADVANCE, PARTIAL, FINAL, REFUND) et `PaymentMethod` (CASH, MOBILE_MONEY, BANK_TRANSFER)
- [x] 1.3 Ajouter la relation `payments Payment[]` sur le modèle `Order`
- [x] 1.4 Ajouter la relation `payments Payment[]` sur le modèle `Stylist`
- [x] 1.5 Exécuter `npx prisma migrate dev --name add-payments` et vérifier la migration

## 2. API Paiements

- [x] 2.1 Créer `src/app/api/payments/route.ts` — `GET` liste tous les paiements du styliste authentifié (avec jointure commande et client)
- [x] 2.2 Créer `src/app/api/orders/[id]/payments/route.ts` — `GET` liste les paiements d'une commande, `POST` enregistre un nouveau paiement
- [x] 2.3 Dans le `POST`, mettre à jour atomiquement `order.total_paid` et `order.payment_status` (UNPAID / PARTIAL / PAID) dans la même transaction Prisma
- [x] 2.4 Créer `src/app/api/payments/[id]/receipt/route.ts` — `GET` génère et retourne un reçu PDF avec `jspdf`
- [x] 2.5 Ajouter la validation Zod sur le body du POST (montant > 0, type valide, méthode valide)
- [x] 2.6 Vérifier l'isolation multi-tenant sur toutes les routes (stylistId depuis session)

## 3. Composants Paiement

- [x] 3.1 Créer `src/components/payments/PaymentSummary.tsx` — affiche prix total, total payé, solde restant, badge `payment_status` (rouge/orange/vert)
- [x] 3.2 Créer `src/components/payments/PaymentForm.tsx` — formulaire d'enregistrement (montant, type, méthode, opérateur Mobile Money conditionnel, notes)
- [x] 3.3 Créer `src/components/payments/PaymentHistory.tsx` — liste chronologique des paiements avec montant, type, méthode, date et bouton reçu PDF
- [x] 3.4 Intégrer `PaymentSummary`, `PaymentHistory` et `PaymentForm` (dans un Dialog/Sheet) dans `src/app/dashboard/orders/[id]/page.tsx`

## 4. Page Historique Paiements

- [x] 4.1 Créer `src/app/dashboard/payments/page.tsx` — liste tous les paiements du styliste avec : numéro commande, nom client, montant, méthode, date, lien vers commande
- [x] 4.2 Ajouter un total récapitulatif en haut (CA total toutes méthodes)
- [x] 4.3 Ajouter le lien "Paiements" dans la sidebar de navigation

## 5. API Dashboard Stats

- [x] 5.1 Créer `src/app/api/dashboard/stats/route.ts` — `GET` retourne en une requête agrégée : `activeOrders`, `readyOrders`, `overdueOrders`, `revenue30Days`, `recentOrders` (5), `upcomingDeadlines` (7 jours)
- [x] 5.2 Calculer `overdueOrders` : commandes dont `promised_date < today` et statut pas DELIVERED ni CANCELED
- [x] 5.3 Calculer `revenue30Days` : somme des `Payment.amount` des 30 derniers jours avec `paymentStatus = COMPLETED`

## 6. Dashboard avec Stats Réelles

- [x] 6.1 Refactoriser `src/app/dashboard/page.tsx` en Server Component (ou avec React Query) qui fetch `GET /api/dashboard/stats`
- [x] 6.2 Remplacer les cartes statiques "—" par les KPIs réels (commandes actives, prêtes, CA 30j, retards)
- [x] 6.3 Ajouter une section "Commandes récentes" (5 dernières) avec statut et client
- [x] 6.4 Ajouter une section "Prochaines échéances" (7 jours) avec date promise et statut
- [x] 6.5 Ajouter les boutons d'accès rapide : "Nouvelle commande", "Paiements", "Planning"
- [x] 6.6 Mettre à jour la Roadmap (Sprint 4 coché, Sprint 5 en attente)

## 7. Page Planning / Calendrier

- [x] 7.1 Créer `src/app/dashboard/calendar/page.tsx` — fetch les commandes non livrées triées par `promised_date` ASC
- [x] 7.2 Grouper les commandes par semaine (ex: "Semaine du 3 mars")
- [x] 7.3 Appliquer le code couleur par statut : rouge (retard), vert (READY), bleu (IN_PROGRESS), gris (QUOTE)
- [x] 7.4 Afficher un bandeau d'alerte si des commandes sont en retard
- [x] 7.5 Chaque commande est cliquable et redirige vers `/dashboard/orders/[id]`
- [x] 7.6 Ajouter le lien "Planning" dans la sidebar de navigation

## 8. Génération PDF Reçu

- [x] 8.1 Installer `jspdf` : `npm install jspdf`
- [x] 8.2 Implémenter la génération PDF dans `src/app/api/payments/[id]/receipt/route.ts` avec : nom styliste, nom client, numéro commande, type vêtement, montant payé, méthode, date, solde restant
- [x] 8.3 Vérifier que le reçu est accessible uniquement par le styliste propriétaire (403 sinon)

## 9. Tests & Validation

- [x] 9.1 Tester le flow complet paiement : enregistrer avance → paiement partiel → solde → vérifier `payment_status = PAID`
- [x] 9.2 Tester la génération et le téléchargement du reçu PDF
- [x] 9.3 Vérifier les stats du dashboard avec des données réelles
- [x] 9.4 Tester la page planning avec des commandes en retard, prêtes, en cours
- [x] 9.5 Valider la responsiveness mobile (375px) sur toutes les nouvelles pages
- [x] 9.6 Vérifier l'isolation multi-tenant (un styliste ne voit pas les paiements d'un autre)

