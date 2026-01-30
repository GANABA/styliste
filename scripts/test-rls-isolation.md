# Test d'isolation multi-tenant (RLS)

## Objectif
Vérifier que les policies RLS empêchent un styliste d'accéder aux données d'un autre styliste.

## Prérequis
- Base de données Supabase configurée avec les migrations appliquées
- Serveur de développement démarré (`npm run dev`)

## Scénario de test

### Étape 1: Créer deux comptes stylistes

**Styliste A**
1. Aller sur http://localhost:5173/signup
2. S'inscrire avec:
   - Email: `styliste-a@test.com`
   - Password: `Test1234!`
3. Créer le profil:
   - Nom du salon: "Salon A"
   - Téléphone: "+22990000001"

**Styliste B**
1. Se déconnecter
2. Aller sur http://localhost:5173/signup
3. S'inscrire avec:
   - Email: `styliste-b@test.com`
   - Password: `Test1234!`
4. Créer le profil:
   - Nom du salon: "Salon B"
   - Téléphone: "+22990000002"

### Étape 2: Créer des clients pour chaque styliste

**Styliste A**
1. Se connecter avec styliste-a@test.com
2. Créer un client:
   - Nom: "Client A1"
   - Téléphone: "+22990000101"
3. Noter l'ID du client dans l'URL (ex: `/clients/123e4567-e89b-12d3-a456-426614174000`)

**Styliste B**
1. Se connecter avec styliste-b@test.com
2. Créer un client:
   - Nom: "Client B1"
   - Téléphone: "+22990000201"
3. Noter l'ID du client

### Étape 3: Tester l'isolation (tentative d'accès croisé)

**Test 1: Styliste A tente d'accéder au client de Styliste B**
1. Connecté en tant que Styliste A
2. Essayer d'accéder à l'URL du client de B: `http://localhost:5173/clients/[ID_CLIENT_B]`
3. ✅ **Résultat attendu:** Erreur 404 ou "Client non trouvé"

**Test 2: Styliste B tente d'accéder au client de Styliste A**
1. Connecté en tant que Styliste B
2. Essayer d'accéder à l'URL du client de A: `http://localhost:5173/clients/[ID_CLIENT_A]`
3. ✅ **Résultat attendu:** Erreur 404 ou "Client non trouvé"

**Test 3: Vérifier la liste des clients**
1. Connecté en tant que Styliste A
2. Aller sur `/clients`
3. ✅ **Résultat attendu:** Voir uniquement "Client A1"

4. Se connecter en tant que Styliste B
5. Aller sur `/clients`
6. ✅ **Résultat attendu:** Voir uniquement "Client B1"

### Étape 4: Tester via l'API directement

Ouvrir la console développeur (F12) et exécuter:

**En tant que Styliste A:**
```javascript
// Tenter de récupérer le client de B via l'API
const clientBId = '[ID_CLIENT_B]';
const response = await fetch(`/api/clients/${clientBId}`);
const data = await response.json();
console.log(data);
// ✅ Résultat attendu: { data: null, error: { code: "NOT_FOUND", message: "Client non trouvé" } }
```

**En tant que Styliste B:**
```javascript
// Tenter de récupérer tous les clients (devrait retourner uniquement ceux de B)
const response = await fetch('/api/clients');
const data = await response.json();
console.log(data);
// ✅ Résultat attendu: { data: [{ name: "Client B1", ... }], error: null }
// Ne doit PAS contenir "Client A1"
```

## Critères de succès

- ✅ Un styliste ne peut voir que ses propres clients dans la liste
- ✅ Un styliste ne peut pas accéder aux détails d'un client d'un autre styliste
- ✅ Un styliste ne peut pas modifier ou supprimer un client d'un autre styliste
- ✅ Les requêtes API directes respectent l'isolation (pas de contournement)
- ✅ Aucune erreur SQL ou permission denied visible (gestion propre côté application)

## Note
L'isolation est garantie au niveau de PostgreSQL via Row Level Security (RLS). Même si le code frontend/backend contient un bug, la base de données empêchera l'accès aux données d'un autre styliste.
