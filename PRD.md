# Plateforme SaaS pour Stylistes & Tailleurs Africains : Styliste.com

## 1. Vision du produit

Créer une plateforme SaaS destinée aux stylistes, tailleurs et couturiers africains (Bénin, Afrique de l’Ouest, puis Afrique entière), leur permettant de :

- Gérer efficacement leur activité quotidienne
- Centraliser clients, mesures, commandes et planning
- Disposer d’une vitrine professionnelle en ligne
- Communiquer simplement avec leurs clients
- Moderniser progressivement leur métier grâce à l’IA

Le **styliste est l’unique utilisateur du SaaS**.  
Les clients finaux **n’ont pas de compte** sur la plateforme.

---

## 2. Positionnement du produit

- Type : SaaS B2B
- Cible principale : Stylistes / tailleurs / couturiers
- Cible secondaire : Clients finaux (consultation et réception de notifications)
- Zone prioritaire : Bénin → Afrique de l’Ouest → Afrique
- Monétisation : Abonnements mensuels / annuels

---

## 3. Utilisateurs et rôles

### 3.1 Stylistes / Tailleurs
- Comptes authentifiés
- Utilisateurs payants
- Accès au back-office
- Gestion complète de leur activité

### 3.2 Clients finaux (non-utilisateurs)
- Aucun compte
- Aucune authentification
- Peuvent :
  - Consulter les portfolios publics
  - Contacter un styliste
  - Recevoir des notifications (SMS / WhatsApp / Email)

---

## 4. Problèmes à résoudre

### Côté styliste
- Gestion manuelle désorganisée
- Perte des mesures clients
- Mauvais suivi des commandes
- Retards fréquents
- Absence de visibilité digitale
- Difficulté à structurer paiements et planning

### Côté client
- Peu de visibilité sur les créations
- Incertitude sur l’état des commandes
- Communication parfois inefficace

---

## 5. Principes de conception

- Mobile-first
- Simplicité avant exhaustivité
- Faible consommation de données
- Adapté aux connexions instables
- Notifications plutôt que tableaux complexes
- Le styliste reste propriétaire de ses clients

---

## 6. Architecture fonctionnelle

- Back-office styliste (privé)
- Vitrine publique (portfolio / annuaire)
- Système de notifications (styliste → client)

---

## 7. Fonctionnalités par phase

---

## 7.1 MVP – Minimum Viable Product

### Objectif
Permettre à un styliste de :
- Gérer son activité quotidienne
- Être visible en ligne
- Communiquer efficacement avec ses clients

---

### MVP – Back-office Styliste

#### Compte & profil
- Création de compte styliste
- Profil professionnel :
  - Nom du salon
  - Description
  - Contacts
  - Localisation

---

#### CRM local (clients privés)
- Création de fiches clients :
  - Nom
  - Téléphone
  - Email (optionnel)
  - Notes
- Historique par client

  Les clients ne sont pas partagés entre stylistes.

---

#### Gestion des mesures
- Enregistrement des mesures
- Historique
- Mise à jour simple

---

#### Gestion des commandes
- Création de commande :
  - Client
  - Type de tenue
  - Description
  - Date prévue
  - Prix
- Statuts :
  - En cours
  - Prêt
  - Livré

---

#### Notifications clients
- Déclenchées par le styliste ou automatiquement
- Canaux :
  - SMS
  - Email
  - WhatsApp (si disponible)

---

#### Planning
- Rendez-vous
- Dates de livraison
- Vue calendrier simple

---

#### Tableau de bord
- Commandes en cours
- Commandes prêtes
- Commandes livrées

---

### MVP – Vitrine publique (Portfolio)

- Page publique par styliste
- Galerie de créations
- Description
- Contacts directs (appel, WhatsApp, email)

Accessible uniquement aux stylistes abonnés au module portfolio.

---

### MVP – Transversal

- Web responsive (mobile & desktop)
- Langues : Français / Anglais
- Sauvegarde automatique
- Sécurité basique

---

## 7.2 V1 – Version étendue

### Objectif
Améliorer la productivité et la valeur perçue.

---

### V1 – Styliste

- Gestion des paiements :
  - Avance
  - Solde
- Factures / reçus simples
- Gestion de stocks
- Multi-employés
- Statistiques basiques :
  - Revenus
  - Délais
- Messages groupés clients

---

### V1 – Vitrine

- Catégories de créations
- Collections
- Mise en avant de stylistes
- Recherche simple

---

### V1 – Notifications

- Rappels automatiques
- Templates de messages
- Historique des notifications

---

## 7.3 V2 – Innovation & IA

### Objectif
Créer un avantage concurrentiel durable.

---

### IA – Cas d’usage

- Génération de modèles de tenues
- Inspiration à partir de photos ou tissus
- Suggestions selon morphologie
- Recommandation de couleurs
- Estimation intelligente des mesures
- Assistant IA pour le styliste :
  - Conseils
  - Organisation
  - Créativité

---

### V2 – Fonctionnalités avancées

- Lien de suivi de commande sans compte
- Marketplace interne
- Vente de modèles
- Apps mobiles natives
- Multi-pays / multi-devises
- API publique

---

## 7.4 Hors périmètre (long terme)

- Réseau social complet
- Blockchain / NFT
- Crypto-paiements
- Réalité virtuelle
- ERP comptable complet
- Formation certifiante

---

## 8. Contraintes contextuelles africaines

- Connexion instable
- Smartphones d’entrée de gamme
- Coût de la data
- Usage massif de WhatsApp & Mobile Money
- Niveaux variés de littératie numérique

---

## 9. Indicateurs de succès (KPIs)

- Nombre de stylistes actifs
- Taux de rétention
- Commandes gérées
- Utilisation des notifications
- Adoption du portfolio
- Passage entre plans

---

## 10. Vision long terme

Devenir la plateforme de référence pour :
- La gestion des ateliers de couture africains
- La valorisation des créations locales
- L’innovation textile via la technologie et l’IA

---

## 11. Modèle d’abonnement (adapté Bénin / Afrique de l’Ouest)

### 11.1 Principes

- Le styliste est le seul payeur
- Pas de paiement côté client final
- Abonnements simples, abordables
- Paiement mensuel ou annuel
- Mobile Money prioritaire

---

### 11.2 Plans d’abonnement

#### Plan Gratuit – « Découverte »

Objectif : tester sans risque.

Fonctionnalités :
- Compte styliste
- CRM basique
- Gestion des mesures
- Commandes (limitées)
- Planning simple

Limitations :
- Nombre limité de clients
- Nombre limité de commandes actives
- Pas de portfolio public
- Notifications manuelles uniquement

---

#### Plan Standard – « Gestion »

Objectif : usage quotidien réel.

Fonctionnalités :
- Tout le plan Gratuit
- Commandes illimitées
- Notifications automatiques
- Historique complet
- Tableau de bord

Limitations :
- Pas de portfolio public
- Pas d’IA

---

#### Plan Pro – « Gestion + Portfolio »

Objectif : visibilité et crédibilité.

Fonctionnalités :
- Tout le plan Standard
- Portfolio public
- Galerie de créations
- Mise en avant dans l’annuaire
- Notifications avancées

Limitations :
- Nombre limité de photos
- Pas d’IA

---

#### Plan Premium – « Pro + IA »

Objectif : stylistes avancés et créatifs.

Fonctionnalités :
- Tout le plan Pro
- Accès aux fonctionnalités IA
- Génération de modèles
- Assistant IA
- Statistiques avancées
- Support prioritaire

---

### 11.3 Modules optionnels (add-ons)

- Pack notifications supplémentaires
- Photos portfolio additionnelles
- Multi-employés
- Fonctions spécifiques par pays

---

### 11.4 Facturation

- Mensuelle / annuelle
- Mobile Money (MTN, Moov, Orange…)
- Carte bancaire
- Suspension automatique en cas de non-paiement

---
