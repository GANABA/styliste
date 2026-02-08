# Synthèse des Retours Utilisateur & Décisions Finales
## Styliste.com

Date : 2026-02-05
Version : 1.0

---

## 📋 Contexte

Ce document synthétise les retours de l'utilisateur (porteur du projet) suite à la présentation du document "Questions Stratégiques & Fonctionnalités Manquantes - Styliste.com" et valide les décisions finales pour l'implémentation.

---

## ✅ Décisions Validées par l'Utilisateur

### 1. Politique de Rétention des Données
**Décision** : ✅ Approuvée telle que proposée

- Export automatique proposé avant suppression de compte
- Email avec lien de téléchargement (valide 7 jours)
- Suppression définitive après 30 jours (conformité RGPD/équivalent local)
- Le styliste est propriétaire de ses données clients

---

### 2. Base de Données Client
**Décision** : ✅ Base de données locale (chaque styliste a ses propres clients)

**Rationale** :
- Pas de partage entre stylistes
- Duplication acceptée (même client peut aller chez plusieurs stylistes)
- Simplicité de gestion
- Propriété claire des données
- Facilite export et conformité légale

**Implémentation** :
```sql
-- Chaque client est lié à un styliste
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  stylist_id UUID NOT NULL REFERENCES stylists(id),
  -- Autres champs...
);

-- Index pour isolation
CREATE INDEX idx_clients_stylist ON clients(stylist_id);
CREATE UNIQUE INDEX idx_clients_stylist_phone
  ON clients(stylist_id, phone) WHERE deleted_at IS NULL;
```

---

### 3. Gestion des Mesures
**Décision** : ✅ Mesures personnalisables et optionnelles avec templates de base

**Caractéristiques** :
- ✅ Templates de base pré-établis (Robe femme, Costume homme, Pantalon, etc.)
- ✅ Le styliste peut **ajouter** des mesures
- ✅ Le styliste peut **supprimer** des mesures
- ✅ Le styliste peut **modifier** des mesures
- ✅ Chaque styliste forme sa propre base de types de mesures
- ✅ Versionnage avec dates pour historique

**Exemple d'usage** :
```
Styliste A utilise template "Robe femme" standard :
- Tour de poitrine
- Tour de taille
- Tour de hanches
- Longueur robe

Styliste B personnalise pour ses besoins :
- Tour de poitrine
- Tour de taille
- Tour de hanches
- Longueur robe
+ Longueur taille-sol (ajout perso)
+ Largeur épaules (ajout perso)
- Supprime "Tour de hanches" (pas utile pour lui)
```

**Implémentation** :
```typescript
// Le styliste peut créer/modifier ses templates
interface MeasurementTemplate {
  id: string;
  stylistId: string | null; // null = template système
  name: string;
  measurements: Array<{
    key: string;
    label: string;
    unit: 'cm' | 'inches';
    required: boolean;
    order: number;
  }>;
}

// Versioning automatique
interface ClientMeasurement {
  id: string;
  clientId: string;
  templateId: string;
  measurements: Record<string, number>; // { tour_poitrine: 95, ... }
  dateTaken: Date;
  isCurrent: boolean; // Une seule version current par template
  notes: string;
}
```

---

### 4. Cycle de Vie des Commandes
**Décision** : ✅ Statuts simples (pas trop nombreux)

**Statuts retenus (5 statuts principaux)** :
1. **Devis** - Commande non confirmée, en discussion
2. **En cours** - Commande confirmée, travail en cours
3. **Prêt** - Terminé, en attente de récupération
4. **Livré** - Remis au client, commande terminée
5. **Annulé** - Commande annulée avec raison

**Workflow** :
```
Devis → En cours → Prêt → Livré
  ↓         ↓
Refusé   Annulé
```

**Sous-statuts optionnels** (pour "En cours", non obligatoire) :
- Coupe effectuée
- Assemblage
- Essayage
- Retouches

---

### 5. Modifications de Commande
**Décision** : ✅ Impact sur date de livraison si ajustements importants

**Gestion** :
- Historique complet des modifications (table `order_history`)
- Si modification majeure (changement modèle, tissu) :
  - Alerte styliste que date de livraison doit être recalculée
  - Suggestion automatique de nouvelle date
  - Notification client si date change
- Si modification mineure (note, détail) :
  - Pas d'impact sur date

**Implémentation** :
```typescript
// Log toutes les modifications
interface OrderHistory {
  orderId: string;
  changedByUserId: string;
  changeType: 'status_change' | 'price_change' | 'date_change' | 'description_change';
  fieldName: string;
  oldValue: string;
  newValue: string;
  comment: string;
  createdAt: Date;
}

// Calculer impact sur date
function shouldRecalculateDate(changeType: string, field: string): boolean {
  const impactfulChanges = ['garmentType', 'description', 'fabricProvidedBy'];
  return changeType === 'description_change' && impactfulChanges.includes(field);
}
```

---

### 6. Gestion du Tissu
**Décision** : ✅ Tissu généralement fourni par le client

**Cas d'usage** :
- **Cas principal (90%)** : Client apporte son tissu
  - Date de réception du tissu = début réel de la commande
  - Alerte si client tarde à apporter le tissu
  - Photo du tissu uploadée dans la commande

- **Cas secondaire (10%)** : Styliste fournit le tissu (si stock)
  - Coût tissu inclus dans le prix
  - Référence au fournisseur
  - (V2) : Gestion de stock de tissus

**Implémentation** :
```typescript
interface Order {
  // ...
  fabricProvidedBy: 'client' | 'stylist';
  fabricReceivedDate: Date | null; // Si client
  fabricDescription: string;
  fabricPhotoUrl: string;
  fabricSupplierId: string | null; // Si styliste (lien vers fournisseur)
}

// Logique métier
if (order.fabricProvidedBy === 'client' && !order.fabricReceivedDate) {
  // Alerte : "En attente du tissu client"
  // Commande ne peut pas commencer réellement
}

if (order.fabricProvidedBy === 'stylist') {
  // Vérifier stock disponible (V2)
  // Réserver quantité nécessaire
}
```

---

### 7. Photos de Référence
**Décision** : ✅ Les clients fournissent souvent des photos de référence

**Types de photos** :
1. **Photo de référence** : Ce que le client veut (trouvé sur Pinterest, Instagram, etc.)
2. **Photo du tissu** : Le tissu choisi
3. **Photos d'essayages** : Progression du travail
4. **Photo finale** : Produit terminé

**Implémentation** :
```typescript
interface OrderPhoto {
  orderId: string;
  photoUrl: string;
  thumbnailUrl: string;
  photoType: 'reference' | 'fabric' | 'fitting' | 'finished';
  caption: string;
  uploadDate: Date;
  displayOrder: number;
}

// Upload multiple photos
async function uploadOrderPhotos(orderId: string, files: File[], type: PhotoType) {
  for (const file of files) {
    // Optimize image (sharp)
    const optimized = await optimizeImage(file);
    const thumbnail = await generateThumbnail(file);

    // Upload to S3/R2
    const urls = await uploadToStorage(optimized, thumbnail);

    // Save to DB
    await createOrderPhoto({
      orderId,
      photoUrl: urls.photo,
      thumbnailUrl: urls.thumbnail,
      photoType: type
    });
  }
}
```

---

### 8. Annulation de Commande
**Décision** : ✅ Système de gestion des annulations à mettre en place

**Gestion** :
- Statut "Annulé" avec raison obligatoire
- Gestion des remboursements partiels si avance versée
- Historique de l'annulation
- Notification client

**Implémentation** :
```typescript
interface Order {
  // ...
  status: 'quote' | 'in_progress' | 'ready' | 'delivered' | 'canceled';
  cancellationReason: string | null;
  canceledAt: Date | null;
}

async function cancelOrder(orderId: string, reason: string, refundAmount: number) {
  // 1. Update order
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'canceled',
      cancellationReason: reason,
      canceledAt: new Date()
    }
  });

  // 2. Gestion remboursement
  if (refundAmount > 0) {
    await createPayment({
      orderId,
      amount: -refundAmount, // Négatif = remboursement
      paymentType: 'refund',
      paymentStatus: 'completed'
    });
  }

  // 3. Notification client
  await notificationQueue.add('order_canceled', { orderId });

  // 4. Log historique
  await createOrderHistory({
    orderId,
    changeType: 'status_change',
    oldValue: 'in_progress',
    newValue: 'canceled',
    comment: reason
  });
}
```

---

### 9. Détails des Paiements
**Décision** : ✅ Comme proposé

**Fonctionnalités** :
- ✅ Montant total commande
- ✅ Avance (pourcentage ou montant fixe)
- ✅ Paiements intermédiaires possibles
- ✅ Solde restant (calculé automatiquement)
- ✅ Date de chaque paiement
- ✅ Méthode de paiement (Cash, Mobile Money, Virement)
- ✅ Historique complet
- ✅ Génération facture/reçu PDF

**Implémentation** :
```typescript
interface Order {
  totalPrice: number; // En centimes
  urgencySurcharge: number;
  discountAmount: number;
  finalPrice: number; // Calculé : total + surcharge - discount
  advanceAmount: number; // Avance versée
  totalPaid: number; // Total payé (tous paiements)
  balanceDue: number; // Calculé : finalPrice - totalPaid
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
}

interface Payment {
  orderId: string;
  amount: number; // En centimes
  paymentType: 'advance' | 'partial' | 'final' | 'refund';
  paymentMethod: 'cash' | 'mobile_money' | 'bank_transfer' | 'card';
  mobileMoneyProvider: 'MTN' | 'Moov' | 'Orange' | null;
  mobileMoneyNumber: string | null;
  transactionReference: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate: Date;
  receiptUrl: string; // URL du PDF généré
  notes: string;
}

// Trigger automatique pour mettre à jour totalPaid et paymentStatus
CREATE OR REPLACE FUNCTION update_order_paid_amount()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders
  SET
    total_paid = (
      SELECT COALESCE(SUM(amount), 0)
      FROM payments
      WHERE order_id = NEW.order_id AND payment_status = 'completed'
    ),
    payment_status = CASE
      WHEN total_paid = 0 THEN 'unpaid'
      WHEN total_paid >= final_price THEN 'paid'
      ELSE 'partial'
    END
  WHERE id = NEW.order_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### 10. Gestion des Impayés
**Décision** : ✅ Gestion à mettre en place

**Fonctionnalités** :
- Statut "Abandonné" pour commandes non récupérées
- Relances automatiques (email/SMS)
- Délai avant archivage (ex: 30 jours après date promise)
- Alertes styliste pour commandes à risque

**Implémentation** :
```typescript
// Job quotidien
async function checkAbandonedOrders() {
  const threshold = subDays(new Date(), 30);

  const abandoned = await prisma.order.findMany({
    where: {
      status: 'ready',
      promisedDate: { lt: threshold },
      paymentStatus: { in: ['unpaid', 'partial'] }
    }
  });

  for (const order of abandoned) {
    // 1. Notification styliste
    await notifyStylish({
      type: 'order_abandoned',
      orderId: order.id,
      message: `Commande ${order.orderNumber} non récupérée depuis 30 jours`
    });

    // 2. Dernière relance client
    await sendNotification({
      clientId: order.clientId,
      channel: 'sms',
      message: `Dernière relance : votre commande ${order.orderNumber} vous attend. Passez la récupérer avant archivage.`
    });

    // 3. Si pas de réponse après 7 jours → statut "Abandonné"
    // (géré par un autre job)
  }
}

// Cron quotidien
cron.schedule('0 9 * * *', checkAbandonedOrders); // Tous les jours à 9h
```

---

### 11. Notifications
**Décision** : ✅ Email d'abord, SMS ensuite selon versions

**Stratégie** :
- **MVP (Mois 1-3)** : Email uniquement (gratuit)
- **V1 (Mois 4-6)** : Ajout SMS (avec crédits)
- **V2 (Mois 7+)** : WhatsApp Business API

**Question ouverte - Facturation SMS** :
> "Je ne sais pas d'abord s'il faut mettre ça en option de paiement pour le styliste, paiement en fonction du nombre de notifications ou un abonnement"

**Recommandation proposée** : **Système hybride**
- Quota inclus dans abonnement :
  - Plan Standard : 50 SMS/mois inclus
  - Plan Pro : 200 SMS/mois inclus
  - Plan Premium : 500 SMS/mois inclus
- Possibilité d'acheter des packs additionnels :
  - Pack 50 SMS : 1 000 FCFA (~1.50 EUR)
  - Pack 200 SMS : 3 000 FCFA (~4.50 EUR)
  - Pack 500 SMS : 6 000 FCFA (~9 EUR)

**Avantages** :
- ✅ Simple à comprendre
- ✅ Prévisible pour stylistes à usage modéré
- ✅ Flexible pour stylistes à gros volume
- ✅ Pas de surprise de facturation

**Types de notifications validés** :
- ✅ Commande confirmée
- ✅ Prêt pour essayage
- ✅ Commande terminée
- ✅ Rappel de récupération
- ✅ Rappel de paiement
- ✅ Relance après X jours sans nouvelles

---

### 12. Historique de Communication
**Décision** : ✅ Bonne idée pour gérer les malentendus

**Fonctionnalités** :
- Log de toutes les notifications envoyées
- Statut de délivrance :
  - SMS : envoyé, reçu
  - WhatsApp : envoyé, livré, lu
  - Email : envoyé, ouvert (tracking)
- Notes d'appels téléphoniques (manuel)
- Timeline complète par client

**Implémentation** :
```typescript
interface Notification {
  stylistId: string;
  clientId: string;
  orderId: string | null;
  notificationType: 'order_ready' | 'payment_reminder' | 'pickup_reminder' | 'custom';
  channel: 'sms' | 'email' | 'whatsapp';
  recipient: string; // Phone ou email
  subject: string | null; // Pour email
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  sentAt: Date | null;
  deliveredAt: Date | null;
  readAt: Date | null; // WhatsApp uniquement
  errorMessage: string | null;
  costCredits: number; // Crédits consommés (0 pour email)
  createdAt: Date;
}

// Vue timeline par client
async function getClientCommunicationTimeline(clientId: string) {
  const notifications = await prisma.notification.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' }
  });

  const notes = await prisma.clientNote.findMany({
    where: { clientId, type: 'phone_call' },
    orderBy: { createdAt: 'desc' }
  });

  // Merge et trier par date
  return [...notifications, ...notes].sort((a, b) =>
    b.createdAt.getTime() - a.createdAt.getTime()
  );
}
```

---

### 13. Charge de Travail
**Décision** : ✅ Maximum 15 commandes actives

**Implémentation** :
```typescript
interface StylistSettings {
  maxConcurrentOrders: number; // Default: 15
  currentActiveOrders: number; // Calculé
  capacityPercentage: number; // Calculé : (current / max) * 100
}

// Calculer capacité
async function checkStylistCapacity(stylistId: string) {
  const activeOrders = await prisma.order.count({
    where: {
      stylistId,
      status: { in: ['in_progress', 'ready'] },
      deletedAt: null
    }
  });

  const settings = await prisma.stylist.findUnique({
    where: { id: stylistId },
    select: { maxConcurrentOrders: true }
  });

  const capacity = (activeOrders / settings.maxConcurrentOrders) * 100;

  return {
    current: activeOrders,
    max: settings.maxConcurrentOrders,
    percentage: capacity,
    canAcceptOrder: activeOrders < settings.maxConcurrentOrders,
    alert: capacity >= 80 ? 'warning' : capacity >= 100 ? 'danger' : null
  };
}

// Bloquer nouvelles commandes si capacité atteinte
async function createOrder(data: CreateOrderInput, stylistId: string) {
  const capacity = await checkStylistCapacity(stylistId);

  if (!capacity.canAcceptOrder) {
    throw new Error('Capacité maximale atteinte (15 commandes actives). Veuillez livrer des commandes en cours avant d\'en accepter de nouvelles.');
  }

  // Continuer création commande
  // ...
}
```

**Personnalisation** :
Le styliste peut ajuster sa limite selon sa capacité réelle :
```typescript
// Page paramètres
<input
  type="number"
  value={maxConcurrentOrders}
  min={5}
  max={50}
  onChange={(e) => updateStylistSettings({ maxConcurrentOrders: e.target.value })}
/>
<p>Recommandé : 15 commandes pour un styliste solo</p>
```

---

### 14. Organisation du Portfolio
**Décision** : ✅ Comme proposé

**Fonctionnalités validées** :
- ✅ Tags (femme, homme, enfant, mariage, soirée, traditionnel, moderne)
- ✅ Catégories
- ✅ Tri par date, popularité (vues)
- ✅ Mise en avant (épingler les meilleures créations)
- ✅ Compteur de vues
- ✅ Partage sur réseaux sociaux

---

### 15. Interactions Portfolio
**Décision** : ✅ Compteur de vues + partage réseaux sociaux

**Fonctionnalités** :
- ✅ Compteur de vues (incrémenté à chaque visite)
- ✅ Bouton "Commander ce modèle" (redirige vers contact styliste)
- ✅ Partage Facebook, WhatsApp, Twitter, Instagram
- ❌ PAS de demande de devis directe (MVP) - V1

**Implémentation** :
```typescript
// Track view
async function trackPortfolioView(portfolioItemId: string) {
  await prisma.portfolioItem.update({
    where: { id: portfolioItemId },
    data: {
      viewsCount: { increment: 1 }
    }
  });

  // Mettre à jour compteur global du styliste
  const item = await prisma.portfolioItem.findUnique({
    where: { id: portfolioItemId }
  });

  await prisma.stylist.update({
    where: { id: item.stylistId },
    data: {
      portfolioViewsCount: { increment: 1 }
    }
  });
}

// Bouton partage
<ShareButtons
  url={`https://styliste.com/${stylist.slug}/${portfolioItem.id}`}
  title={`${portfolioItem.title} par ${stylist.businessName}`}
  image={portfolioItem.photoUrl}
  platforms={['facebook', 'whatsapp', 'twitter', 'pinterest']}
/>
```

---

### 16. Recherche de Stylistes
**Décision** : ✅ Géolocalisation avec carte interactive

**Fonctionnalités validées** :
- ✅ **Carte interactive** (Google Maps ou Mapbox)
- ✅ **Marqueurs cliquables** pour chaque styliste
- ✅ **Popup au clic** avec :
  - Photo de profil
  - Nom du salon
  - Spécialités
  - Bouton "Voir le portfolio"
  - Bouton "Contacter" (WhatsApp/appel)
  - **Itinéraire** (lien Google Maps)
- ✅ **Filtres** :
  - Rayon de recherche (1km, 5km, 10km, 50km)
  - Spécialité (mariage, traditionnel, moderne, enfants)
  - Disponibilité (accepte nouvelles commandes)
- ✅ **Vue liste alternative** (basculer carte/liste)

**Implémentation** :
```typescript
// Page annuaire
import mapboxgl from 'mapbox-gl';

function StylistDirectory() {
  const [view, setView] = useState<'map' | 'list'>('map');
  const [filters, setFilters] = useState({
    lat: 6.3703, // Cotonou
    lng: 2.3912,
    radius: 10, // km
    specialties: [],
    acceptsOrders: true
  });

  const { data: stylists } = useQuery({
    queryKey: ['stylists', filters],
    queryFn: () => searchStylists(filters)
  });

  return (
    <div>
      <Filters filters={filters} onChange={setFilters} />
      <ViewToggle view={view} onChange={setView} />

      {view === 'map' ? (
        <StylistMap stylists={stylists} onMarkerClick={showStylistPopup} />
      ) : (
        <StylistList stylists={stylists} />
      )}
    </div>
  );
}

// API endpoint
async function searchStylists(params: SearchParams) {
  const { lat, lng, radius, specialties } = params;

  // PostGIS query
  const stylists = await prisma.$queryRaw`
    SELECT
      s.*,
      ST_Distance(
        ST_MakePoint(s.longitude, s.latitude)::geography,
        ST_MakePoint(${lng}, ${lat})::geography
      ) / 1000 as distance_km
    FROM stylists s
    INNER JOIN subscriptions sub ON s.id = sub.stylist_id
    INNER JOIN subscription_plans sp ON sub.plan_id = sp.id
    WHERE
      sub.status = 'active'
      AND (sp.features->>'portfolio_public')::boolean = true
      AND s.accepts_new_orders = true
      AND ST_DWithin(
        ST_MakePoint(s.longitude, s.latitude)::geography,
        ST_MakePoint(${lng}, ${lat})::geography,
        ${radius * 1000}
      )
      ${specialties.length > 0 ? Prisma.sql`AND s.specialties ?| ${specialties}` : Prisma.empty}
    ORDER BY distance_km ASC
    LIMIT 50
  `;

  return stylists;
}
```

---

### 17. Multi-Employés
**Décision** : ✅ Pour version plus avancée (V1)

**Implémentation différée à V1** (Mois 7-12)

---

### 18. Langues
**Décision** : ✅ Français d'abord, Anglais ensuite

**Roadmap** :
- **MVP (Mois 1-3)** : Français uniquement
- **V1 (Mois 4-6)** : Ajout de l'anglais
- **V2 (Mois 7+)** : Langues locales (Fon, Yoruba) si ressources disponibles

**Note** :
> "On n'a pas encore à ce jour de bonne base pour intégrer les langues locales sur les plateformes pour le moment."

**Implémentation** :
```typescript
// Setup i18n dès le MVP (même si FR uniquement)
import { useTranslation } from 'next-i18next';

function Component() {
  const { t } = useTranslation('common');

  return <h1>{t('welcome')}</h1>;
}

// Fichiers de traduction
// /locales/fr/common.json
{
  "welcome": "Bienvenue sur Styliste.com"
}

// /locales/en/common.json (V1)
{
  "welcome": "Welcome to Styliste.com"
}
```

---

### 19. Support Client
**Décision** : ✅ FAQ + WhatsApp + Chatbot (plus tard)

**Phase MVP** :
- ✅ FAQ contextuelle sur chaque page
- ✅ Page "Aide" complète
- ✅ Numéro WhatsApp support
- ✅ Email support

**Phase V1** :
- ✅ Chat en direct (heures de bureau)

**Phase V2** :
- ✅ Chatbot intelligent (IA)

**Implémentation** :
```typescript
// Composant FAQ contextuel
function ContextualHelp({ page }: { page: string }) {
  const faqs = FAQ_BY_PAGE[page];

  return (
    <Popover>
      <PopoverTrigger>
        <HelpCircle className="w-5 h-5" />
      </PopoverTrigger>
      <PopoverContent>
        <h3>Besoin d'aide ?</h3>
        <ul>
          {faqs.map(faq => (
            <li key={faq.question}>
              <Accordion>
                <AccordionItem value={faq.question}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              </Accordion>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2">
          <Button asChild>
            <a href="https://wa.me/229XXXXXXXX" target="_blank">
              <MessageCircle /> Contacter le support
            </a>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/help">
              <Book /> Voir toute la documentation
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

---

### 20. Sauvegarde des Données
**Décision** : ✅ Export manuel par le styliste

**Fonctionnalités** :
- ✅ Bouton "Exporter toutes mes données"
- ✅ Export global (ZIP : CSV + JSON + photos)
- ✅ Exports sélectifs (clients uniquement, commandes période, etc.)
- ✅ Backup automatique côté serveur (quotidien)

---

### 21. Monétisation - Essai Gratuit
**Décision** : ✅ 14 jours avec accès à toutes les fonctionnalités (à préciser)

**Proposition** : 14 jours d'essai = accès équivalent **Plan Pro**
- ✅ Toutes les fonctionnalités sauf IA
- ✅ Portfolio public activé (avec watermark "Version d'essai")
- ✅ Limitations :
  - Max 50 clients
  - Max 10 commandes actives
  - 20 SMS gratuits (test)
- ✅ Aucune carte bancaire requise
- ✅ Fin d'essai : choix du plan ou downgrade automatique vers Gratuit

---

### 22. Upgrades/Downgrades
**Décision** : ⚠️ À préciser

**Proposition** :
- **Upgrades** : Effet immédiat avec prorata
- **Downgrades** : Prise d'effet en fin de période
- **Vérification compatibilité** :
  ```
  Si Plan Pro (illimité) → Plan Standard (max 100 clients)
  Et que le styliste a 150 clients :

  → Alerte : "Votre plan actuel autorise 100 clients maximum.
              Vous avez actuellement 150 clients.
              Veuillez archiver 50 clients ou rester sur Plan Pro."
  ```

---

### 23. Gestion des Impayés Côté Plateforme
**Décision** : ✅ Comme proposé

**Process** :
1. Tentative de paiement automatique (si Mobile Money enregistré)
2. Si échec : email + SMS notification (J+0)
3. **Période de grâce : 3 jours** (J+1, J+2, J+3 : relances quotidiennes)
4. **J+4 : Suspension du compte**
   - Mode "lecture seule"
   - Portfolio désactivé (pas visible publiquement)
   - Notifications envoyées : "Compte suspendu - Veuillez régulariser votre paiement"
5. **J+14 : Suppression définitive prévue**
   - Dernier email avec export automatique des données
   - Lien de téléchargement (valide 7 jours)
6. **J+21 : Suppression définitive**
   - Données anonymisées ou supprimées
   - Compte désactivé

---

### 24. Système de Parrainage
**Décision** : ✅ Code de parrainage + récompenses

**Mécanique validée** :
- ✅ 1 mois gratuit pour le parrain par filleul converti (max 12/an)
- ✅ Récompense pour le filleul (1er mois -50% ou +7 jours d'essai)
- ✅ Tracking complet
- ✅ Conditions : filleul doit rester abonné 2 mois minimum

---

### 25. Dashboard Administrateur
**Décision** : ✅ Dashboard admin pour gérer toute la plateforme

**Fonctionnalités validées** :
- ✅ Gestion des stylistes (liste, actions, statistiques)
- ✅ Gestion des clients (vue globale)
- ✅ Statistiques globales (revenus, utilisateurs actifs, conversion, etc.)
- ✅ Support (tickets, messages)
- ✅ Modération (si nécessaire)
- ✅ Logs d'audit (toutes actions sensibles)

**Implémentation** : Voir `ARCHITECTURE.md` section "Module Dashboard Administrateur"

---

## 📊 Récapitulatif des Décisions

| # | Sujet | Décision | Statut |
|---|-------|----------|--------|
| 1 | Rétention données | Export avant suppression, 30 jours | ✅ Validé |
| 2 | Base données | Locale par styliste | ✅ Validé |
| 3 | Mesures | Personnalisables + versioning | ✅ Validé |
| 4 | Statuts commandes | 5 statuts simples | ✅ Validé |
| 5 | Modifications commandes | Impact date si majeur | ✅ Validé |
| 6 | Gestion tissu | Généralement client | ✅ Validé |
| 7 | Photos référence | Upload multiple types | ✅ Validé |
| 8 | Annulation | Statut + raison + remboursement | ✅ Validé |
| 9 | Détails paiements | Complet (avance/solde/historique) | ✅ Validé |
| 10 | Impayés | Statut Abandonné + relances | ✅ Validé |
| 11 | Notifications | Email MVP, SMS V1 | ✅ Validé |
| 12 | Facturation SMS | Quota inclus + packs | ⚠️ À confirmer |
| 13 | Historique comm | Log complet + timeline | ✅ Validé |
| 14 | Charge travail | Max 15 commandes | ✅ Validé |
| 15 | Portfolio | Tags, catégories, compteur | ✅ Validé |
| 16 | Interactions | Vues + partage réseaux | ✅ Validé |
| 17 | Annuaire | Carte interactive + filtres | ✅ Validé |
| 18 | Multi-employés | V1 (différé) | ✅ Validé |
| 19 | Langues | FR → EN → Locales | ✅ Validé |
| 20 | Support | FAQ + WhatsApp + Chatbot V2 | ✅ Validé |
| 21 | Sauvegarde | Export manuel + backup auto | ✅ Validé |
| 22 | Essai gratuit | 14 jours accès Pro | ✅ Validé |
| 23 | Upgrade/Downgrade | Immédiat/Fin période | ⚠️ À détailler |
| 24 | Impayés plateforme | 3 jours grâce → suspension | ✅ Validé |
| 25 | Parrainage | 1 mois gratuit/filleul | ✅ Validé |
| 26 | Dashboard admin | Gestion complète plateforme | ✅ Validé |

---

## ⚠️ Questions Restantes à Trancher

### 1. Facturation des Notifications SMS
**Options** :
- A) Inclus dans abonnement avec limite (ex: 100 SMS/mois Standard)
- B) Système de crédit séparé (achat packs)
- C) **Hybride (Recommandé)** : Quota inclus + possibilité acheter packs

**Action requise** : Valider le modèle de facturation SMS

---

### 2. Accès Essai Gratuit
**Détails à préciser** :
- Accès à **toutes les fonctionnalités** ?
  - Si oui : inclut portfolio public ? (risque d'abus)
  - Si non : quelles limites exactement ?

**Recommandation** :
- Accès équivalent **Plan Pro** (avec portfolio)
- Limites : 50 clients max, 10 commandes actives max
- Portfolio avec watermark "Version d'essai"
- 20 SMS gratuits pour tester

**Action requise** : Valider les limites de l'essai gratuit

---

### 3. Downgrade avec Dépassement de Limites
**Scénario** :
```
Styliste avec Plan Pro (clients illimités, 150 clients actuels)
Veut downgrader vers Plan Standard (max 100 clients)
```

**Options** :
- A) Bloquer le downgrade jusqu'à nettoyage
- B) Autoriser mais désactiver accès aux clients excédentaires
- C) Proposer "supplément débordement" (ex: +1000 FCFA pour 50 clients supplémentaires)

**Action requise** : Choisir la politique de downgrade

---

## ✅ Prochaines Actions Immédiates

### Cette Semaine
1. [ ] Valider les 3 questions restantes
2. [ ] Relire tous les documents créés (`DECISIONS.md`, `DATABASE_SCHEMA.md`, `ARCHITECTURE.md`, `IMPLEMENTATION_PLAN.md`, `EXECUTIVE_SUMMARY.md`)
3. [ ] Préparer interviews stylistes (script, contacts)

### Semaine Prochaine
1. [ ] Lancer interviews (objectif : 20 stylistes)
2. [ ] Créer compte Figma
3. [ ] Commencer wireframes (écrans prioritaires)

### Dans 2 Semaines
1. [ ] Finaliser design (maquettes haute-fidélité)
2. [ ] Tests utilisateurs sur prototypes
3. [ ] Décision GO/NO-GO définitive

---

## 📞 Contact

Pour toute question ou clarification, contactez l'équipe projet :

**Email** : contact@styliste.com
**WhatsApp** : +229 XX XX XX XX

---

**Document Version** : 1.0
**Dernière Mise à Jour** : 2026-02-05
**Auteur** : Équipe Styliste.com
