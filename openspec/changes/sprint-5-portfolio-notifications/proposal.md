## Why

Les sprints 1-4 couvrent la gestion interne (clients, commandes, paiements, planning). Le Sprint 5 ouvre la plateforme vers l'extérieur : un portfolio public permet aux stylistes d'attirer de nouveaux clients en ligne, les notifications email automatisent la communication avec les clients existants, et un annuaire simple offre une visibilité sur la plateforme. Ces trois axes constituent la vitrine numérique du styliste et sont critiques pour valider la proposition de valeur MVP avant le lancement pilote.

## What Changes

- **Nouveau** : Portfolio public styliste — page vitrine accessible sans connexion (`/[stylistSlug]`), avec galerie de créations, bouton de contact, et partage réseaux sociaux
- **Nouveau** : Gestion du portfolio depuis le dashboard (`/dashboard/portfolio`) — upload photos, tags, consentement client, activation/désactivation d'items
- **Nouveau** : Notifications email automatiques via Resend — templates React Email pour 3 événements : commande prête, rappel paiement, rappel retrait
- **Nouveau** : Déclenchement manuel des notifications depuis la fiche commande
- **Nouveau** : Historique des notifications envoyées par commande
- **Nouveau** : Annuaire public des stylistes (`/stylistes`) — liste filtrée par nom/ville, lien vers portfolio, boutons de contact
- **Modification** : Fiche commande (`OrderDetail`) — ajout d'un bouton "Notifier le client" avec sélection du type de notification

## Capabilities

### New Capabilities
- `portfolio-management`: Gestion et affichage du portfolio public du styliste (upload, organisation, page vitrine)
- `email-notifications`: Envoi de notifications email transactionnelles aux clients via Resend (templates React Email, historique)
- `public-directory`: Annuaire public des stylistes avec recherche et liens vers portfolios

### Modified Capabilities
- `order-management`: Ajout du déclenchement de notification email depuis une commande (bouton "Notifier", endpoint `/api/orders/[id]/notify`)

## Impact

**Nouvelles API Routes**
- `GET/POST /api/portfolio` — liste et création d'items portfolio
- `GET/PUT/DELETE /api/portfolio/[id]` — gestion d'un item
- `POST /api/portfolio/[id]/view` — tracking des vues (optionnel MVP)
- `GET /api/stylists/[slug]` — profil public styliste pour la page vitrine
- `GET /api/stylists/public` — liste pour l'annuaire
- `POST /api/orders/[id]/notify` — envoi email depuis une commande
- `GET /api/notifications` — historique notifications

**Nouvelles Pages**
- `/[stylistSlug]/page.tsx` — portfolio public (route dynamique top-level)
- `/dashboard/portfolio/page.tsx` — gestion portfolio
- `/stylistes/page.tsx` — annuaire public

**Dépendances**
- `resend` — envoi emails transactionnels
- `@react-email/components` + `react-email` — templates email HTML

**Schema Prisma**
- Table `PortfolioItem` (id, stylistId, imageUrl, title, description, tags, clientConsent, isPublished, viewCount, createdAt)
- Table `Notification` (id, stylistId, orderId, clientId, type, channel, status, sentAt, errorMessage)
- Champ `slug` sur `Stylist` (unique, auto-généré depuis businessName/name)

**Contraintes Plan**
- Portfolio réservé aux plans Pro et Premium (vérification côté API et dashboard)
- Notifications email disponibles à partir du plan Standard
