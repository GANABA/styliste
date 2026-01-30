# Test d'isolation multi-tenant - Styliste.com

## Objectif
Vérifier que l'isolation RLS PostgreSQL empêche un styliste d'accéder aux données d'un autre styliste.

## Prérequis
- Base de données Supabase configurée
- RLS activé sur les tables `stylistes` et `clients`
- Policies RLS créées

## Scénarios de test

### Test 1 : Isolation des profils stylistes

**Setup :**
1. Créer 2 comptes stylistes (Styliste A et Styliste B)
2. Chaque styliste crée son profil

**Test :**
1. Se connecter en tant que Styliste A
2. Tenter d'accéder au profil de Styliste B via :
   - API : `GET /api/styliste/profile` (devrait retourner uniquement le profil A)
   - Base de données directe : `SELECT * FROM stylistes WHERE user_id = 'B'` (devrait retourner 0 rows)

**Résultat attendu :**
- ✅ Styliste A voit uniquement son propre profil
- ✅ La requête vers le profil B retourne 404 ou vide
- ✅ RLS bloque au niveau base de données

---

### Test 2 : Isolation des clients

**Setup :**
1. Styliste A crée 3 clients : Client-A1, Client-A2, Client-A3
2. Styliste B crée 2 clients : Client-B1, Client-B2

**Test :**
1. Se connecter en tant que Styliste A
2. Récupérer la liste des clients : `GET /api/clients`
3. Vérifier que seuls Client-A1, Client-A2, Client-A3 sont retournés

4. Tenter d'accéder directement à un client de B :
   - API : `GET /api/clients/{client-B1-id}`
   - Devrait retourner 404

5. Tenter de modifier un client de B :
   - API : `PATCH /api/clients/{client-B1-id}`
   - Devrait retourner 404

6. Tenter de supprimer un client de B :
   - API : `DELETE /api/clients/{client-B1-id}`
   - Devrait retourner 404

**Résultat attendu :**
- ✅ Styliste A voit uniquement ses 3 clients
- ✅ Accès direct au client de B retourne 404
- ✅ Modification/suppression du client de B échouent
- ✅ RLS bloque toutes les tentatives

---

### Test 3 : Vérification SQL directe

**Test via SQL Editor (Supabase Dashboard) :**

```sql
-- Se connecter en tant que Styliste A (simuler auth.uid())
SET LOCAL "request.jwt.claim.sub" = 'user-id-styliste-a';

-- Tenter de récupérer les clients de tous les stylistes
SELECT * FROM clients;
-- Résultat attendu : uniquement les clients de Styliste A

-- Tenter de récupérer un client spécifique de Styliste B
SELECT * FROM clients WHERE id = 'client-b1-id';
-- Résultat attendu : 0 rows

-- Tenter de modifier un client de Styliste B
UPDATE clients SET name = 'Hacked' WHERE id = 'client-b1-id';
-- Résultat attendu : 0 rows updated (RLS bloque)

-- Tenter de supprimer un client de Styliste B
DELETE FROM clients WHERE id = 'client-b1-id';
-- Résultat attendu : 0 rows deleted (RLS bloque)
```

---

### Test 4 : Recherche cross-tenant

**Test :**
1. Styliste A crée un client nommé "Jean Dupont" (téléphone : +229 97 11 11 11)
2. Styliste B crée un client nommé "Jean Dupont" (téléphone : +229 97 22 22 22)

3. Se connecter en tant que Styliste A
4. Rechercher "Jean Dupont" : `GET /api/clients?q=Jean Dupont`

**Résultat attendu :**
- ✅ Seul le client de Styliste A est retourné
- ✅ Le client homonyme de Styliste B n'apparaît pas
- ✅ La recherche est isolée par styliste

---

## Procédure de test manuelle

### Étape 1 : Créer les comptes de test

```bash
# Terminal 1 - Navigateur A (Styliste A)
# Aller sur http://localhost:5177/signup
# Créer compte : styliste-a@test.com / Test123456

# Terminal 2 - Navigateur B (Styliste B) - mode incognito
# Aller sur http://localhost:5177/signup
# Créer compte : styliste-b@test.com / Test123456
```

### Étape 2 : Créer les profils

```bash
# Styliste A : Salon "Atelier A" / +229 97 11 11 11
# Styliste B : Salon "Atelier B" / +229 97 22 22 22
```

### Étape 3 : Créer des clients

```bash
# Styliste A crée :
# - Client A1 : "Alice Martin" / +229 97 11 11 01
# - Client A2 : "Bob Durand" / +229 97 11 11 02

# Styliste B crée :
# - Client B1 : "Charlie Dubois" / +229 97 22 22 01
# - Client B2 : "Diana Moreau" / +229 97 22 22 02
```

### Étape 4 : Récupérer les IDs des clients

```sql
-- Dans Supabase SQL Editor
SELECT id, name, styliste_id FROM clients ORDER BY created_at;
```

Copier l'ID de `Client B1` (exemple : `123e4567-e89b-12d3-a456-426614174000`)

### Étape 5 : Tenter l'accès cross-tenant

```bash
# En tant que Styliste A (navigateur A)
# Ouvrir DevTools > Console

# Tenter d'accéder au client de B
fetch('/api/clients/123e4567-e89b-12d3-a456-426614174000')
  .then(r => r.json())
  .then(console.log);

# Résultat attendu :
# { data: null, error: { message: "Client non trouvé" } }
```

### Étape 6 : Vérifier la liste

```bash
# En tant que Styliste A
# Aller sur /clients
# Vérifier que seuls Alice et Bob apparaissent
# Charlie et Diana ne doivent PAS être visibles
```

---

## Résultats attendus - Checklist

- [ ] Styliste A voit uniquement son profil
- [ ] Styliste B voit uniquement son profil
- [ ] Styliste A voit uniquement ses clients (Alice, Bob)
- [ ] Styliste B voit uniquement ses clients (Charlie, Diana)
- [ ] GET /api/clients/{client-de-B} retourne 404 pour Styliste A
- [ ] PATCH /api/clients/{client-de-B} retourne 404 pour Styliste A
- [ ] DELETE /api/clients/{client-de-B} retourne 404 pour Styliste A
- [ ] La recherche est isolée par styliste
- [ ] SQL direct confirme l'isolation RLS
- [ ] Aucune fuite de données cross-tenant

---

## En cas d'échec

Si un test échoue, vérifier :

1. **RLS activé ?**
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename IN ('stylistes', 'clients');
   ```

2. **Policies créées ?**
   ```sql
   SELECT schemaname, tablename, policyname
   FROM pg_policies
   WHERE tablename IN ('stylistes', 'clients');
   ```

3. **Auth.uid() valide ?**
   ```sql
   SELECT auth.uid();  -- Doit retourner l'UUID du user connecté
   ```

---

## Automatisation future

Pour CI/CD, créer un test Playwright :

```typescript
// tests/multi-tenant.spec.ts
test('Multi-tenant isolation', async ({ browser }) => {
  // Créer 2 contextes (2 stylistes)
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();

  // Signup, login, créer clients...
  // Vérifier isolation
});
```
