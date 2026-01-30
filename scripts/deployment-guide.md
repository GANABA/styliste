# Guide de déploiement - MVP Styliste.com

## Vue d'ensemble

Ce guide couvre le déploiement complet de l'application Styliste.com sur l'infrastructure de production.

**Stack de production:**
- **Frontend + API:** Cloudflare Pages
- **Base de données:** Supabase (PostgreSQL + Auth)
- **Storage:** Cloudflare R2 (images) + Supabase Storage (avatars)

---

## 16.1 - Exécuter les migrations database sur Supabase production

### Prérequis
- Compte Supabase avec projet créé
- Drizzle Kit installé (`npm install -g drizzle-kit`)

### Étapes

**1. Créer le projet Supabase (si pas déjà fait)**
```bash
# Aller sur https://supabase.com/dashboard
# - Créer un nouveau projet
# - Choisir la région : Paris (eu-west-1) pour proximité Afrique
# - Choisir le plan : Free tier pour MVP
# - Noter les credentials :
#   - Project URL
#   - Anon Key
#   - Service Role Key
#   - Database URL
```

**2. Configurer les variables d'environnement de production**
```bash
# Créer un fichier .env.production (NE PAS COMMIT)
PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]
DATABASE_URL=postgresql://[CONNECTION_STRING]
```

**3. Exécuter les migrations Drizzle**
```bash
# Depuis la racine du projet
export DATABASE_URL="postgresql://[CONNECTION_STRING]"

# Générer les migrations (déjà fait en dev)
npm run db:generate

# Appliquer les migrations sur production
npm run db:push

# Vérifier que les tables ont été créées
# Via Supabase Dashboard > Table Editor
# Tables attendues: stylistes, clients
```

**4. Appliquer les scripts SQL pour RLS**
```bash
# Se connecter au dashboard Supabase
# Aller dans SQL Editor

# Exécuter dans l'ordre :
# 1. drizzle/sql/001_enable_rls.sql
# 2. drizzle/sql/002_rls_policies_stylistes.sql
# 3. drizzle/sql/003_rls_policies_clients.sql
# 4. drizzle/sql/004_indexes.sql
```

**5. Vérifier que RLS est activé**
```sql
-- Dans SQL Editor Supabase
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('stylistes', 'clients');

-- Résultat attendu: rowsecurity = true pour les deux tables
```

**6. Vérifier les policies**
```sql
-- Dans SQL Editor Supabase
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('stylistes', 'clients');

-- Résultat attendu: 4 policies par table (SELECT, INSERT, UPDATE, DELETE)
```

---

## 16.2 - Configurer les variables d'environnement sur Cloudflare Pages

### Prérequis
- Compte Cloudflare avec accès à Pages
- Dépôt Git connecté (GitHub/GitLab)

### Étapes

**1. Créer le projet Cloudflare Pages**
```bash
# Aller sur https://dash.cloudflare.com
# - Pages > Create a project
# - Connecter le dépôt Git
# - Framework preset : SvelteKit
# - Build command : npm run build
# - Build output directory : .svelte-kit/cloudflare
```

**2. Configurer les variables d'environnement**

Aller dans **Settings > Environment variables** et ajouter:

**Variables publiques (exposées au client):**
```
PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
PUBLIC_APP_URL=https://styliste.com (ou votre domaine)
PUBLIC_APP_NAME=Styliste.com
PUBLIC_DEFAULT_LOCALE=fr
NODE_ENV=production
```

**Variables privées (serveur uniquement):**
```
DATABASE_URL=postgresql://[CONNECTION_STRING]
```

**⚠️ Important:** Ne PAS ajouter `SUPABASE_SERVICE_ROLE_KEY` ici. Elle sera ajoutée dans les Secrets (étape 16.3).

**3. Configurer l'adapter Cloudflare**

Vérifier que `svelte.config.js` utilise le bon adapter:

```javascript
import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      routes: {
        include: ['/*'],
        exclude: ['<all>']
      }
    })
  }
};

export default config;
```

**4. Mettre à jour le package.json**
```json
{
  "scripts": {
    "build": "vite build",
    "deploy": "npm run build && wrangler pages deploy .svelte-kit/cloudflare"
  }
}
```

---

## 16.3 - Ajouter SUPABASE_SERVICE_ROLE_KEY dans Cloudflare Secrets

### Pourquoi utiliser les Secrets ?
La `SUPABASE_SERVICE_ROLE_KEY` permet de bypass le RLS et doit être **ultra-sécurisée**. Elle ne doit pas être exposée dans les variables d'environnement standard.

### Étapes

**Option 1: Via Cloudflare Dashboard (recommandé pour MVP)**

1. Aller dans **Pages > [Votre projet] > Settings > Environment variables**
2. Ajouter une variable:
   - **Key:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** `[SERVICE_ROLE_KEY]`
   - **Type:** Cocher "Encrypt" (sera stocké comme secret)
   - **Environment:** Production only

**Option 2: Via Wrangler CLI (pour automatisation)**

```bash
# Installer Wrangler
npm install -g wrangler

# Se connecter à Cloudflare
wrangler login

# Ajouter le secret
wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY --project-name=styliste-com
# Entrer la valeur quand demandé

# Vérifier que le secret est ajouté
wrangler pages secret list --project-name=styliste-com
```

**Note:** Actuellement, la `SUPABASE_SERVICE_ROLE_KEY` n'est pas utilisée dans le code (toutes les opérations utilisent RLS). Si des opérations admin sont nécessaires à l'avenir, créer un client Supabase dédié:

```typescript
// src/lib/supabase-admin.ts (côté serveur uniquement)
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

export const supabaseAdmin = createClient(
  PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

---

## 16.4 - Build et deploy sur Cloudflare Pages

### Déploiement automatique (recommandé)

**1. Push sur la branche main**
```bash
git add .
git commit -m "feat: MVP compte, profil et CRM"
git push origin main
```

**2. Cloudflare Pages détecte automatiquement le push**
- Build automatique déclenché
- Logs visibles dans Dashboard > Pages > [Projet] > Deployments
- URL de preview générée : `https://[hash].[project].pages.dev`

**3. Vérifier le déploiement**
```bash
# Aller sur le dashboard Cloudflare Pages
# - Vérifier que le build est "Success"
# - Cliquer sur "View deployment"
# - Tester l'application sur l'URL de production
```

### Déploiement manuel (si besoin)

```bash
# Depuis la racine du projet
npm run build

# Vérifier que le build est réussi
# Fichiers générés dans : .svelte-kit/cloudflare

# Déployer manuellement
wrangler pages deploy .svelte-kit/cloudflare --project-name=styliste-com
```

### Rollback en cas de problème

```bash
# Via Dashboard Cloudflare
# Pages > [Projet] > Deployments
# - Trouver le déploiement précédent fonctionnel
# - Cliquer sur les 3 points > "Rollback to this deployment"

# Via Wrangler CLI
wrangler pages deployment list --project-name=styliste-com
wrangler pages deployment rollback [DEPLOYMENT_ID] --project-name=styliste-com
```

---

## 16.5 - Smoke tests en production

### Objectif
Vérifier que toutes les fonctionnalités critiques fonctionnent en production.

### Tests à effectuer

**1. Test de création de compte**
```
✅ Aller sur https://[production-url]/signup
✅ S'inscrire avec un email de test : test-prod@styliste.com
✅ Vérifier la redirection vers /profile/create
✅ Vérifier que la session est créée (cookie)
```

**2. Test de création de profil**
```
✅ Remplir le formulaire de profil
✅ Sauvegarder
✅ Vérifier redirection vers /dashboard
✅ Vérifier que le profil est affiché dans /profile
```

**3. Test d'ajout de client**
```
✅ Aller sur /clients/new
✅ Créer un client de test
✅ Vérifier qu'il apparaît dans /clients
✅ Vérifier les détails dans /clients/[id]
✅ Modifier le client via /clients/[id]/edit
✅ Vérifier les modifications
```

**4. Test d'isolation multi-tenant**
```
✅ Créer un 2ème compte styliste
✅ Créer un client pour le 2ème styliste
✅ Se reconnecter avec le 1er compte
✅ Essayer d'accéder au client du 2ème styliste (via URL directe)
✅ Vérifier erreur 404 ou "Client non trouvé"
```

**5. Test de déconnexion**
```
✅ Cliquer sur "Déconnexion"
✅ Vérifier redirection vers /signin
✅ Vérifier que l'accès à /dashboard redirige vers /signin
```

**6. Test de reconnexion**
```
✅ Se reconnecter avec les credentials du test
✅ Vérifier que les données sont toujours là
✅ Vérifier que le profil et les clients sont intacts
```

**7. Test de performance**
```
✅ Ouvrir Chrome DevTools > Lighthouse
✅ Lancer un audit mobile
✅ Vérifier scores :
   - Performance > 90
   - Accessibility > 90
   - Best Practices > 90
```

**8. Test sur mobile réel**
```
✅ Ouvrir l'application sur un smartphone
✅ Tester la navigation
✅ Tester la création de client
✅ Vérifier que tout est responsive
```

### Rapport de smoke tests

**Date:** ___________
**Version:** ___________
**Testeur:** ___________

**Résultats:**
- [ ] Création de compte : ✅ / ❌
- [ ] Création de profil : ✅ / ❌
- [ ] Ajout de client : ✅ / ❌
- [ ] Isolation multi-tenant : ✅ / ❌
- [ ] Déconnexion/Reconnexion : ✅ / ❌
- [ ] Performance : ✅ / ❌
- [ ] Mobile : ✅ / ❌

**Bugs identifiés:**
1. ...
2. ...

**Actions à prendre:**
1. ...
2. ...

---

## Monitoring post-déploiement

### 1. Logs Cloudflare
```
Dashboard > Pages > [Projet] > Logs
- Vérifier les erreurs 500
- Vérifier les requêtes lentes
```

### 2. Analytics Supabase
```
Dashboard > Reports
- Vérifier le nombre de connexions database
- Vérifier les requêtes lentes
- Monitorer l'utilisation du plan Free
```

### 3. Cloudflare Analytics
```
Dashboard > Pages > [Projet] > Analytics
- Vérifier le trafic
- Vérifier les erreurs 4xx/5xx
- Vérifier la latence
```

### 4. Alertes recommandées
- [ ] Erreur rate > 5% (Cloudflare Workers Analytics)
- [ ] Database connections > 80% (Supabase)
- [ ] Response time > 3s (Cloudflare)

---

## Checklist finale

Avant de considérer le déploiement comme réussi :

- [ ] Migrations database appliquées
- [ ] RLS activé et testé
- [ ] Variables d'environnement configurées
- [ ] Secrets sécurisés ajoutés
- [ ] Build réussi sur Cloudflare Pages
- [ ] Smoke tests passés (7/7)
- [ ] Performance > 90 sur Lighthouse
- [ ] Mobile responsive vérifié
- [ ] Monitoring configuré
- [ ] Documentation à jour

---

## Rollback d'urgence

En cas de problème critique en production :

```bash
# Option 1: Rollback via Cloudflare Dashboard
Pages > [Projet] > Deployments > Rollback

# Option 2: Désactiver temporairement le site
# Créer une page de maintenance statique

# Option 3: Réversion Git + Redéploiement
git revert [commit-hash]
git push origin main
# Cloudflare redéploiera automatiquement
```

---

## Support et contacts

**En cas de problème:**
- Cloudflare Support : https://dash.cloudflare.com/support
- Supabase Support : https://supabase.com/dashboard/support
- Documentation : Voir README.md et ARCHITECTURE.md
