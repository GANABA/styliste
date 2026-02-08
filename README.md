# 🎨 Styliste.com - Plateforme SaaS pour Stylistes Africains

> Modernisons ensemble l'artisanat africain en digitalisant la gestion des ateliers de couture.

---

## 📚 Documentation du Projet

Ce repository contient toute la documentation stratégique et technique pour le lancement de **Styliste.com**, une plateforme SaaS destinée aux stylistes et tailleurs africains.

### 📁 Structure des Documents

```
styliste/
│
├── README.md                      ← Vous êtes ici
├── PRD.md                         ← Product Requirements Document (Vision produit)
├── DECISIONS.md                   ← Décisions Architecturales (ADR)
├── DATABASE_SCHEMA.md             ← Schémas de base de données complets
├── ARCHITECTURE.md                ← Architecture technique détaillée
├── IMPLEMENTATION_PLAN.md         ← Plan d'implémentation Sprint par Sprint
├── EXECUTIVE_SUMMARY.md           ← Résumé exécutif pour investisseurs
│
└── .claude/
    └── memory/
        └── (Mémoire du projet pour continuité)
```

---

## 🎯 Aperçu Rapide

### Le Problème
Les stylistes africains gèrent leur activité manuellement (cahiers, carnets), ce qui entraîne :
- ❌ Perte de données clients et mesures
- ❌ Retards de livraison fréquents
- ❌ Absence de visibilité digitale
- ❌ Suivi des paiements approximatif

### La Solution
Une plateforme SaaS tout-en-un avec :
- ✅ **Back-office** : CRM clients, commandes, paiements, planning
- ✅ **Portfolio public** : Vitrine professionnelle pour chaque styliste
- ✅ **Annuaire** : Carte interactive pour trouver des stylistes
- ✅ **IA (V2)** : Génération de modèles, recommandations morphologie

### Marché Cible
- **Phase 1** : Bénin (50 000 stylistes)
- **Phase 2** : Afrique de l'Ouest (500 000 stylistes)
- **Phase 3** : Afrique (5M+ stylistes)

### Modèle Économique
- **Plans** : Gratuit | Standard (5k FCFA) | Pro (10k FCFA) | Premium (20k FCFA)
- **Revenus projetés Année 1** : 10 000 EUR ARR
- **Point mort** : Mois 15-18 avec 120 stylistes payants

---

## 📖 Guide de Lecture

### Pour Démarrer (5 min)
1. **EXECUTIVE_SUMMARY.md** ← Commencez ici pour une vue d'ensemble

### Pour Comprendre le Produit (20 min)
1. **PRD.md** - Vision, fonctionnalités par phase, principes
2. **DECISIONS.md** - Décisions critiques prises et rationale

### Pour les Développeurs (1-2h)
1. **ARCHITECTURE.md** - Stack technique, modules, flux de données
2. **DATABASE_SCHEMA.md** - Tables, relations, triggers, vues
3. **IMPLEMENTATION_PLAN.md** - Sprints détaillés, timeline

### Pour les Investisseurs (10 min)
1. **EXECUTIVE_SUMMARY.md** - Business case complet
2. **PRD.md** - Section "Indicateurs de succès (KPIs)"

### Pour les Product Managers (30 min)
1. **PRD.md** - Fonctionnalités complètes
2. **DECISIONS.md** - Questions stratégiques répondues
3. **IMPLEMENTATION_PLAN.md** - Roadmap et sprints

---

## 🚀 Quick Start - Prochaines Étapes

### Semaine Prochaine
- [ ] Relire tous les documents et valider les décisions
- [ ] Lancer interviews stylistes (objectif : 20 personnes)
- [ ] Créer compte Figma et commencer wireframes
- [ ] Définir budget exact et timeline

### Dans 2 Semaines
- [ ] Finaliser maquettes Figma (tous les écrans MVP)
- [ ] Tests utilisateurs sur prototypes (5 stylistes)
- [ ] Décision GO/NO-GO définitive
- [ ] Setup infrastructure technique (si GO)

### Mois 1
- [ ] Recruter développeur Full-Stack (si pas déjà fait)
- [ ] Créer repository GitHub
- [ ] Setup Vercel, Neon, Redis, S3
- [ ] Démarrer Sprint 1 (Auth & Fondations)

---

## 🔑 Décisions Critiques - ✅ TOUTES VALIDÉES (29/29)

Voici les **29 décisions architecturales majeures** documentées et validées :

| # | Décision | Choix Validé |
|---|----------|--------------|
| 1 | **Architecture Notifications** | Email MVP, SMS V1 (avec système de crédits) |
| 2 | **Modèle de Données Client** | Base locale par styliste (pas de partage) |
| 3 | **Portfolio dans Plan Gratuit** | Non - uniquement Plan Pro+ |
| 4 | **Système d'Avis** | Pas d'avis MVP, Témoignages modérés V1 |
| 5 | **Onboarding Stylistes** | Support intégré + service personnalisé payant |
| 6 | **Gestion des Mesures** | Templates personnalisables avec versioning |
| 7 | **Statuts Commandes** | 5 statuts simples (Devis/En cours/Prêt/Livré/Annulé) |
| 8 | **Gestion Tissu** | Tracking flexible (fourni par client ou styliste) |
| 9 | **Charge de Travail Max** | 15 commandes actives simultanément |
| 10 | **Essai Gratuit** | 14 jours avec accès complet (Plan Pro équivalent) |
| 11 | **Upgrades/Downgrades** | Upgrade immédiat, downgrade fin période |
| 12 | **Dashboard Administrateur** | Back-office complet pour gérer plateforme |
| 13 | **Langues** | Français MVP, Anglais V1, Langues locales V2+ |
| 14 | **Support Client** | FAQ + WhatsApp + Email (chatbot V2) |
| 15 | **Export Données** | Export manuel complet + backup auto quotidien |
| 16 | **Système Parrainage** | 1 mois gratuit par filleul converti |
| 17 | **Géolocalisation** | Carte interactive avec marqueurs cliquables |
| 18 | **Multi-employés** | Différé à V1 (rôles et permissions) |
| 19 | **Langues** | Français MVP, Anglais V1, Locales V2+ |
| 20 | **Support Client** | FAQ + WhatsApp + Email (Chatbot V2) |
| 21 | **Export Données** | Export manuel + backup auto quotidien |
| 22 | **Essai Gratuit** | 14 jours accès Pro complet |
| 23 | **Upgrades/Downgrades** | Upgrade immédiat, downgrade fin période |
| 24 | **Impayés Plateforme** | 3 jours grâce → suspension → suppression |
| 25 | **Système Parrainage** | 1 mois gratuit par filleul converti |
| 26 | **Dashboard Admin** | Gestion complète plateforme |
| 27 | **Facturation SMS** | ✅ Quota inclus + packs additionnels (VALIDÉ) |
| 28 | **Limites Essai Gratuit** | ✅ 50 clients, 10 commandes, 20 photos, watermark (VALIDÉ) |
| 29 | **Downgrade avec Dépassement** | ✅ Bloquer jusqu'à nettoyage (VALIDÉ) |

➡️ **Détails complets dans `DECISIONS.md` et `FINAL_DECISIONS.md`**

### 🎉 Statut : PROJET 100% VALIDÉ - PRÊT À DÉVELOPPER

---

## 🏗️ Stack Technique Recommandée

### Frontend
- **Framework** : Next.js 14+ (App Router, React 18, TypeScript)
- **Styling** : Tailwind CSS + shadcn/ui
- **State** : Zustand + React Query
- **Maps** : Mapbox GL JS
- **Offline** : Service Worker (PWA) + IndexedDB

### Backend
- **API** : Next.js API Routes + tRPC (type-safe)
- **ORM** : Prisma
- **DB** : PostgreSQL (Neon)
- **Cache** : Redis (Upstash)
- **Jobs** : BullMQ

### Infrastructure
- **Hosting** : Vercel
- **Storage** : Cloudflare R2 / AWS S3
- **Email** : Resend
- **SMS** : Africa's Talking
- **Paiements** : Fedapay (Mobile Money)

➡️ **Architecture détaillée dans `ARCHITECTURE.md`**

---

## 📊 Timeline & Milestones

### Phase 0 : Validation (3 semaines)
- Interviews 20 stylistes
- Wireframes + Maquettes
- Tests utilisateurs

### Phase 1 : MVP (3 mois)
- Sprint 1-2 : Auth + Clients + Mesures
- Sprint 3 : Commandes + Photos
- Sprint 4 : Paiements + Planning
- Sprint 5 : Portfolio + Notifications
- Sprint 6 : Abonnements + Admin

### Phase 2 : Lancement Pilote (1 mois)
- 10 stylistes pilotes
- Onboarding personnalisé
- Validation product-market fit

### Phase 3 : Lancement Public (2 mois)
- 50 stylistes (Beta)
- Intégration paiements
- Marketing acquisition
- 100+ stylistes (Public)

### V1 (Mois 7-12)
- SMS/WhatsApp
- Multi-employés
- Géolocalisation
- Expansion géographique

### V2 (Mois 13-18)
- IA (génération modèles)
- Apps mobiles natives
- API publique

➡️ **Sprints détaillés dans `IMPLEMENTATION_PLAN.md`**

---

## 💰 Budget & Financement

### Coût Total MVP (6 mois) : ~14 000 EUR

| Catégorie | Montant |
|-----------|---------|
| Développement (dev + design) | 11 500 EUR |
| Infrastructure (6 mois) | 390 EUR |
| Marketing & Acquisition | 750 EUR |
| Opérations & Légal | 1 480 EUR |

### Projections Revenus Année 1

| Trimestre | Stylistes | Payants | MRR |
|-----------|-----------|---------|-----|
| Q1 | 40 | 5 | 56 EUR |
| Q2 | 150 | 28 | 315 EUR |
| Q3 | 300 | 55 | 619 EUR |
| Q4 | 500 | 90 | 1 013 EUR |

**ARR Année 1** : ~10 000 EUR

➡️ **Détails financiers dans `EXECUTIVE_SUMMARY.md`**

---

## 📈 Métriques de Succès

### North Star Metric
**Nombre de commandes créées par les stylistes chaque mois**
(indicateur de valeur réelle créée)

### KPIs Critiques

**Acquisition**
- Visiteurs landing : 1000/mois (M3)
- Taux conversion inscription : 10%
- CAC : < 5000 FCFA (~7.50 EUR)

**Activation**
- Onboarding complété : > 70%
- Première commande créée : > 60%
- Time to First Value : < 48h

**Rétention**
- Churn mensuel : < 5%
- Stylistes actifs hebdo : > 70%
- NPS : > 50

**Revenu**
- Taux conversion gratuit → payant : > 20%
- ARPU : 7500 FCFA (~11 EUR)
- LTV/CAC : > 3

---

## 🎨 Design & UX

### Écrans Principaux MVP (à créer dans Figma)

**Authentification**
- [ ] Landing page publique
- [ ] Page login
- [ ] Page register
- [ ] Onboarding wizard

**Dashboard Styliste**
- [ ] Dashboard principal (stats, KPIs)
- [ ] Navigation sidebar

**CRM Clients**
- [ ] Liste clients (table avec recherche)
- [ ] Fiche client (détails, historique)
- [ ] Formulaire nouveau client
- [ ] Gestion mesures (versionnage)

**Gestion Commandes**
- [ ] Vue Kanban (par statut)
- [ ] Liste commandes (filtrable)
- [ ] Détails commande
- [ ] Formulaire nouvelle commande
- [ ] Upload photos

**Paiements**
- [ ] Historique paiements
- [ ] Enregistrer paiement
- [ ] Génération facture PDF

**Planning**
- [ ] Vue calendrier
- [ ] Prochaines livraisons
- [ ] Rendez-vous essayages

**Portfolio**
- [ ] Page portfolio public (par styliste)
- [ ] Gestion photos portfolio (upload, édition)
- [ ] Annuaire stylistes (carte interactive)

**Abonnements**
- [ ] Page plan actuel
- [ ] Comparaison plans
- [ ] Upgrade/Downgrade

**Admin**
- [ ] Dashboard admin (stats globales)
- [ ] Liste stylistes
- [ ] Actions admin (suspendre, changer plan)

➡️ **Prototypes interactifs à créer dans Figma**

---

## ✅ Checklist Avant Développement

### Validation Marché
- [ ] 20 interviews stylistes complétées
- [ ] Feedbacks consolidés
- [ ] 10 stylistes pilotes identifiés et engagés
- [ ] Prix validés (disposition à payer confirmée)

### Design
- [ ] Wireframes tous écrans MVP
- [ ] Maquettes haute-fidélité (desktop + mobile)
- [ ] Design system défini (couleurs, typo, composants)
- [ ] Prototypes interactifs testés avec 5 stylistes
- [ ] Ajustements UX effectués

### Technique
- [ ] Stack technique validée
- [ ] Comptes créés (Vercel, Neon, Upstash, Cloudflare R2, Resend, Fedapay)
- [ ] Repository GitHub créé
- [ ] CI/CD configuré
- [ ] Environnements (dev, staging, prod) setup

### Légal & Business
- [ ] Structure juridique créée (SARL, SAS, etc.)
- [ ] Compte bancaire business ouvert
- [ ] CGU/CGV rédigées
- [ ] Politique de confidentialité rédigée
- [ ] Contrat styliste rédigé

### Équipe
- [ ] Développeur Full-Stack recruté (ou confirmé)
- [ ] Accès outils (Figma, GitHub, Vercel, etc.) partagés
- [ ] Rituels définis (daily standup, sprint review)
- [ ] Communication (Slack, Discord, WhatsApp)

---

## 🤝 Contribution

Ce projet est en phase de pré-lancement. Si vous souhaitez contribuer :

1. **Développeurs** : Contactez-nous pour rejoindre l'équipe tech
2. **Designers** : Nous cherchons des UI/UX designers avec expérience mobile-first
3. **Business** : Profils sales, marketing, ops welcome
4. **Stylistes** : Devenez styliste pilote et shapez le produit

**Contact** : contact@styliste.com

---

## 📞 Support & Questions

- **Email** : support@styliste.com
- **WhatsApp** : +229 XX XX XX XX (à définir)
- **Documentation** : (ce repository)

---

## 📄 Licence & Confidentialité

⚠️ **Tous les documents de ce repository sont confidentiels** et destinés uniquement aux équipes internes, investisseurs et partenaires autorisés.

© 2026 Styliste.com - Tous droits réservés

---

## 🌟 Vision Long-Terme

> Notre ambition est de devenir **la plateforme de référence** pour les stylistes et tailleurs africains, en combinant :
>
> 1. **Gestion d'activité moderne** (remplacer les cahiers)
> 2. **Visibilité digitale** (portfolio professionnel)
> 3. **Innovation par l'IA** (génération de modèles, recommandations)
>
> Et ainsi contribuer à la **valorisation et modernisation de l'artisanat africain** à l'échelle du continent et au-delà.

---

## 🎯 Prochaine Action Immédiate

**VOUS DEVEZ MAINTENANT** :

1. ✅ **Lire `EXECUTIVE_SUMMARY.md`** (10 min) pour comprendre le business case
2. ✅ **Lire `PRD.md`** (20 min) pour comprendre le produit
3. ✅ **Lire `DECISIONS.md`** (15 min) pour valider les choix faits
4. ✅ **Prendre une décision GO/NO-GO** sur le projet
5. ✅ Si GO → Démarrer Phase 0 (Validation Marché) dès la semaine prochaine

---

**Bonne chance pour cette aventure ! 🚀**

*"Le meilleur moment pour planter un arbre était il y a 20 ans. Le deuxième meilleur moment, c'est maintenant."*

---

**Dernière mise à jour** : 2026-02-05
**Version** : 1.0
**Auteur** : Équipe Styliste.com
