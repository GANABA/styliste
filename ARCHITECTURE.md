# Architecture Technique - Styliste.com

Date : 2026-02-05
Version : 1.0

---

## Vue d'Ensemble

Styliste.com est une plateforme SaaS multi-tenant permettant aux stylistes africains de gérer leur activité de couture. L'architecture suit une approche moderne, scalable et adaptée aux contraintes du contexte africain (connexion instable, faible coût data).

---

## Stack Technique Recommandée

### Frontend
- **Framework** : Next.js 14+ (App Router)
  - React 18+ avec Server Components
  - TypeScript strict mode
  - Support SSR et SSG pour SEO et performance
- **Styling** : Tailwind CSS + shadcn/ui
  - Design system cohérent
  - Dark mode support
  - Mobile-first responsive
- **State Management** :
  - Zustand (léger, simple)
  - React Query / TanStack Query (cache et sync serveur)
- **Forms** : React Hook Form + Zod validation
- **Maps** : Mapbox GL JS ou Leaflet (pour géolocalisation)
- **Charts** : Recharts ou Chart.js
- **Offline** :
  - Service Worker (PWA)
  - IndexedDB via Dexie.js

### Backend
- **Framework** : Next.js API Routes (serverless) ou NestJS (si monolithe)
- **API** : RESTful + tRPC (type-safe) ou GraphQL
- **ORM** : Prisma (type-safe, migrations faciles)
- **Authentification** : NextAuth.js ou Auth0
- **Jobs** : BullMQ (Redis-based)
  - Envoi notifications asynchrone
  - Génération de factures PDF
  - Calculs statistiques

### Base de Données
- **Principale** : PostgreSQL 14+
  - Row Level Security (RLS)
  - JSONB pour flexibilité
  - Full-text search
- **Cache** : Redis 7+
  - Sessions
  - Cache API
  - Rate limiting
  - Queue jobs
- **Stockage fichiers** :
  - AWS S3 / Cloudflare R2 / Backblaze B2
  - Optimisation images : ImageKit ou Cloudinary

### Infrastructure
- **Hosting Frontend** : Vercel / Netlify
- **Hosting Backend** :
  - Serverless : Vercel / AWS Lambda
  - Conteneurs : Railway / Render / Fly.io
- **CDN** : Cloudflare (Africa-optimized)
- **Monitoring** : Sentry (errors) + Plausible Analytics (privacy-friendly)
- **Logs** : Better Stack (anciennement Logtail)

### Services Tiers
- **Email** : Resend ou Mailgun
- **SMS** : Africa's Talking ou Twilio
- **WhatsApp** : Twilio WhatsApp Business API
- **Paiements** :
  - Mobile Money : Fedapay (Bénin/Afrique de l'Ouest)
  - Stripe (cartes internationales)
- **PDF** : Puppeteer ou jsPDF

---

## Architecture en Couches

```
┌─────────────────────────────────────────────────────────────┐
│                    UTILISATEURS                             │
│   (Stylistes Web/Mobile, Admins Dashboard, Public)         │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                  COUCHE PRÉSENTATION                        │
│  - Next.js Frontend (React)                                 │
│  - PWA (Service Worker)                                     │
│  - Dashboard Admin (séparé)                                 │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                  COUCHE API / BFF                           │
│  - Next.js API Routes / tRPC                                │
│  - Authentification & Autorisation (NextAuth)               │
│  - Validation (Zod)                                         │
│  - Rate Limiting                                            │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                  COUCHE MÉTIER (Services)                   │
│  - StylistService                                           │
│  - OrderService                                             │
│  - ClientService                                            │
│  - PaymentService                                           │
│  - NotificationService                                      │
│  - PortfolioService                                         │
│  - SubscriptionService                                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                  COUCHE DONNÉES                             │
│  - Prisma ORM                                               │
│  - PostgreSQL (données relationnelles)                      │
│  - Redis (cache & queues)                                   │
│  - S3-compatible (fichiers)                                 │
└─────────────────────────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                  SERVICES EXTERNES                          │
│  - Email (Resend)                                           │
│  - SMS (Africa's Talking)                                   │
│  - WhatsApp (Twilio)                                        │
│  - Paiements (Fedapay, Stripe)                              │
│  - Stockage (S3)                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Flux de Données Principaux

### 1. Création de Commande

```
Client Browser
     │
     ├─→ POST /api/orders
     │       │
     │       ├─→ OrderService.create()
     │       │       │
     │       │       ├─→ Validation (Zod)
     │       │       ├─→ Vérifier capacité styliste
     │       │       ├─→ Prisma: INSERT orders
     │       │       ├─→ Upload photos (S3)
     │       │       ├─→ NotificationQueue.add('order_created')
     │       │       └─→ Return order
     │       │
     │       └─→ Response JSON
     │
     └─→ Background Job (BullMQ)
             │
             ├─→ NotificationService.sendOrderCreated()
             └─→ Update cache
```

### 2. Envoi de Notification

```
Trigger (manuel ou automatique)
     │
     ├─→ NotificationQueue.add({
     │       type: 'order_ready',
     │       orderId: '...',
     │       channel: 'sms'
     │   })
     │
     └─→ Worker Process
             │
             ├─→ NotificationService.send()
             │       │
             │       ├─→ Charger template
             │       ├─→ Interpoler variables
             │       ├─→ Vérifier crédits SMS
             │       ├─→ Africa's Talking API
             │       ├─→ Prisma: INSERT notification
             │       └─→ Déduire crédits
             │
             └─→ Webhook callback (status)
```

### 3. Recherche de Stylistes (Annuaire)

```
Public Browser
     │
     ├─→ GET /api/stylists/search?lat=6.5&lng=2.6&radius=10
     │       │
     │       ├─→ StylistService.searchNearby()
     │       │       │
     │       │       ├─→ Redis cache check
     │       │       ├─→ PostgreSQL PostGIS query
     │       │       ├─→ Filter by subscription (portfolio actif)
     │       │       └─→ Cache result (5 min)
     │       │
     │       └─→ Response JSON + cache headers
     │
     └─→ Render map with markers
```

---

## Modules Principaux

### 1. Module Authentification & Autorisation

**Responsabilités** :
- Inscription / Connexion stylistes
- Gestion des sessions
- Permissions (RLS, multi-employés)
- 2FA pour admins

**Implémentation** :
```typescript
// /lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Logique de vérification
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { stylist: true }
        });

        if (user && await verifyPassword(credentials.password, user.password_hash)) {
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            stylistId: user.stylist?.id
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.stylistId = token.stylistId;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.stylistId = user.stylistId;
      }
      return token;
    }
  },
  pages: {
    signIn: '/login',
    signUp: '/register',
    error: '/auth/error'
  }
};
```

---

### 2. Module Gestion des Commandes

**Responsabilités** :
- CRUD commandes
- Gestion des statuts
- Upload photos
- Calcul automatique des prix
- Historique des modifications

**Implémentation** :
```typescript
// /services/OrderService.ts
export class OrderService {

  async createOrder(data: CreateOrderInput, stylistId: string) {
    // 1. Vérifier capacité
    const capacity = await this.checkStylistCapacity(stylistId);
    if (!capacity.canAcceptOrder) {
      throw new Error('Capacité maximale atteinte');
    }

    // 2. Calculer dates
    const promisedDate = this.calculatePromisedDate(
      data.garmentType,
      data.urgencyLevel
    );

    // 3. Créer commande
    const order = await prisma.order.create({
      data: {
        ...data,
        stylistId,
        promisedDate,
        orderNumber: await this.generateOrderNumber(stylistId),
        status: 'quote'
      }
    });

    // 4. Upload photos
    if (data.photos) {
      await this.uploadOrderPhotos(order.id, data.photos);
    }

    // 5. Notification asynchrone
    await notificationQueue.add('order_created', { orderId: order.id });

    return order;
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    userId: string
  ) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    // Historique
    await prisma.orderHistory.create({
      data: {
        orderId,
        changedByUserId: userId,
        changeType: 'status_change',
        fieldName: 'status',
        oldValue: order.status,
        newValue: newStatus
      }
    });

    // Update
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus }
    });

    // Notifications automatiques
    if (newStatus === 'ready') {
      await notificationQueue.add('order_ready', { orderId });
    }

    return updated;
  }

  private calculatePromisedDate(
    garmentType: string,
    urgency: string
  ): Date {
    const baseDays = GARMENT_DURATION_DAYS[garmentType] || 7;
    const multiplier = urgency === 'urgent' ? 0.5 : urgency === 'high' ? 0.7 : 1;
    const daysToAdd = Math.ceil(baseDays * multiplier);

    return addBusinessDays(new Date(), daysToAdd);
  }

  private async generateOrderNumber(stylistId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.order.count({
      where: {
        stylistId,
        orderDate: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`)
        }
      }
    });

    return `ORD-${year}-${String(count + 1).padStart(4, '0')}`;
  }
}
```

---

### 3. Module Notifications

**Responsabilités** :
- Envoi multi-canal (Email, SMS, WhatsApp)
- Templating de messages
- Gestion des crédits SMS
- Historique et tracking

**Implémentation** :
```typescript
// /services/NotificationService.ts
import AfricasTalking from 'africastalking';
import twilio from 'twilio';
import { Resend } from 'resend';

export class NotificationService {
  private sms = AfricasTalking({
    apiKey: process.env.AFRICASTALKING_API_KEY,
    username: process.env.AFRICASTALKING_USERNAME
  }).SMS;

  private whatsapp = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  private email = new Resend(process.env.RESEND_API_KEY);

  async send(notification: SendNotificationInput) {
    const { channel, recipient, message, stylistId, orderId } = notification;

    // Vérifier crédits si SMS/WhatsApp
    if (channel === 'sms' || channel === 'whatsapp') {
      const hasCredits = await this.checkCredits(stylistId, channel);
      if (!hasCredits) {
        throw new Error('Crédits insuffisants');
      }
    }

    // Enregistrer notification
    const notificationRecord = await prisma.notification.create({
      data: {
        stylistId,
        orderId,
        channel,
        recipient,
        message,
        status: 'pending'
      }
    });

    try {
      // Envoi selon canal
      let result;
      switch (channel) {
        case 'sms':
          result = await this.sendSMS(recipient, message);
          break;
        case 'whatsapp':
          result = await this.sendWhatsApp(recipient, message);
          break;
        case 'email':
          result = await this.sendEmail(recipient, 'Notification', message);
          break;
      }

      // Mise à jour statut
      await prisma.notification.update({
        where: { id: notificationRecord.id },
        data: {
          status: 'sent',
          sentAt: new Date()
        }
      });

      // Déduire crédits
      if (channel === 'sms' || channel === 'whatsapp') {
        await this.deductCredits(stylistId, 1);
      }

      return result;
    } catch (error) {
      await prisma.notification.update({
        where: { id: notificationRecord.id },
        data: {
          status: 'failed',
          errorMessage: error.message
        }
      });
      throw error;
    }
  }

  private async sendSMS(to: string, message: string) {
    const result = await this.sms.send({
      to: [to],
      message,
      from: process.env.SMS_SENDER_ID
    });

    return result;
  }

  private async sendWhatsApp(to: string, message: string) {
    const result = await this.whatsapp.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${to}`,
      body: message
    });

    return result;
  }

  private async sendEmail(to: string, subject: string, html: string) {
    const result = await this.email.emails.send({
      from: 'noreply@styliste.com',
      to,
      subject,
      html
    });

    return result;
  }

  async renderTemplate(
    templateId: string,
    variables: Record<string, any>
  ): Promise<string> {
    const template = await prisma.notificationTemplate.findUnique({
      where: { id: templateId }
    });

    let message = template.messageTemplate;
    for (const [key, value] of Object.entries(variables)) {
      message = message.replace(new RegExp(`{${key}}`, 'g'), value);
    }

    return message;
  }

  private async checkCredits(stylistId: string, channel: string): Promise<boolean> {
    const subscription = await prisma.subscription.findFirst({
      where: {
        stylistId,
        endedAt: null
      }
    });

    return subscription.smsCreditsRemaining > 0;
  }

  private async deductCredits(stylistId: string, amount: number) {
    await prisma.subscription.updateMany({
      where: {
        stylistId,
        endedAt: null
      },
      data: {
        smsCreditsRemaining: { decrement: amount },
        smsCreditsUsed: { increment: amount }
      }
    });
  }
}
```

---

### 4. Module Paiements & Abonnements

**Responsabilités** :
- Gestion des abonnements
- Paiements Mobile Money (Fedapay)
- Webhooks paiements
- Suspension automatique impayés
- Upgrades/Downgrades

**Implémentation** :
```typescript
// /services/SubscriptionService.ts
import FedaPay from 'fedapay';

export class SubscriptionService {
  constructor() {
    FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY);
    FedaPay.setEnvironment(process.env.FEDAPAY_ENV);
  }

  async createSubscription(
    stylistId: string,
    planId: string,
    billingCycle: 'monthly' | 'yearly'
  ) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    const amount = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;

    // Créer transaction Fedapay
    const transaction = await FedaPay.Transaction.create({
      description: `Abonnement ${plan.name} - ${billingCycle}`,
      amount,
      currency: { iso: 'XOF' },
      callback_url: `${process.env.APP_URL}/api/webhooks/fedapay`,
      customer: {
        email: stylist.user.email,
        firstname: stylist.displayName
      }
    });

    // Créer subscription en attente
    const subscription = await prisma.subscription.create({
      data: {
        stylistId,
        planId,
        billingCycle,
        status: 'trial',
        trialEnd: addDays(new Date(), 14),
        currentPeriodStart: new Date(),
        currentPeriodEnd: this.calculatePeriodEnd(billingCycle)
      }
    });

    return {
      subscription,
      paymentUrl: transaction.token_url
    };
  }

  async handlePaymentSuccess(transactionId: string) {
    // Logique après paiement réussi
    const subscription = await prisma.subscription.findFirst({
      where: { /* ... */ }
    });

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'active',
        lastPaymentDate: new Date(),
        nextPaymentDate: this.calculateNextPaymentDate(subscription)
      }
    });

    // Ajouter crédits SMS
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: subscription.planId }
    });

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        smsCreditsRemaining: { increment: plan.smsCreditsIncluded }
      }
    });
  }

  async checkExpiredSubscriptions() {
    const expired = await prisma.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodEnd: { lte: new Date() }
      }
    });

    for (const sub of expired) {
      // Tenter renouvellement automatique
      // Si échec, passer en past_due
      await this.renewSubscription(sub.id);
    }
  }

  async upgradeSubscription(subscriptionId: string, newPlanId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true }
    });

    const newPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: newPlanId }
    });

    // Calcul prorata
    const prorata = this.calculateProrata(subscription, newPlan);

    // Update immédiat
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        planId: newPlanId,
        // Créditer prorata si upgrade
      }
    });

    // Créer paiement prorata
    if (prorata > 0) {
      // Initier paiement
    }
  }

  async downgradeSubscription(subscriptionId: string, newPlanId: string) {
    // Vérifier compatibilité (limites)
    const compatible = await this.checkDowngradeCompatibility(
      subscriptionId,
      newPlanId
    );

    if (!compatible.ok) {
      throw new Error(compatible.reason);
    }

    // Planifier downgrade à la fin de période
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        scheduledPlanChange: {
          targetPlanId: newPlanId,
          effectiveDate: subscription.currentPeriodEnd
        }
      }
    });
  }

  private calculatePeriodEnd(cycle: 'monthly' | 'yearly'): Date {
    return cycle === 'monthly'
      ? addMonths(new Date(), 1)
      : addYears(new Date(), 1);
  }
}
```

---

### 5. Module Portfolio & Annuaire

**Responsabilités** :
- Upload et optimisation d'images
- Recherche géolocalisée
- Statistiques (vues, clics)
- Modération (V2)

**Implémentation** :
```typescript
// /services/PortfolioService.ts
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export class PortfolioService {
  private s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  async uploadPortfolioItem(
    stylistId: string,
    file: File,
    metadata: PortfolioItemMetadata
  ) {
    // 1. Vérifier limites plan
    const canUpload = await this.checkPortfolioLimit(stylistId);
    if (!canUpload) {
      throw new Error('Limite de photos atteinte pour votre plan');
    }

    // 2. Optimiser image
    const optimized = await sharp(await file.arrayBuffer())
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    const thumbnail = await sharp(await file.arrayBuffer())
      .resize(400, 400, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();

    // 3. Upload S3
    const photoKey = `portfolio/${stylistId}/${Date.now()}.jpg`;
    const thumbKey = `portfolio/${stylistId}/${Date.now()}_thumb.jpg`;

    await this.s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: photoKey,
      Body: optimized,
      ContentType: 'image/jpeg'
    }));

    await this.s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: thumbKey,
      Body: thumbnail,
      ContentType: 'image/jpeg'
    }));

    // 4. Créer enregistrement
    const item = await prisma.portfolioItem.create({
      data: {
        stylistId,
        photoUrl: `${process.env.CDN_URL}/${photoKey}`,
        thumbnailUrl: `${process.env.CDN_URL}/${thumbKey}`,
        ...metadata
      }
    });

    // 5. Invalider cache
    await this.invalidateStylistCache(stylistId);

    return item;
  }

  async searchStylists(params: SearchStylistsInput) {
    const { lat, lng, radius, specialties, priceRange } = params;

    // Recherche géolocalisée (PostGIS)
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
        AND sub.ended_at IS NULL
        AND (sp.features->>'portfolio_public')::boolean = true
        AND s.accepts_new_orders = true
        AND ST_DWithin(
          ST_MakePoint(s.longitude, s.latitude)::geography,
          ST_MakePoint(${lng}, ${lat})::geography,
          ${radius * 1000}
        )
        ${specialties ? Prisma.sql`AND s.specialties ?| ${specialties}` : Prisma.empty}
        ${priceRange ? Prisma.sql`AND s.price_range = ${priceRange}` : Prisma.empty}
      ORDER BY distance_km ASC
      LIMIT 50
    `;

    return stylists;
  }

  async trackPortfolioView(portfolioItemId: string) {
    await prisma.portfolioItem.update({
      where: { id: portfolioItemId },
      data: {
        viewsCount: { increment: 1 }
      }
    });

    // Mettre à jour aussi le compteur du styliste
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
}
```

---

### 6. Module Dashboard Administrateur

**Responsabilités** :
- Vue d'ensemble de la plateforme
- Gestion des stylistes
- Support
- Statistiques globales
- Modération

**Endpoints API** :
```typescript
// /app/api/admin/stats/route.ts
export async function GET(req: Request) {
  const isAdmin = await checkAdminRole(req);
  if (!isAdmin) return Response.json({ error: 'Unauthorized' }, { status: 403 });

  const stats = await prisma.platformStatistics.findFirst({
    where: { date: new Date().toISOString().split('T')[0] },
    orderBy: { date: 'desc' }
  });

  const realtimeStats = {
    activeStylists: await prisma.stylist.count({
      where: {
        user: {
          lastLoginAt: { gte: subDays(new Date(), 30) }
        }
      }
    }),
    totalOrders: await prisma.order.count(),
    revenueToday: await prisma.payment.aggregate({
      where: {
        paymentDate: new Date().toISOString().split('T')[0],
        paymentStatus: 'completed'
      },
      _sum: { amount: true }
    })
  };

  return Response.json({
    ...stats,
    ...realtimeStats
  });
}

// /app/api/admin/stylists/[id]/suspend/route.ts
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { reason } = await req.json();

  await prisma.subscription.updateMany({
    where: {
      stylistId: params.id,
      endedAt: null
    },
    data: { status: 'suspended' }
  });

  await prisma.adminAuditLog.create({
    data: {
      adminUserId: req.user.id,
      actionType: 'suspend_stylist',
      entityType: 'stylist',
      entityId: params.id,
      description: `Styliste suspendu - Raison: ${reason}`
    }
  });

  return Response.json({ success: true });
}
```

---

## Optimisations pour l'Afrique

### 1. Réduction de la consommation de data

```typescript
// Compression Brotli
// next.config.js
module.exports = {
  compress: true,

  images: {
    formats: ['image/webp'], // WebP = -30% de taille
    deviceSizes: [640, 750, 828, 1080],
    minimumCacheTTL: 86400
  },

  // Lazy loading agressif
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  }
};

// Service Worker pour cache
// /public/sw.js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((response) => {
        return caches.open('v1').then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});
```

### 2. Support hors-ligne (PWA)

```typescript
// /lib/offline-storage.ts
import Dexie from 'dexie';

export class OfflineDB extends Dexie {
  clients: Dexie.Table<Client, string>;
  orders: Dexie.Table<Order, string>;
  pendingActions: Dexie.Table<PendingAction, string>;

  constructor() {
    super('StylisteOfflineDB');

    this.version(1).stores({
      clients: 'id, stylistId, phone, fullName',
      orders: 'id, stylistId, clientId, status, promisedDate',
      pendingActions: '++id, type, timestamp, synced'
    });
  }
}

export const db = new OfflineDB();

// Sync quand connexion revient
export async function syncPendingActions() {
  const pending = await db.pendingActions.where('synced').equals(0).toArray();

  for (const action of pending) {
    try {
      await fetch(`/api/${action.endpoint}`, {
        method: action.method,
        body: JSON.stringify(action.data)
      });

      await db.pendingActions.update(action.id, { synced: 1 });
    } catch (error) {
      console.error('Sync failed for action', action.id);
    }
  }
}

// Hook pour détecter connexion
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingActions();
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

### 3. Performance et latence

```typescript
// API caching agressif
// /lib/cache.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function cachedQuery<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 300 // 5 minutes par défaut
): Promise<T> {
  // Vérifier cache
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch
  const data = await fetchFn();

  // Cache
  await redis.setex(key, ttl, JSON.stringify(data));

  return data;
}

// Usage
const stylistOrders = await cachedQuery(
  `stylist:${stylistId}:orders`,
  () => prisma.order.findMany({ where: { stylistId } }),
  600 // 10 minutes
);
```

---

## Sécurité

### 1. Rate Limiting

```typescript
// /middleware/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 req / 10s
  analytics: true
});

export async function ratelimitMiddleware(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return Response.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString()
        }
      }
    );
  }

  return null; // Continue
}
```

### 2. Input Validation (Zod)

```typescript
// /schemas/order.schema.ts
import { z } from 'zod';

export const createOrderSchema = z.object({
  clientId: z.string().uuid(),
  garmentType: z.string().min(3).max(100),
  description: z.string().optional(),
  totalPrice: z.number().int().positive(),
  fabricProvidedBy: z.enum(['client', 'stylist']),
  urgencyLevel: z.enum(['normal', 'high', 'urgent']).default('normal'),
  promisedDate: z.string().datetime().refine(
    (date) => new Date(date) > new Date(),
    'La date promise doit être dans le futur'
  )
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// Usage dans API
export async function POST(req: Request) {
  const body = await req.json();

  try {
    const validated = createOrderSchema.parse(body);
    // Continue avec validated
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ errors: error.errors }, { status: 400 });
    }
  }
}
```

### 3. HTTPS & CORS

```typescript
// /middleware.ts
export function middleware(request: NextRequest) {
  // Force HTTPS en production
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('x-forwarded-proto') !== 'https'
  ) {
    return NextResponse.redirect(
      `https://${request.headers.get('host')}${request.nextUrl.pathname}`,
      301
    );
  }

  // CORS headers
  const response = NextResponse.next();
  const origin = request.headers.get('origin');

  if (ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  return response;
}
```

---

## Monitoring & Observabilité

### 1. Logging structuré

```typescript
// /lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

// Usage
logger.info({ userId, action: 'create_order' }, 'Order created successfully');
logger.error({ error, orderId }, 'Failed to update order');
```

### 2. Error tracking (Sentry)

```typescript
// /lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // Filtrer données sensibles
    if (event.request) {
      delete event.request.cookies;
    }
    return event;
  }
});
```

### 3. Métriques (Prometheus-compatible)

```typescript
// /app/api/metrics/route.ts
import { register, Counter, Histogram } from 'prom-client';

export const orderCreatedCounter = new Counter({
  name: 'orders_created_total',
  help: 'Total number of orders created'
});

export const apiDuration = new Histogram({
  name: 'api_request_duration_seconds',
  help: 'Duration of API requests in seconds',
  buckets: [0.1, 0.5, 1, 2, 5]
});

export async function GET() {
  return new Response(await register.metrics(), {
    headers: { 'Content-Type': register.contentType }
  });
}
```

---

## CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: build
          path: .next

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Environnements

### Variables d'environnement (.env.example)

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/styliste"

# Redis
REDIS_URL="redis://localhost:6379"

# Auth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# AWS S3
AWS_REGION="eu-west-1"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
S3_BUCKET="styliste-uploads"
CDN_URL="https://cdn.styliste.com"

# Email
RESEND_API_KEY="re_..."

# SMS
AFRICASTALKING_API_KEY="..."
AFRICASTALKING_USERNAME="..."

# WhatsApp
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_WHATSAPP_NUMBER="+..."

# Paiements
FEDAPAY_PUBLIC_KEY="pk_..."
FEDAPAY_SECRET_KEY="sk_..."
FEDAPAY_ENV="live" # ou "sandbox"

STRIPE_PUBLIC_KEY="pk_..."
STRIPE_SECRET_KEY="sk_..."

# Monitoring
SENTRY_DSN="https://..."
SENTRY_ORG="styliste"
SENTRY_PROJECT="backend"

# Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN="styliste.com"
```

---

## Scalabilité

### Stratégies de scaling

1. **Horizontal scaling (Serverless)**
   - Next.js sur Vercel : auto-scaling automatique
   - Fonctions Edge pour APIs rapides

2. **Database scaling**
   - Read replicas PostgreSQL pour queries lourdes
   - Connection pooling (PgBouncer)
   - Partitionnement par stylist_id si >100k stylistes

3. **Cache layering**
   - Niveau 1 : Browser cache (Service Worker)
   - Niveau 2 : CDN (Cloudflare)
   - Niveau 3 : Redis cache
   - Niveau 4 : PostgreSQL

4. **Job queues**
   - BullMQ avec workers séparés
   - Scaling horizontal des workers selon charge

5. **Stockage fichiers**
   - S3 avec CloudFront CDN
   - Image optimization on-the-fly (ImageKit)

---

## Déploiement Recommandé

### Option 1 : Vercel (Simplest)
- Frontend & API : Vercel
- Database : Neon (Serverless Postgres)
- Redis : Upstash
- Stockage : Cloudflare R2

**Coût estimé** : $50-200/mois pour 1000 stylistes

### Option 2 : Self-hosted (Contrôle total)
- Frontend : Cloudflare Pages
- Backend : Railway / Fly.io
- Database : Digital Ocean Managed PostgreSQL
- Redis : Redis Cloud
- Stockage : Backblaze B2

**Coût estimé** : $100-300/mois pour 1000 stylistes

---

## Roadmap Technique

### Phase 1 (MVP - Mois 1-3)
- Setup infrastructure basique
- Auth & multi-tenancy
- CRUD clients, commandes, paiements
- Notifications email
- Portfolio basique
- Dashboard styliste

### Phase 2 (V1 - Mois 4-6)
- Notifications SMS/WhatsApp
- Multi-employés
- Statistiques avancées
- Annuaire avec géolocalisation
- PWA (offline mode)
- Dashboard admin

### Phase 3 (V2 - Mois 7-12)
- Features IA (génération modèles)
- Mobile apps natives (React Native)
- API publique
- Marketplace
- Multi-pays
- Optimisations performance

---

**Version** : 1.0
**Dernière mise à jour** : 2026-02-05
**Auteur** : Équipe Styliste.com
