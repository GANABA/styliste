# Document de Décisions Architecturales (ADR)
# Styliste.com

Date : 2026-02-05

---

## Décision 1 : Architecture des Notifications

**Statut** : ✅ APPROUVÉ

**Contexte** :
Les notifications sont critiques pour la communication styliste-client. Coût opérationnel important à considérer.

**Options évaluées** :
- A) Intégration API SMS/WhatsApp dès le MVP (coûteux mais différenciant)
- B) MVP avec emails uniquement, SMS/WhatsApp en V1
- C) Système de crédit (styliste achète des crédits notifications)

**Décision** :
- **Phase MVP** : Email uniquement (gratuit, simple)
- **Phase V1** : Ajout SMS avec système de crédit ou abonnement (à décider)
- **Phase V2** : WhatsApp Business API

**Question ouverte** :
Modèle de facturation SMS - deux options à évaluer :
1. Inclus dans abonnement avec limite mensuelle
2. Achat de crédits séparés à l'usage

**Rationale** :
- Réduction des coûts initiaux
- Validation du produit avant investissement infrastructure SMS
- Email suffit pour MVP dans contexte où stylistes peuvent appeler clients

---

## Décision 2 : Modèle de Données Client

**Statut** : ✅ APPROUVÉ

**Contexte** :
Un client peut aller chez plusieurs stylistes. Faut-il une base globale ou locale ?

**Options évaluées** :
- A) Base de données globale de clients (risque de conflit entre stylistes)
- B) Clients isolés par styliste (duplication mais simplicité)

**Décision** : **B - Clients isolés par styliste**

**Implications** :
- Chaque styliste possède ses propres données clients
- Pas de partage entre stylistes
- Duplication acceptée (même personne peut être client de 2 stylistes)
- Simplicité RGPD : le styliste est responsable de ses données
- Facilite l'export de données à la fermeture de compte

**Implémentation** :
```
Client {
  id: UUID
  stylist_id: UUID (FK)
  name: string
  phone: string
  email: string (optional)
  notes: text
  created_at: timestamp
  updated_at: timestamp
}
```

---

## Décision 3 : Portfolio dans le Plan Gratuit

**Statut** : ✅ APPROUVÉ

**Contexte** :
Le portfolio est un argument de vente majeur. Faut-il le donner gratuitement ?

**Options évaluées** :
- A) Oui, avec limitations (3 photos max)
- B) Non, uniquement à partir du plan Pro

**Décision** : **B - Portfolio uniquement Plan Pro et supérieur**

**Rationale** :
- Portfolio = principal argument de conversion vers payant
- Permet différenciation claire entre plans
- Crée incitation financière forte
- Stylistes sérieux accepteront de payer pour visibilité

**Plans avec Portfolio** :
- ❌ Plan Gratuit (Découverte)
- ❌ Plan Standard (Gestion)
- ✅ Plan Pro (Gestion + Portfolio)
- ✅ Plan Premium (Pro + IA)

---

## Décision 4 : Système d'Avis/Notes

**Statut** : ✅ APPROUVÉ

**Contexte** :
Les avis clients renforcent la confiance, mais complexifient la modération.

**Options évaluées** :
- A) Pas d'avis (annuaire simple)
- B) Témoignages modérés par styliste
- C) Avis vérifiés (complexe)

**Décision** :
- **MVP** : **A - Pas d'avis** (annuaire simple)
- **V1** : **B - Témoignages modérés**

**Implémentation V1** :
- Le styliste peut ajouter des témoignages clients
- Pas de système ouvert d'avis publics
- Évite les faux avis et la modération complexe
- Le styliste contrôle sa réputation

---

## Décision 5 : Onboarding des Stylistes

**Statut** : ✅ APPROUVÉ

**Contexte** :
Faible littératie numérique, migration depuis cahiers papier, besoin d'accompagnement.

**Décision** : Support d'onboarding intégré

**Éléments à implémenter** :

### 1. Tutoriel interactif au premier login
- Tour guidé des fonctionnalités principales
- Démo avec données fictives
- Checklist de configuration initiale

### 2. Support multi-canal
- FAQ contextuelle sur chaque page
- Tutoriels vidéo (courts, 1-3 min)
- Numéro WhatsApp support
- Chatbot simple (V2)

### 3. Documentation
- Guide de démarrage rapide (PDF)
- Fiches pratiques par fonctionnalité
- FAQ complète

### 4. Service d'accompagnement personnalisé (optionnel, payant)
- Appel de configuration pour premiers clients
- Import assisté des données depuis cahiers
- Formation à distance

**Coût du service personnalisé** :
- Gratuit pour 10 premiers stylistes pilotes
- Payant ensuite (ex : 5000 FCFA forfait setup)

---

## Décision 6 : Gestion des Mesures

**Statut** : ✅ APPROUVÉ

**Contexte** :
Les mesures varient selon type de tenue et morphologie.

**Décision** : Système de mesures personnalisable avec templates de base

**Fonctionnalités** :

### 1. Templates de base pré-définis
```
- Femme - Robe
  • Tour de poitrine (obligatoire)
  • Tour de taille (obligatoire)
  • Tour de hanches (obligatoire)
  • Longueur robe
  • Longueur manches
  • Tour de bras
  • Largeur épaules

- Homme - Costume
  • Tour de poitrine (obligatoire)
  • Tour de taille (obligatoire)
  • Longueur dos
  • Longueur manches
  • Largeur épaules
  • Tour de cou
  • Longueur pantalon

- Homme - Pantalon
  • Tour de taille (obligatoire)
  • Tour de hanches
  • Longueur pantalon (obligatoire)
  • Entrejambe

- Enfant - Général
  • Hauteur
  • Tour de poitrine
  • Longueur
```

### 2. Personnalisation
- Le styliste peut modifier les templates
- Ajouter/supprimer des mesures
- Définir quelles mesures sont obligatoires
- Sauvegarder ses propres templates

### 3. Versionnage
```
ClientMeasurement {
  id: UUID
  client_id: UUID
  measurement_type: string (ex: "Robe femme")
  measurements: JSON
  date_taken: date
  notes: text
  is_current: boolean
  created_by: UUID (employé qui a pris les mesures)
}
```

### 4. Unités
- Par défaut : centimètres (cm)
- Option : pouces (inches)
- Paramètre au niveau du compte styliste

---

## Décision 7 : Cycle de Vie des Commandes

**Statut** : ✅ APPROUVÉ

**Décision** : Statuts simples et clairs (5 statuts principaux)

**Statuts définis** :

1. **Devis** (nouveau)
   - Commande non confirmée
   - Permet négociation prix
   - Peut être converti en commande ou refusé

2. **En cours**
   - Commande confirmée
   - Travail en cours
   - Sous-statuts optionnels : Coupe, Assemblage, Essayage, Retouches

3. **Prêt**
   - Terminé, en attente de récupération
   - Déclenche notification automatique

4. **Livré**
   - Remis au client
   - Commande terminée

5. **Annulé**
   - Commande annulée
   - Raison enregistrée
   - Traitement des remboursements

**Workflow** :
```
Devis → En cours → Prêt → Livré
  ↓         ↓
Refusé   Annulé
```

---

## Décision 8 : Gestion du Tissu

**Statut** : ✅ APPROUVÉ

**Contexte** :
Généralement le client apporte le tissu, parfois le styliste fournit.

**Décision** : Option flexible avec tracking

**Implémentation** :
```
Order {
  ...
  fabric_provided_by: ENUM('client', 'stylist')
  fabric_received_date: date (si client)
  fabric_description: text
  fabric_photo_url: string
  fabric_supplier_id: UUID (si styliste, lien vers fournisseur)
}
```

**Logique métier** :
- Si tissu fourni par client :
  - Date de réception du tissu = début réel de la commande
  - Alerte si client tarde à apporter le tissu
- Si tissu fourni par styliste :
  - Coût tissu inclus dans le prix
  - Optionnel : gestion de stock (V2)

---

## Décision 9 : Charge de Travail Maximum

**Statut** : ✅ APPROUVÉ

**Décision** : Maximum 15 commandes actives simultanément

**Implémentation** :

```
StylistSettings {
  max_concurrent_orders: integer (default: 15)
  current_active_orders: integer (calculé)
  capacity_percentage: float (calculé)
}
```

**Alertes** :
- 80% de capacité (12 commandes) : avertissement jaune
- 100% de capacité (15 commandes) : alerte rouge
- Option de bloquer nouvelles commandes si 100% atteint

**Personnalisation** :
- Le styliste peut ajuster sa limite selon sa capacité réelle
- Suggestion basée sur historique (V2)

---

## Décision 10 : Période d'Essai Gratuite

**Statut** : ✅ APPROUVÉ

**Décision** : 14 jours d'essai gratuit avec accès complet

**Détails** :
- Durée : 14 jours
- Accès : Toutes les fonctionnalités sauf IA (Plan Pro équivalent)
- Aucune carte bancaire requise
- Limitations pendant l'essai :
  - Portfolio public activé mais avec watermark "Version d'essai"
  - Maximum 50 clients
  - Maximum 10 commandes actives
- Fin d'essai :
  - Choix du plan (Gratuit, Standard, Pro)
  - Données conservées
  - Downgrade automatique vers Gratuit si aucun paiement

---

## Décision 11 : Gestion des Upgrades/Downgrades

**Statut** : ✅ APPROUVÉ

**Contexte** :
Flexibilité nécessaire pour changements de plan.

**Décision** :

### Upgrades
- Effet immédiat
- Prorata calculé pour le mois en cours
- Débloquage instantané des nouvelles fonctionnalités

### Downgrades
- Prise d'effet en fin de période d'abonnement en cours
- Notification 7 jours avant
- Vérification de compatibilité :
  - Si dépassement de limites (ex: 100 clients mais plan permet 50)
  - Invite à nettoyer ou payer supplément

**Exemple de règles de downgrade** :
```
Si Plan Pro → Plan Standard :
  - Portfolio devient privé (non supprimé)
  - Alerter si > limite clients/commandes du nouveau plan
  - Proposer export des données excédentaires
```

---

## Décision 12 : Dashboard Administrateur

**Statut** : ✅ NOUVEAU BESOIN

**Contexte** :
Besoin de gérer la plateforme, les stylistes, les statistiques globales.

**Décision** : Créer un back-office administrateur séparé

**Fonctionnalités** :

### 1. Gestion des stylistes
- Liste de tous les stylistes inscrits
- Filtres : actifs, suspendus, plans, pays
- Actions : suspendre, supprimer, changer plan
- Vue détaillée : stats, activité, paiements

### 2. Statistiques globales
- Nombre de stylistes actifs
- Revenus mensuels/annuels
- Taux de rétention
- Taux de conversion Gratuit → Payant
- Commandes gérées sur la plateforme
- Utilisation des fonctionnalités

### 3. Gestion des paiements
- Suivi des abonnements
- Impayés
- Remboursements
- Export comptabilité

### 4. Support
- Tickets de support
- Messages des stylistes
- FAQ/Documentation

### 5. Modération
- Validation des portfolios (si modération activée)
- Signalements
- Qualité des contenus

### 6. Analytics
- Dashboards temps réel
- Rapports personnalisés
- Export de données

**Sécurité** :
- Accès restreint (rôles : Super Admin, Admin, Support)
- Logs d'actions administratives
- Authentification renforcée (2FA obligatoire)

---

## Décision 13 : Langues et Localisation

**Statut** : ✅ APPROUVÉ

**Décision** : Approche progressive

**Phase 1 (MVP)** : Français uniquement
- Interface 100% en français
- Documentation en français

**Phase 2 (V1)** : Ajout de l'anglais
- Interface bilingue FR/EN
- Sélection de langue au niveau du compte
- Documentation traduite

**Phase 3 (V2+)** : Langues locales
- Exploration Fon, Yoruba (Bénin)
- Dépend de disponibilité des ressources de traduction
- Interface vocale possible pour faible littératie

**Implémentation technique** :
- i18n dès le début (même si FR uniquement au MVP)
- Fichiers de traduction séparés
- Prêt pour l'ajout de langues sans refonte

---

## Décision 14 : Support Client

**Statut** : ✅ APPROUVÉ

**Décision** : Support multi-canal progressif

**MVP** :
- FAQ contextuelle intégrée
- Page "Aide" complète
- Email support : support@styliste.com
- WhatsApp support : +229 XX XX XX XX

**V1** :
- Chat en direct (heures de bureau)
- Base de connaissances enrichie
- Tutoriels vidéo

**V2** :
- Chatbot intelligent (IA)
- Support multilingue
- Forum communautaire

**SLA (Service Level Agreement)** :
- Email : réponse sous 24h
- WhatsApp : réponse sous 4h (heures ouvrables)
- Chat : réponse immédiate

---

## Décision 15 : Sauvegarde et Export de Données

**Statut** : ✅ APPROUVÉ

**Décision** : Export manuel par le styliste

**Fonctionnalités** :

### 1. Export global
- Bouton "Exporter toutes mes données"
- Format : ZIP contenant :
  - clients.csv
  - commandes.csv
  - paiements.csv
  - mesures.json
  - photos (dossier)
  - historique_notifications.csv

### 2. Exports sélectifs
- Clients uniquement
- Commandes d'une période
- Données comptables

### 3. Sauvegarde automatique cloud
- Backup quotidien côté serveur
- Rétention : 30 jours

### 4. Suppression de compte
- Export automatique proposé avant suppression
- Email avec lien de téléchargement (valide 7 jours)
- Suppression définitive après 30 jours (conformité RGPD)

---

## Décision 16 : Système de Parrainage

**Statut** : ✅ APPROUVÉ

**Décision** : Programme de parrainage incitatif

**Mécanique** :

### 1. Code de parrainage
- Chaque styliste reçoit un code unique (ex: STYLE-JEAN-2025)
- Partage via WhatsApp, réseaux sociaux

### 2. Récompenses
**Pour le parrain** :
- 1 mois gratuit pour 1 filleul qui s'abonne (plan payant)
- Cumulable (max 12 mois/an = 12 filleuls)

**Pour le filleul** :
- 1er mois à -50% sur tout plan payant
- ou
- 7 jours d'essai supplémentaires (21 jours au lieu de 14)

### 3. Tracking
```
Referral {
  id: UUID
  referrer_id: UUID (parrain)
  referred_id: UUID (filleul)
  code: string
  date_signup: timestamp
  date_converted: timestamp (passage au payant)
  status: ENUM('pending', 'converted', 'expired')
  reward_granted: boolean
}
```

### 4. Conditions
- Le filleul doit rester abonné 2 mois minimum
- Si désabonnement avant 2 mois, récompense annulée
- Pas d'auto-parrainage (vérification email/téléphone)

---

## Décision 17 : Géolocalisation et Carte Interactive

**Statut** : ✅ APPROUVÉ

**Décision** : Carte interactive comme fonctionnalité phare de l'annuaire

**Fonctionnalités** :

### 1. Carte interactive (Google Maps ou Mapbox)
- Affichage de tous les stylistes avec portfolio actif
- Marqueurs cliquables
- Clustering si beaucoup de stylistes dans une zone

### 2. Popup au clic
```
- Photo de profil
- Nom du salon
- Spécialités (tags)
- Note/étoiles (si système d'avis activé)
- Bouton "Voir le portfolio"
- Bouton "Contacter" (WhatsApp/appel)
- Itinéraire (lien Google Maps)
```

### 3. Filtres carte
- Rayon de recherche (1km, 5km, 10km, 50km)
- Spécialité (mariage, traditionnel, moderne, enfants)
- Fourchette de prix
- Disponibilité (accepte nouvelles commandes)

### 4. Recherche par adresse
- Barre de recherche "Trouver un styliste près de..."
- Géolocalisation automatique (avec permission)

### 5. Vue liste alternative
- Basculer entre carte et liste
- Tri : proximité, popularité, récence

**Implémentation** :
```
StylistProfile {
  ...
  latitude: float
  longitude: float
  address: string
  city: string
  district: string (quartier)
  country: string
  accepts_new_orders: boolean
}
```

---

## Récapitulatif des Décisions Majeures

| # | Décision | Choix | Phase |
|---|----------|-------|-------|
| 1 | Notifications | Email MVP, SMS V1 | MVP/V1 |
| 2 | Base données clients | Locale par styliste | MVP |
| 3 | Portfolio gratuit | Non (Pro+) | MVP |
| 4 | Système d'avis | Pas d'avis MVP, Témoignages V1 | MVP/V1 |
| 5 | Onboarding | Support intégré + service payant | MVP |
| 6 | Mesures | Personnalisables avec templates | MVP |
| 7 | Statuts commandes | 5 statuts simples | MVP |
| 8 | Gestion tissu | Tracking flexible | MVP |
| 9 | Charge max | 15 commandes actives | MVP |
| 10 | Essai gratuit | 14 jours accès complet | MVP |
| 11 | Upgrade/Downgrade | Immédiat/Fin période | MVP |
| 12 | Dashboard admin | Back-office complet | MVP |
| 13 | Langues | FR → EN → locales | MVP/V1/V2 |
| 14 | Support | FAQ + WhatsApp + Email | MVP |
| 15 | Export données | Manuel + backup auto | MVP |
| 16 | Parrainage | 1 mois gratuit/filleul | V1 |
| 17 | Géolocalisation | Carte interactive | MVP |

---

## Questions Ouvertes (à décider)

### 1. Facturation des notifications SMS
**Options** :
- A) Inclus dans abonnement avec limite (ex: 100 SMS/mois pour Standard, 500 pour Pro)
- B) Système de crédit séparé (achat de packs : 100 SMS = 1000 FCFA)
- C) Hybride : quota inclus + achat de crédit si dépassement

**Recommandation à valider** : **C - Hybride**
- Plan Standard : 50 SMS/mois inclus
- Plan Pro : 200 SMS/mois inclus
- Plan Premium : 500 SMS/mois inclus
- Possibilité d'acheter des packs additionnels

### 2. Modération des portfolios
**Question** : Faut-il modérer les photos avant publication publique ?
**Impact** : Qualité de la plateforme vs friction pour les stylistes

**Options** :
- A) Pas de modération (confiance totale)
- B) Modération automatique (détection contenu inapproprié)
- C) Modération manuelle (équipe admin vérifie)

**Recommandation** : **B au MVP, puis C si abus détectés**

### 3. Monétisation de l'IA (Plan Premium)
**Question** : Quel prix pour l'accès IA ?
**Contexte** : Coût des API IA (OpenAI, etc.) élevé

**À évaluer** :
- Coût réel par styliste
- Valeur perçue
- Prix acceptable dans contexte béninois

---

## Prochaines Actions

1. ✅ Valider les questions ouvertes
2. → Créer les schémas de base de données détaillés
3. → Définir l'architecture technique
4. → Créer les wireframes des écrans principaux
5. → Définir les plans tarifaires précis (en FCFA)
6. → Choisir la stack technique
7. → Lancer le développement

---

**Document vivant** - Dernière mise à jour : 2026-02-05
