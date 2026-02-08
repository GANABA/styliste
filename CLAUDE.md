# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Styliste.com** is a SaaS platform for African tailors and fashion designers to manage their tailoring business, replace paper-based systems, and gain online visibility. The project is currently in the **planning/documentation phase** - no code has been written yet.

**Status**: 100% validated documentation, ready for development
**Target Market**: Benin → West Africa → Africa (5M+ tailors)
**Business Model**: SaaS B2B with 4 subscription tiers (Free, Standard, Pro, Premium)

---

## Documentation Structure

This repository contains comprehensive planning documentation (~244 KB across 11 files):

### Core Documents (Read in Order)
1. **README.md** - Start here for project overview and navigation
2. **EXECUTIVE_SUMMARY.md** - Business case, market, financials
3. **PRD.md** - Product requirements and feature roadmap
4. **DECISIONS.md** - 29 validated architectural decisions
5. **FINAL_DECISIONS.md** - Latest 3 decisions with implementation code
6. **USER_FEEDBACK_SUMMARY.md** - All stakeholder feedback integrated
7. **ARCHITECTURE.md** - Technical architecture and code examples
8. **DATABASE_SCHEMA.md** - Complete database schema (22 tables)
9. **IMPLEMENTATION_PLAN.md** - Sprint-by-sprint implementation plan
10. **INDEX.md** - Navigation guide by role
11. **COMPLETION_SUMMARY.md** - Work summary and next steps

### Key Context Files
- **.claude/memory/** - Project continuity memory
- **INDEX.md** - Quick navigation by role (CEO, Developer, Designer, PM, Investor)

---

## Technical Architecture

### Multi-Tenant SaaS Architecture
- **Isolation**: Each stylist has their own client database (local, not shared)
- **Data Model**: `stylist_id` foreign key on all tenant-scoped tables
- **Security**: Row Level Security (RLS) in PostgreSQL

### Stack (Validated)
**Frontend**:
- Next.js 14+ (App Router, React 18, TypeScript)
- Tailwind CSS + shadcn/ui
- Zustand + React Query
- PWA with Service Worker + IndexedDB (offline support)

**Backend**:
- Next.js API Routes + tRPC (type-safe)
- Prisma ORM
- PostgreSQL 14+ (Neon recommended)
- Redis (Upstash) for caching/queues
- BullMQ for background jobs

**Infrastructure**:
- Vercel (hosting)
- Cloudflare R2 / AWS S3 (file storage)
- Resend (email), Africa's Talking (SMS)
- Fedapay (Mobile Money payments)

### Database Schema (22 Tables)
Key tables: `users`, `stylists`, `clients`, `orders`, `payments`, `notifications`, `portfolio_items`, `subscription_plans`, `subscriptions`, `measurement_templates`, `client_measurements`

**Conventions**:
- All IDs: UUID v4
- Timestamps: UTC
- Soft delete: `deleted_at` column
- Multi-tenant: `stylist_id` FK on scoped tables

Full schema with CREATE TABLE statements in `DATABASE_SCHEMA.md`.

---

## Core Business Logic

### Client Management
- **Measurements**: Versioned with date tracking (customizable templates)
- **Privacy**: Each stylist owns their client data (no sharing between stylists)
- **History**: Full audit trail of all client interactions

### Order Management
- **5 Simple Statuses**: Devis (Quote) → En cours (In Progress) → Prêt (Ready) → Livré (Delivered) | Annulé (Canceled)
- **Capacity Limit**: Maximum 15 active orders per stylist
- **Photos**: Support for 4 types - reference, fabric, fitting, finished
- **Fabric Tracking**: Typically client-provided (with received date)

### Payment System
- **Structure**: Total price, advance, partial payments, balance
- **Methods**: Cash, Mobile Money (MTN/Moov/Orange), Bank Transfer
- **Invoicing**: PDF generation with auto-numbering

### Subscription Plans
```
Free (Découverte): 20 clients, 5 orders, no portfolio
Standard: 100 clients, 15 orders, auto notifications (5k FCFA/month)
Pro: Unlimited clients, 20 orders, public portfolio (10k FCFA/month)
Premium: All + multi-employees + AI features (20k FCFA/month)
```

**Trial**: 14 days full Pro access (50 clients, 10 orders, 20 photos, watermark on portfolio)

**SMS Credits**: Quota included per plan (50/200/500) + purchasable packs

### Notifications
- **Channels**: Email (MVP) → SMS (V1) → WhatsApp (V2)
- **Types**: Order ready, payment reminder, pickup reminder, fitting reminder
- **History**: Complete log with delivery status

---

## African Context Optimizations

### Critical Constraints
1. **Unstable connectivity**: Offline-first PWA, aggressive caching
2. **Data costs**: Image optimization, lazy loading, minimal bandwidth
3. **Mobile-first**: 95% of users on smartphones (5-6 inch screens)
4. **Digital literacy**: Simple UI, contextual help, WhatsApp support
5. **Payment**: Mobile Money (Fedapay) primary method

### Implementation Considerations
- Touch targets: Minimum 44px
- Images: WebP format, sharp optimization, thumbnails
- Offline: IndexedDB with Dexie.js, sync on reconnect
- i18n ready: French MVP, English V1, local languages V2+

---

## Development Phases

### Phase 0: Validation (3 weeks) - **CURRENT**
- 20 stylist interviews
- Figma wireframes/mockups
- User testing on prototypes

### Phase 1: MVP (12 weeks / 7 sprints)
**Sprint 1-2**: Auth + Clients + Measurements
**Sprint 3**: Orders + Photo Upload
**Sprint 4**: Payments + Planning + Dashboard
**Sprint 5**: Portfolio + Email Notifications
**Sprint 6**: Subscriptions + Admin Dashboard
**Sprint 7**: Testing + Bug Fixes + Polish

Detailed sprint breakdown in `IMPLEMENTATION_PLAN.md`.

### Phase 2: Pilot Launch (4 weeks)
- 10 pilot stylists
- Personalized onboarding
- Product-market fit validation

### Phase 3: Public Launch (8 weeks)
- 50 stylists (private beta)
- 100+ stylists (public)
- Payment integration live

---

## Key Architectural Decisions

### Critical Validations (All 29/29 Approved)

**Data Model**:
- Local database per stylist (no sharing)
- Measurement templates: customizable with versioning
- Order capacity: 15 concurrent active orders max

**Features**:
- Portfolio: Pro plan and above only
- Trial: 14 days, Pro access, 50/10/20 limits, watermark
- Downgrade: Blocked if exceeds new plan limits (must cleanup first)

**Monetization**:
- SMS: Quota included + purchasable packs (50 SMS = 1k FCFA)
- Upgrade: Immediate effect with prorata
- Downgrade: End of billing period
- Unpaid: 3-day grace → suspension → deletion (21 days)

**Geography**:
- Interactive map (Mapbox/Google Maps)
- PostGIS for geospatial queries
- Filters: radius, specialty, availability

Full decision rationale in `DECISIONS.md` and `FINAL_DECISIONS.md`.

---

## No Code Yet - Planning Phase Only

**This repository contains only documentation**. When development starts:

1. Create new Next.js project: `npx create-next-app@latest styliste-app --typescript --tailwind --app`
2. Setup Prisma: Copy schema from `DATABASE_SCHEMA.md`
3. Implement architecture from `ARCHITECTURE.md` (includes TypeScript code examples)
4. Follow sprint plan from `IMPLEMENTATION_PLAN.md`

---

## Important Constraints

### Mobile-First Mandatory
- 95% users on smartphones
- Design for 5-6 inch screens first
- Touch targets ≥ 44px
- Offline capability critical

### Data Privacy
- Each stylist owns their client data
- GDPR-equivalent compliance
- Export before account deletion
- 30-day retention after deletion

### Performance Targets
- Lighthouse score > 90
- First Contentful Paint < 2s
- Time to Interactive < 3s
- Works on 3G connections

---

## Metrics & KPIs

**North Star Metric**: Orders created per stylist per month

**Critical KPIs**:
- Activation: >70% complete onboarding, >60% create first order within 48h
- Retention: <5% monthly churn, >70% weekly active users
- Revenue: >20% free→paid conversion, LTV/CAC > 3
- Engagement: >10 orders/stylist/month

---

## Budget & Timeline

**MVP Budget**: 14,000 EUR (6 months)
- Development: 11,500 EUR
- Infrastructure: 390 EUR
- Marketing: 750 EUR
- Operations: 1,480 EUR

**Revenue Projections Year 1**: 10,000 EUR ARR
**Break-even**: Month 15-18 (120 paying stylists)

---

## Contact & Stakeholders

- **Email**: contact@styliste.com
- **Support**: support@styliste.com
- **WhatsApp**: +229 XX XX XX XX (TBD)
- **Target**: Benin tailors initially

---

## When Starting Development

1. Read `ARCHITECTURE.md` for complete technical architecture with code examples
2. Read `DATABASE_SCHEMA.md` for all 22 tables with SQL CREATE statements
3. Follow `IMPLEMENTATION_PLAN.md` sprint-by-sprint (Sprint 1-2 starts with auth + clients)
4. Reference `DECISIONS.md` and `FINAL_DECISIONS.md` for all validated architectural choices
5. Use code examples from `ARCHITECTURE.md` (TypeScript implementations for all 6 core modules)

All strategic decisions are finalized. No requirements gathering needed - just execute the plan.

---

## Development Guidelines & Workflow

### Visual Style
- **Interface**: Claire et minimaliste
- **Dark Mode**: Non disponible pour le MVP (uniquement mode clair)
- **Design System**: Utiliser shadcn/ui avec cohérence

### Security & Best Practices
- **API Keys**: NE JAMAIS exposer les clés API au client (toujours côté serveur)
- **Environment Variables**: Toutes les clés sensibles dans `.env.local` (jamais committées)
- **Authentication**: JWT tokens, HttpOnly cookies pour les sessions

### Dependencies Management
- **UI Components**: Préférer les composants shadcn/ui existants plutôt que d'ajouter de nouvelles bibliothèques UI
- **Keep it Lean**: Éviter la surcharge de dépendances (impact sur bundle size et performance 3G)
- **Justification**: Toute nouvelle dépendance doit être justifiée (pourquoi les solutions existantes ne suffisent pas)

### Testing Workflow
Après chaque développement impliquant l'interface graphique :
1. Utiliser `playwright-skill` pour tester l'interface
2. Vérifier la responsiveness (mobile-first : 375px, 768px, 1024px)
3. Valider la fonctionnalité développée
4. Tester sur connexion lente (throttling 3G)

### Development Tools & Skills

**Frontend Development**:
- Utiliser systématiquement la skill `frontend-design` pour le développement d'interfaces modernes et optimisées SaaS
- Garantit des interfaces distinctives et polies, évite les designs génériques

**Documentation & Library Usage**:
- Utiliser automatiquement **Context7** (MCP tools) pour :
  - Génération de code
  - Étapes de configuration ou d'installation
  - Documentation de bibliothèque/API
- Ne pas attendre de demande explicite : déclencher Context7 dès que nécessaire

**Browser Testing**:
- Skill `playwright-skill` pour l'automatisation des tests UI
- Validation des flows utilisateur (login, création commande, etc.)

### Documentation Standards
- **Langue**: Toutes les spécifications doivent être rédigées en **français**
- **OpenSpec**:
  - Sections Purpose et Scenarios en français
  - Titres de Requirements en anglais avec mots-clés SHALL/MUST (validation OpenSpec)
- **Code**: Commentaires en français, noms de variables/fonctions en anglais

---

## Quick Reference Commands

```bash
# Start development server
npm run dev

# Run tests
npm test
npm run test:e2e  # Playwright tests

# Build for production
npm run build

# Database migrations
npx prisma migrate dev
npx prisma studio

# Code quality
npm run lint
npm run type-check
```

---

## Getting Help

If you encounter issues or need clarification on any architectural decision, refer to:
1. `DECISIONS.md` - All 29 validated architectural decisions
2. `ARCHITECTURE.md` - Technical implementation details with code examples
3. `DATABASE_SCHEMA.md` - Database structure and relationships
4. `.claude/memory/` - Project continuity and learnings
