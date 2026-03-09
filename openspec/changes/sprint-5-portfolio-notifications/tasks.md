## 1. Schema Prisma & Migration

- [x] 1.1 Ajouter champ `slug String? @unique` sur le modèle `Stylist` dans `prisma/schema.prisma`
- [x] 1.2 Créer modèle `PortfolioItem` (id, stylistId, imageUrl, thumbnailUrl, title, description, tags, clientConsent, isPublished, viewCount, createdAt, updatedAt)
- [x] 1.3 Créer modèle `Notification` (id, stylistId, orderId?, clientId, type, channel, status, sentAt, errorMessage, createdAt)
- [x] 1.4 Exécuter `npx prisma migrate dev --name sprint5-portfolio-notifications`
- [x] 1.5 Ajouter script de migration des slugs manquants dans `prisma/seed.ts` (générer slug depuis businessName ou user.name pour les stylistes existants)
- [x] 1.6 Mettre à jour `src/types/` pour exporter les nouveaux types Prisma

## 2. Dépendances

- [x] 2.1 Installer `resend` : `npm install resend`
- [x] 2.2 Installer `@react-email/components react-email` : `npm install @react-email/components react-email`
- [x] 2.3 Ajouter `RESEND_API_KEY` dans `.env.local` (clé de test Resend)
- [x] 2.4 Créer `src/lib/resend.ts` — instance Resend singleton + helper `sendEmail()`

## 3. Templates Email React Email

- [x] 3.1 Créer `src/emails/OrderReadyEmail.tsx` — template "Votre commande est prête" (nom client, type vêtement, nom styliste, téléphone styliste)
- [x] 3.2 Créer `src/emails/PaymentReminderEmail.tsx` — template "Rappel de paiement" (montant total, payé, solde restant en FCFA)
- [x] 3.3 Créer `src/emails/PickupReminderEmail.tsx` — template "Rappel de retrait" (type vêtement, date promise, coordonnées styliste)

## 4. API Portfolio

- [x] 4.1 Créer `src/app/api/portfolio/route.ts` — `GET` (liste items du styliste) + `POST` (upload nouvel item, vérif plan Pro/Premium)
- [x] 4.2 Créer `src/app/api/portfolio/[id]/route.ts` — `PATCH` (modifier isPublished, title, tags) + `DELETE` (supprimer item + fichier stockage)

## 5. API Notifications

- [x] 5.1 Créer `src/app/api/orders/[id]/notify/route.ts` — `POST` : reçoit `{ type: 'ORDER_READY' | 'PAYMENT_REMINDER' | 'PICKUP_REMINDER' }`, valide client.email, envoie via Resend, crée Notification en base
- [x] 5.2 Créer `src/app/api/notifications/route.ts` — `GET` : retourne l'historique des notifications du styliste

## 6. API Annuaire Public

- [x] 6.1 Créer `src/app/api/stylists/public/route.ts` — `GET` : liste stylistes avec ≥1 item publié et plan Pro/Premium (données publiques uniquement, pas d'email)
- [x] 6.2 Créer `src/app/api/stylists/[slug]/route.ts` — `GET` : profil public + items portfolio publiés d'un styliste par slug

## 7. Génération Slug à l'inscription

- [x] 7.1 Créer helper `src/lib/slug.ts` — `generateSlug(name: string): string` (kebab-case ASCII) + `ensureUniqueSlug(slug, prisma): string` (suffixe -2, -3 si collision)
- [x] 7.2 Modifier `src/app/api/register/route.ts` — générer et persister le slug à la création du styliste

## 8. Dashboard Portfolio

- [x] 8.1 Créer `src/app/dashboard/portfolio/page.tsx` — page de gestion portfolio (liste des items, toggle isPublished, bouton upload)
- [x] 8.2 Créer composant `src/components/portfolio/PortfolioItemCard.tsx` — carte d'un item (miniature, titre, badge publié/brouillon, actions)
- [x] 8.3 Créer composant `src/components/portfolio/PortfolioUploadForm.tsx` — formulaire upload (image, titre, description, tags, clientConsent checkbox)
- [x] 8.4 Ajouter lien "Portfolio" dans la navigation `src/components/layout/Navigation.tsx` (icône `Image`, href `/dashboard/portfolio`)

## 9. Page Portfolio Public

- [x] 9.1 Créer `src/app/[stylistSlug]/page.tsx` — page serveur, fetch profil via `/api/stylists/[slug]`, rendu galerie + infos contact + métadonnées SEO (`generateMetadata`)
- [x] 9.2 Créer composant `src/components/portfolio/PortfolioGallery.tsx` — grille responsive de photos avec lightbox au clic

## 10. Page Annuaire Public

- [x] 10.1 Créer `src/app/stylistes/page.tsx` — page client, fetch `/api/stylists/public`, affichage liste + recherche par nom/ville
- [x] 10.2 Créer composant `src/components/directory/StylistCard.tsx` — carte styliste (photo, nom, ville, boutons contact, lien portfolio)

## 11. Intégration Notifications sur Fiche Commande

- [x] 11.1 Créer composant `src/components/orders/NotifyClientButton.tsx` — bouton dropdown "Notifier le client" avec les 3 types, désactivé si client sans email
- [x] 11.2 Créer composant `src/components/orders/NotificationHistory.tsx` — liste des notifications envoyées (date, type, statut)
- [x] 11.3 Créer hook `src/hooks/useOrderNotifications.ts` — fetch + envoi notifications pour une commande
- [x] 11.4 Intégrer `NotifyClientButton` et `NotificationHistory` dans `src/components/orders/OrderDetail.tsx`

## 12. Tests Playwright

- [x] 12.1 Tester upload d'un item portfolio depuis le dashboard
- [x] 12.2 Tester la page portfolio public `/{slug}` (desktop + mobile 375px)
- [x] 12.3 Tester l'annuaire `/stylistes` avec recherche
- [x] 12.4 Tester l'envoi d'une notification depuis une fiche commande
