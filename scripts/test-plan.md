# Plan de tests - MVP Styliste.com

## Prérequis

1. Serveur de développement démarré: `npm run dev`
2. Base de données Supabase configurée avec migrations appliquées
3. Variables d'environnement configurées (`.env`)

## Tests à effectuer

### 15.1 - Test du flow d'inscription complet (phone + email)

**Test A: Inscription avec email**
```bash
# Utiliser playwright-skill pour tester
# URL: http://localhost:5173/signup
# - Remplir formulaire email/password
# - Vérifier redirection vers /profile/create
# - Vérifier que la session est créée
```

**Test B: Inscription avec téléphone (OTP)**
```bash
# Note: Nécessite Supabase Auth configuré avec Termii pour SMS
# URL: http://localhost:5173/signup
# - Remplir formulaire avec numéro de téléphone
# - Recevoir code OTP
# - Vérifier code
# - Vérifier redirection vers /profile/create
```

**Critères:**
- ✅ Formulaire d'inscription fonctionnel
- ✅ Validation des champs (email valide, password fort)
- ✅ Messages d'erreur appropriés si échec
- ✅ Redirection correcte après inscription

---

### 15.2 - Test du flow de connexion complet (phone + email)

**Test A: Connexion avec email**
```bash
# URL: http://localhost:5173/signin
# - Se connecter avec compte existant (email/password)
# - Vérifier redirection vers /dashboard (si profil complet) ou /profile/create
```

**Test B: Connexion avec téléphone**
```bash
# URL: http://localhost:5173/signin
# - Se connecter avec numéro de téléphone
# - Vérifier code OTP
# - Vérifier redirection
```

**Critères:**
- ✅ Formulaire de connexion fonctionnel
- ✅ Authentification réussie avec credentials valides
- ✅ Messages d'erreur pour credentials invalides
- ✅ Redirection correcte selon état du profil

---

### 15.3 - Test création et modification de profil styliste

**Test A: Création de profil**
```bash
# URL: http://localhost:5173/profile/create
# - Remplir tous les champs obligatoires:
#   - Nom du salon
#   - Téléphone
#   - Ville (optionnel)
# - Soumettre le formulaire
# - Vérifier redirection vers /dashboard
```

**Test B: Modification de profil**
```bash
# URL: http://localhost:5173/profile
# - Modifier les champs
# - Sauvegarder
# - Vérifier que les modifications sont persistées
```

**Critères:**
- ✅ Formulaire de profil fonctionnel
- ✅ Validation des champs obligatoires
- ✅ Sauvegarde réussie
- ✅ Affichage correct du profil après sauvegarde

---

### 15.4 - Test du CRUD complet des clients

**Test CREATE**
```bash
# URL: http://localhost:5173/clients/new
# - Créer un nouveau client avec nom + téléphone
# - Vérifier redirection vers liste des clients
# - Vérifier que le client apparaît dans la liste
```

**Test READ**
```bash
# URL: http://localhost:5173/clients
# - Afficher la liste des clients
# - Cliquer sur un client pour voir les détails
# - Vérifier que toutes les informations sont affichées
```

**Test UPDATE**
```bash
# URL: http://localhost:5173/clients/[id]/edit
# - Modifier les informations d'un client
# - Sauvegarder
# - Vérifier que les modifications sont persistées
```

**Test DELETE**
```bash
# URL: http://localhost:5173/clients/[id]
# - Cliquer sur le bouton de suppression
# - Confirmer la suppression
# - Vérifier que le client n'apparaît plus dans la liste
```

**Critères:**
- ✅ CRUD complet fonctionnel
- ✅ Validation des champs
- ✅ Messages de confirmation/erreur appropriés
- ✅ Données persistées correctement

---

### 15.5 - Test de la recherche de clients

```bash
# URL: http://localhost:5173/clients
# - Créer 3 clients avec noms différents
# - Utiliser la barre de recherche
# - Chercher par nom partiel
# - Chercher par numéro de téléphone
# - Vérifier que les résultats sont filtrés correctement
```

**Critères:**
- ✅ Recherche par nom fonctionne
- ✅ Recherche par téléphone fonctionne
- ✅ Résultats filtrés en temps réel
- ✅ Message approprié si aucun résultat

---

### 15.6 - Test isolation multi-tenant

**Référence:** Voir `scripts/test-rls-isolation.md`

**Résumé:**
1. Créer 2 comptes stylistes
2. Créer des clients pour chaque styliste
3. Vérifier qu'un styliste ne peut pas voir les clients de l'autre
4. Tester via l'UI et l'API directement

**Critères:**
- ✅ Styliste A ne voit que ses clients
- ✅ Styliste B ne voit que ses clients
- ✅ Impossible d'accéder aux données d'un autre styliste via URL directe
- ✅ API respecte l'isolation (RLS PostgreSQL)

---

### 15.7 - Test du rate limiting OTP

**Test:**
```bash
# URL: http://localhost:5173/signup
# - Essayer d'envoyer 4 codes OTP au même numéro en moins d'1 heure
# - Vérifier que la 4ème requête est bloquée
# - Vérifier le message d'erreur approprié
```

**Critères:**
- ✅ Maximum 3 OTP par téléphone par heure
- ✅ Message d'erreur clair après limite atteinte
- ✅ Réinitialisation du compteur après 1 heure

---

### 15.8 - Test responsive mobile (320px, 768px, 1024px)

**Test avec playwright-skill:**
```bash
# Tester sur différentes résolutions
# - 320px (mobile petit)
# - 375px (mobile standard - iPhone)
# - 768px (tablette)
# - 1024px (desktop)
# - 1920px (desktop large)
```

**Pages à tester:**
- `/signup`
- `/signin`
- `/profile`
- `/clients`
- `/clients/new`
- `/clients/[id]`

**Critères:**
- ✅ Layout s'adapte correctement à chaque résolution
- ✅ Aucun scroll horizontal
- ✅ Tous les éléments cliquables sont accessibles
- ✅ Texte lisible à toutes les tailles
- ✅ Navigation mobile (hamburger menu) fonctionnelle

---

### 15.9 - Vérifier Lighthouse score > 90 mobile

**Test:**
```bash
# Ouvrir Chrome DevTools
# - Aller dans l'onglet Lighthouse
# - Sélectionner "Mobile"
# - Lancer l'audit
# - Vérifier les scores:
#   - Performance: > 90
#   - Accessibility: > 90
#   - Best Practices: > 90
#   - SEO: > 90
```

**Pages à auditer:**
- `/` (landing page)
- `/signin`
- `/dashboard`
- `/clients`

**Critères:**
- ✅ Performance > 90
- ✅ Accessibility > 90
- ✅ Best Practices > 90
- ✅ SEO > 90
- ✅ Aucune erreur critique

---

### 15.10 - Test sur connexion 3G throttling

**Test:**
```bash
# Chrome DevTools > Network Tab
# - Sélectionner "Slow 3G" dans le throttling
# - Naviguer sur l'application
# - Mesurer:
#   - First Contentful Paint (FCP)
#   - Time to Interactive (TTI)
#   - Total Blocking Time (TBT)
```

**Critères:**
- ✅ TTI < 5s sur 3G (objectif < 3s sur 4G)
- ✅ FCP < 2s
- ✅ Application utilisable malgré la latence
- ✅ Indicateurs de chargement appropriés
- ✅ Pas de timeouts

---

## Exécution des tests

### Option 1: Tests manuels
Suivre les étapes décrites ci-dessus manuellement dans le navigateur.

### Option 2: Tests automatisés avec Playwright
```bash
# Démarrer le serveur
npm run dev

# Dans un autre terminal, utiliser playwright-skill
# Exemple:
/playwright-skill test http://localhost:5173/signup
```

### Option 3: Tests Lighthouse
```bash
# Installer Lighthouse CLI
npm install -g lighthouse

# Exécuter l'audit
lighthouse http://localhost:5173 --view --preset=desktop
lighthouse http://localhost:5173 --view --preset=mobile
```

## Rapport de tests

Après avoir exécuté tous les tests, remplir le rapport:

**Tests réussis:** ___ / 10
**Tests échoués:** ___ / 10

**Bugs identifiés:**
1. ...
2. ...

**Améliorations suggérées:**
1. ...
2. ...
