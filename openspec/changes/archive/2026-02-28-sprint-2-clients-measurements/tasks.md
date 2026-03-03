## 1. Database Schema & Migration

- [x] 1.1 Ajouter modèle `Client` dans `prisma/schema.prisma` (id, stylistId, name, phone, email, address, city, notes, timestamps, deletedAt)
- [x] 1.2 Ajouter modèle `MeasurementTemplate` dans schema Prisma (id, stylistId, name, fields JSON, timestamps, deletedAt)
- [x] 1.3 Ajouter modèle `ClientMeasurement` dans schema Prisma (id, clientId, templateId, measurements JSON, measuredAt, timestamps)
- [x] 1.4 Configurer relations Prisma : Client → Stylist (FK), MeasurementTemplate → Stylist (FK)
- [x] 1.5 Configurer relations Prisma : ClientMeasurement → Client (FK cascade), ClientMeasurement → MeasurementTemplate (FK restrict)
- [x] 1.6 Ajouter indexes sur `Client.stylistId`, `Client.name`, `Client.phone`
- [x] 1.7 Ajouter index composite sur `(stylistId, deletedAt)` pour filtres actifs/archivés
- [x] 1.8 Ajouter indexes sur `MeasurementTemplate.stylistId`
- [x] 1.9 Ajouter indexes sur `ClientMeasurement.clientId`, `ClientMeasurement.templateId`
- [x] 1.10 Ajouter index composite sur `(clientId, measuredAt DESC)` pour historique
- [x] 1.11 Exécuter migration Prisma : `npx prisma migrate dev --name add_clients_measurements_tables`
- [x] 1.12 Générer client Prisma : `npx prisma generate`
- [x] 1.13 Vérifier types TypeScript générés pour `Client`, `MeasurementTemplate`, `ClientMeasurement`

## 2. Validation Schemas with Zod

- [x] 2.1 Créer fichier `src/lib/validations/clients.ts`
- [x] 2.2 Définir `clientCreateSchema` Zod (name string min 2, phone string min 8, email optional email, address optional, city optional, notes optional)
- [x] 2.3 Définir `clientUpdateSchema` Zod (même que create)
- [x] 2.4 Exporter types `ClientCreateData`, `ClientUpdateData` depuis Zod
- [x] 2.5 Créer fichier `src/lib/validations/measurements.ts`
- [x] 2.6 Définir `templateFieldSchema` Zod (name string, label string, unit string, required boolean)
- [x] 2.7 Définir `templateCreateSchema` Zod (name string min 2, fields array of templateFieldSchema min 1)
- [x] 2.8 Définir `measurementCreateSchema` Zod (clientId UUID, templateId UUID, measurements object dynamic)
- [x] 2.9 Exporter types `TemplateCreateData`, `MeasurementCreateData`

## 3. API Routes - Clients CRUD

- [x] 3.1 Créer fichier `src/app/api/clients/route.ts`
- [x] 3.2 Implémenter GET /api/clients (liste avec pagination, recherche, filtre actifs/archivés)
- [x] 3.3 Ajouter query params : `page`, `limit` (default 50), `search`, `status` (active/archived)
- [x] 3.4 Filtrer par `stylistId` de la session (isolation multi-tenant)
- [x] 3.5 Implémenter recherche ILIKE sur `name` et `phone`
- [x] 3.6 Retourner pagination metadata : `total`, `page`, `totalPages`
- [x] 3.7 Implémenter POST /api/clients (création client)
- [x] 3.8 Valider body avec `clientCreateSchema` Zod
- [x] 3.9 Vérifier limite plan abonnement avant création (Free: 20, Standard: 100, Pro: illimité)
- [x] 3.10 Récupérer plan actuel du styliste depuis `subscriptions` table
- [x] 3.11 Compter clients actifs du styliste (`deletedAt IS NULL`)
- [x] 3.12 Retourner 403 si limite atteinte avec message explicite
- [x] 3.13 Créer client avec `stylistId` de la session
- [x] 3.14 Créer fichier `src/app/api/clients/[id]/route.ts`
- [x] 3.15 Implémenter GET /api/clients/[id] (détail client)
- [x] 3.16 Vérifier que `client.stylistId` correspond à la session (403 sinon)
- [x] 3.17 Implémenter PUT /api/clients/[id] (modification)
- [x] 3.18 Valider body avec `clientUpdateSchema`
- [x] 3.19 Vérifier ownership avant update
- [x] 3.20 Implémenter DELETE /api/clients/[id] (soft delete)
- [x] 3.21 Soft delete : SET `deletedAt = NOW()` au lieu de supprimer
- [x] 3.22 Vérifier ownership avant delete
- [x] 3.23 Ajouter middleware auth sur toutes routes `/api/clients/*`
- [x] 3.24 Retourner 401 si session non authentifiée

## 4. API Routes - Measurement Templates

- [x] 4.1 Créer fichier `src/app/api/measurement-templates/route.ts`
- [x] 4.2 Implémenter GET /api/measurement-templates (liste des templates du styliste)
- [x] 4.3 Filtrer par `stylistId` de la session
- [x] 4.4 Inclure compteur d'utilisation : count de `client_measurements` par template
- [x] 4.5 Implémenter POST /api/measurement-templates (création template)
- [x] 4.6 Valider body avec `templateCreateSchema`
- [x] 4.7 Créer template avec `stylistId` de la session
- [x] 4.8 Créer fichier `src/app/api/measurement-templates/[id]/route.ts`
- [x] 4.9 Implémenter GET /api/measurement-templates/[id] (détail template)
- [x] 4.10 Vérifier ownership (`template.stylistId`)
- [x] 4.11 Implémenter PUT /api/measurement-templates/[id] (modification)
- [x] 4.12 Valider body avec `templateCreateSchema`
- [x] 4.13 Vérifier ownership avant update
- [x] 4.14 Implémenter DELETE /api/measurement-templates/[id]
- [x] 4.15 Vérifier si template utilisé dans `client_measurements` (prevent delete si oui)
- [x] 4.16 Soft delete si utilisé, hard delete sinon
- [x] 4.17 Vérifier ownership avant delete

## 5. API Routes - Client Measurements

- [x] 5.1 Créer fichier `src/app/api/client-measurements/route.ts`
- [x] 5.2 Implémenter POST /api/client-measurements (enregistrer mesures)
- [x] 5.3 Valider body avec `measurementCreateSchema`
- [x] 5.4 Vérifier que `clientId` appartient au styliste connecté
- [x] 5.5 Vérifier que `templateId` appartient au styliste connecté
- [x] 5.6 Valider que `measurements` JSON correspond aux champs du template
- [x] 5.7 Créer nouveau record avec `measuredAt = NOW()`
- [x] 5.8 Créer fichier `src/app/api/client-measurements/[clientId]/route.ts`
- [x] 5.9 Implémenter GET /api/client-measurements/[clientId] (historique mesures)
- [x] 5.10 Vérifier ownership du client avant retour mesures
- [x] 5.11 Trier par `measuredAt DESC`
- [x] 5.12 Ajouter pagination si > 20 mesures (limit 20 par défaut)
- [x] 5.13 Inclure détails du template utilisé dans la réponse

## 6. Default Measurement Templates Seeding

- [x] 6.1 Créer fichier `src/lib/seeds/defaultTemplates.ts`
- [x] 6.2 Définir template "Homme" avec 6 champs (tour_poitrine, tour_taille, longueur_pantalon, tour_cou, longueur_manche, tour_hanche)
- [x] 6.3 Définir template "Femme" avec 6 champs (tour_poitrine, tour_taille, tour_hanche, longueur_robe, longueur_jupe, tour_bras)
- [x] 6.4 Définir template "Enfant" avec 4 champs (tour_poitrine, tour_taille, hauteur, longueur_pantalon)
- [x] 6.5 Tous champs en unité "cm" et required: true
- [x] 6.6 Créer fonction `seedDefaultTemplates(stylistId)` pour création lazy
- [x] 6.7 Implémenter logique : check si styliste a déjà templates, skip si oui
- [x] 6.8 Appeler `seedDefaultTemplates()` dans GET /api/measurement-templates si liste vide

## 7. Client List Page UI

- [x] 7.1 Créer fichier `src/app/dashboard/clients/page.tsx`
- [x] 7.2 Fetch clients avec React Query : `useQuery(['clients', page, search, status])`
- [x] 7.3 Implémenter barre de recherche avec input debounce 300ms
- [x] 7.4 Implémenter filtres : boutons radio "Actifs" / "Archivés"
- [x] 7.5 Afficher compteur "X/Y clients" selon plan (récupérer depuis session)
- [x] 7.6 Implémenter pagination avec composant Pagination shadcn/ui (ou custom)
- [x] 7.7 Afficher empty state si aucun client : "Créer mon premier client"
- [x] 7.8 Bouton "Nouveau client" en haut à droite
- [x] 7.9 Créer composant `ClientCard.tsx` pour affichage mobile
- [x] 7.10 Afficher nom, téléphone, ville, date dernière modif dans card
- [x] 7.11 Créer composant `ClientTable.tsx` pour affichage desktop
- [x] 7.12 Colonnes table : Nom, Téléphone, Email, Ville, Actions
- [x] 7.13 Implémenter responsive : Cards < 768px, Table ≥ 768px
- [x] 7.14 Ajouter skeleton loaders pendant chargement
- [x] 7.15 Actions sur chaque client : "Voir détails", "Modifier", "Archiver"

## 8. Client Create/Edit Form

- [x] 8.1 Créer fichier `src/components/clients/ClientForm.tsx`
- [x] 8.2 Utiliser React Hook Form avec Zod resolver (`clientCreateSchema`)
- [x] 8.3 Champs : Nom (required), Téléphone (required), Email (optional), Adresse (optional), Ville (optional), Notes (textarea optional)
- [x] 8.4 Utiliser composants shadcn/ui : Input, Label, Textarea, Button, Form
- [x] 8.5 Input type="tel" pour téléphone (clavier adapté mobile)
- [x] 8.6 Input type="email" pour email
- [x] 8.7 Validation côté client avec affichage erreurs
- [x] 8.8 Créer route `src/app/dashboard/clients/new/page.tsx`
- [x] 8.9 Utiliser ClientForm en mode "create"
- [x] 8.10 Mutation React Query : `useMutation POST /api/clients`
- [x] 8.11 Redirection vers `/dashboard/clients` après création réussie
- [x] 8.12 Toast success "Client créé avec succès"
- [ ] 8.13 Gérer erreur 403 limite atteinte : afficher modal upgrade plan
- [x] 8.14 Créer route `src/app/dashboard/clients/[id]/edit/page.tsx`
- [x] 8.15 Fetch client existant avec React Query
- [x] 8.16 Utiliser ClientForm en mode "edit" avec valeurs pré-remplies
- [x] 8.17 Mutation `useMutation PUT /api/clients/[id]`
- [x] 8.18 Redirection vers page détail après update

## 9. Client Detail Page

- [x] 9.1 Créer fichier `src/app/dashboard/clients/[id]/page.tsx`
- [x] 9.2 Fetch client avec React Query : `useQuery(['client', id])`
- [x] 9.3 Afficher toutes infos client : nom, téléphone, email, adresse, ville, notes
- [x] 9.4 Afficher dates : créé le, modifié le
- [x] 9.5 Boutons actions : "Modifier", "Archiver", "Prendre mesures"
- [x] 9.6 Section "Dernières mesures" avec display des dernières mesures si existantes
- [x] 9.7 Fetch dernières mesures : `useQuery(['latestMeasurements', clientId])`
- [x] 9.8 Bouton "Voir historique complet" si > 1 mesure
- [x] 9.9 Implémenter modal confirmation pour archivage
- [x] 9.10 Mutation `useMutation DELETE /api/clients/[id]`
- [x] 9.11 Redirection vers `/dashboard/clients` après archivage
- [x] 9.12 Toast "Client archivé avec succès"
- [x] 9.13 Gérer erreur 403/404 si client non trouvé ou pas autorisé

## 10. Measurement Templates Management UI

- [x] 10.1 Créer fichier `src/app/dashboard/clients/measurement-templates/page.tsx`
- [x] 10.2 Fetch templates avec React Query : `useQuery(['templates'])`
- [x] 10.3 Afficher liste des templates avec nom, nombre de champs, usage count
- [x] 10.4 Bouton "Nouveau template" en haut
- [x] 10.5 Actions : "Modifier", "Supprimer" (disabled si utilisé)
- [x] 10.6 Créer composant `TemplateForm.tsx`
- [x] 10.7 Champ "Nom du template" (required)
- [x] 10.8 Section dynamique "Champs de mesures" avec bouton "Ajouter un champ"
- [x] 10.9 Chaque champ : input Nom (ex: tour_poitrine), Label (ex: Tour de poitrine), Unité (select: cm/pouces), Obligatoire (checkbox)
- [x] 10.10 Bouton "Supprimer" sur chaque champ (minimum 1 champ requis)
- [x] 10.11 Validation Zod côté client
- [x] 10.12 Créer route `src/app/dashboard/clients/measurement-templates/new/page.tsx`
- [x] 10.13 Mutation `useMutation POST /api/measurement-templates`
- [x] 10.14 Redirection après création
- [x] 10.15 Créer route `src/app/dashboard/clients/measurement-templates/[id]/edit/page.tsx`
- [x] 10.16 Fetch template existant et pré-remplir form
- [x] 10.17 Mutation `useMutation PUT /api/measurement-templates/[id]`

## 11. Measurement Recording UI

- [x] 11.1 Créer fichier `src/components/measurements/MeasurementForm.tsx`
- [x] 11.2 Props : clientId, templateId (optional - si non fourni, afficher sélecteur)
- [x] 11.3 Si templateId non fourni : afficher select des templates du styliste
- [x] 11.4 Fetch template sélectionné pour récupérer champs
- [x] 11.5 Générer inputs dynamiques basés sur `template.fields` JSON
- [x] 11.6 Chaque champ : label + input number + unité affichée à droite
- [x] 11.7 Input type="number" step="0.1" pour mesures décimales
- [x] 11.8 Validation : champs requis doivent être remplis
- [x] 11.9 Validation : valeurs doivent être positives
- [x] 11.10 Bouton "Enregistrer mesures" fixe en bas sur mobile
- [x] 11.11 Créer modal/dialog pour afficher MeasurementForm depuis page détail client
- [x] 11.12 Trigger modal depuis bouton "Prendre mesures"
- [x] 11.13 Mutation `useMutation POST /api/client-measurements`
- [x] 11.14 Fermer modal et refresh data après succès
- [x] 11.15 Toast "Mesures enregistrées avec succès"

## 12. Measurement History UI

- [x] 12.1 Créer fichier `src/app/dashboard/clients/[id]/measurements/page.tsx`
- [x] 12.2 Fetch historique : `useQuery(['measurements', clientId])`
- [x] 12.3 Afficher liste chronologique (plus récent en haut)
- [x] 12.4 Chaque entrée : date de prise, template utilisé, badge "Actuel" pour dernière
- [x] 12.5 Click pour expand et voir détails (tous champs et valeurs)
- [x] 12.6 Créer composant `MeasurementHistoryItem.tsx` pour chaque entrée
- [x] 12.7 Affichage accordion ou collapse pour détails
- [ ] 12.8 Bouton "Comparer" pour sélectionner 2 mesures
- [x] 12.9 Implémenter pagination si > 20 mesures
- [x] 12.10 Empty state si aucune mesure

## 13. Measurement Comparison UI

- [ ] 13.1 Créer fichier `src/components/measurements/MeasurementComparison.tsx`
- [ ] 13.2 Props : measurement1, measurement2
- [ ] 13.3 Afficher les 2 mesures côte à côte (responsive : stack sur mobile)
- [ ] 13.4 Pour chaque champ : afficher valeur 1, valeur 2, différence (+/- X cm)
- [ ] 13.5 Highlight différences avec couleur (vert si diminution, rouge si augmentation)
- [ ] 13.6 Afficher dates de prise pour chaque mesure
- [ ] 13.7 Validation : mesures doivent utiliser le même template
- [ ] 13.8 Message d'erreur si templates différents
- [ ] 13.9 Intégrer dans modal/dialog depuis page historique
- [ ] 13.10 Bouton "Fermer" pour revenir à l'historique

## 14. Sidebar Navigation Update

- [x] 14.1 Modifier fichier `src/components/layout/Sidebar.tsx`
- [x] 14.2 Activer l'item "Clients" (retirer disabled: true)
- [x] 14.3 Configurer href: "/dashboard/clients"
- [x] 14.4 Vérifier icône Users de Lucide est bien importée
- [x] 14.5 Tester highlight route active sur `/dashboard/clients/*`

## 15. Subscription Plan Limits Helper

- [x] 15.1 Créer fichier `src/lib/helpers/subscription.ts`
- [x] 15.2 Définir constantes PLAN_LIMITS : Free: 20, Standard: 100, Pro: Infinity
- [x] 15.3 Créer fonction `getCurrentPlan(stylistId)` → retourne plan actuel
- [x] 15.4 Créer fonction `checkClientLimit(stylistId)` → retourne { canCreate: boolean, current: number, limit: number }
- [x] 15.5 Utiliser dans API POST /api/clients et dans UI pour afficher compteur

## 16. React Query Setup & Hooks

- [ ] 16.1 Créer fichier `src/hooks/useClients.ts`
- [ ] 16.2 Hook `useClients(page, search, status)` pour liste
- [ ] 16.3 Hook `useClient(id)` pour détail
- [ ] 16.4 Hook `useCreateClient()` mutation
- [ ] 16.5 Hook `useUpdateClient()` mutation
- [ ] 16.6 Hook `useArchiveClient()` mutation (soft delete)
- [ ] 16.7 Créer fichier `src/hooks/useTemplates.ts`
- [ ] 16.8 Hook `useTemplates()` pour liste
- [ ] 16.9 Hook `useCreateTemplate()` mutation
- [ ] 16.10 Hook `useUpdateTemplate()` mutation
- [ ] 16.11 Hook `useDeleteTemplate()` mutation
- [ ] 16.12 Créer fichier `src/hooks/useMeasurements.ts`
- [ ] 16.13 Hook `useMeasurementHistory(clientId)` pour historique
- [ ] 16.14 Hook `useLatestMeasurements(clientId)` pour dernières mesures
- [ ] 16.15 Hook `useCreateMeasurement()` mutation
- [ ] 16.16 Configurer invalidation queries appropriée après mutations

## 17. Type Definitions

- [ ] 17.1 Créer fichier `src/types/client.ts`
- [ ] 17.2 Exporter types `Client`, `ClientWithMeasurements` depuis Prisma
- [ ] 17.3 Créer fichier `src/types/measurement.ts`
- [ ] 17.4 Exporter types `MeasurementTemplate`, `ClientMeasurement`
- [ ] 17.5 Définir type `TemplateField` pour structure champs JSON
- [ ] 17.6 Définir type `MeasurementValues` pour valeurs JSON

## 18. Error Handling & Loading States

- [x] 18.1 Créer composant `ClientListSkeleton.tsx` pour loading state liste
- [x] 18.2 Créer composant `ClientDetailSkeleton.tsx` pour loading page détail
- [x] 18.3 Gérer erreurs API avec React Query `onError`
- [x] 18.4 Afficher toast erreur si mutation échoue
- [ ] 18.5 Gérer erreur 403 limite atteinte : modal "Passer au plan supérieur"
- [x] 18.6 Gérer erreur 404 client non trouvé : redirect `/dashboard/clients`
- [x] 18.7 Gérer erreur réseau : retry automatique React Query (3 fois)

## 19. Mobile Optimization

- [x] 19.1 Vérifier tous touch targets ≥ 44x44px (boutons, liens)
- [x] 19.2 Tester formulaires sur mobile : clavier adapté (tel, email, number)
- [x] 19.3 Tester cards responsive sur 375px (iPhone SE)
- [x] 19.4 Tester table → cards breakpoint 768px
- [x] 19.5 Vérifier sidebar ferme automatiquement après navigation sur mobile
- [x] 19.6 Tester modals/dialogs responsives
- [x] 19.7 Optimiser images si présentes (WebP, lazy loading)

## 20. Testing - API Routes

- [x] 20.1 Tester POST /api/clients avec données valides (201 créé)
- [x] 20.2 Tester POST /api/clients sans nom (400 erreur validation)
- [x] 20.3 Tester POST /api/clients avec limite atteinte (403 forbidden)
- [x] 20.4 Tester GET /api/clients avec pagination (retourne 50 max)
- [x] 20.5 Tester GET /api/clients avec recherche par nom
- [x] 20.6 Tester GET /api/clients avec recherche par téléphone
- [x] 20.7 Tester GET /api/clients filtre actifs vs archivés
- [x] 20.8 Tester GET /api/clients/[id] avec ID valide
- [x] 20.9 Tester GET /api/clients/[id] avec ID autre styliste (403)
- [x] 20.10 Tester PUT /api/clients/[id] modification réussie
- [x] 20.11 Tester DELETE /api/clients/[id] soft delete
- [x] 20.12 Vérifier `deletedAt` rempli après delete
- [x] 20.13 Tester POST /api/measurement-templates création
- [x] 20.14 Tester GET /api/measurement-templates liste
- [x] 20.15 Tester POST /api/client-measurements enregistrement
- [x] 20.16 Tester GET /api/client-measurements/[clientId] historique

## 21. Testing - UI Flows

- [x] 21.1 Tester flow complet : créer client → afficher dans liste
- [x] 21.2 Tester recherche client par nom
- [x] 21.3 Tester filtre archivés
- [x] 21.4 Tester modification client
- [x] 21.5 Tester archivage client → disparaît de liste active
- [x] 21.6 Tester restauration client archivé
- [x] 21.7 Tester création template de mesures
- [x] 21.8 Tester modification template
- [x] 21.9 Tester suppression template non utilisé
- [x] 21.10 Tester blocage suppression template utilisé
- [x] 21.11 Tester enregistrement mesures avec template
- [x] 21.12 Tester affichage historique mesures
- [ ] 21.13 Tester comparaison de 2 mesures
- [x] 21.14 Tester limite clients plan Free (bloquer au 21ème)
- [x] 21.15 Tester compteur "X/20 clients" affiché

## 22. Testing - Multi-tenant Isolation

- [x] 22.1 Créer 2 comptes stylistes test différents
- [x] 22.2 Styliste A crée client → vérifier styliste B ne le voit pas
- [x] 22.3 Styliste B tente d'accéder URL client de A (403 ou 404)
- [x] 22.4 Vérifier isolation templates entre stylistes
- [x] 22.5 Vérifier isolation mesures via clientId

## 23. Testing - Default Templates Seeding

- [x] 23.1 Créer nouveau compte styliste
- [x] 23.2 Accéder page templates → vérifier 3 templates créés automatiquement
- [x] 23.3 Vérifier template "Homme" a 6 champs corrects
- [x] 23.4 Vérifier template "Femme" a 6 champs corrects
- [x] 23.5 Vérifier template "Enfant" a 4 champs corrects
- [x] 23.6 Vérifier tous champs en unité "cm"
- [x] 23.7 Créer un template custom → refresh page → vérifier pas de duplication defaults

## 24. Testing - Performance & Mobile

- [ ] 24.1 Tester chargement liste 100 clients (pagination fonctionne)
- [x] 24.2 Tester recherche debounce (pas de requête à chaque caractère)
- [x] 24.3 Tester sur connexion throttled 3G (Chrome DevTools)
- [x] 24.4 Vérifier skeleton loaders s'affichent
- [x] 24.5 Tester responsive sur 375px (iPhone SE)
- [x] 24.6 Tester responsive sur 768px (iPad)
- [x] 24.7 Tester responsive sur 1024px (desktop)
- [x] 24.8 Vérifier clavier numérique sur input mesures mobile

## 25. Documentation & Cleanup

- [ ] 25.1 Ajouter commentaires JSDoc sur fonctions API importantes
- [ ] 25.2 Documenter structure JSON `template.fields` dans README technique
- [ ] 25.3 Documenter structure JSON `measurements` dans README technique
- [ ] 25.4 Nettoyer console.logs de debug
- [x] 25.5 Exécuter `npm run lint` et corriger warnings
- [x] 25.6 Exécuter `npm run type-check` et corriger erreurs TypeScript
- [ ] 25.7 Vérifier aucun TODO/FIXME non résolu dans le code

## 26. Git & Deployment

- [x] 26.1 Commit migration Prisma : "feat(db): add clients and measurements tables"
- [x] 26.2 Commit API routes : "feat(api): add clients and measurements endpoints"
- [x] 26.3 Commit UI components : "feat(ui): add client management interface"
- [x] 26.4 Commit measurements UI : "feat(ui): add measurement system"
- [x] 26.5 Tester build local : `npm run build`
- [x] 26.6 Vérifier aucune erreur de build
- [x] 26.7 Push vers GitHub
- [ ] 26.8 Vérifier déploiement Vercel automatique
- [ ] 26.9 Vérifier migration appliquée sur DB production (Neon)
- [ ] 26.10 Tester app déployée sur Vercel : créer client, templates, mesures

## 27. Sprint 2 Validation

- [x] 27.1 ✅ User peut créer un client avec nom et téléphone
- [x] 27.2 ✅ User peut voir liste de ses clients paginée
- [x] 27.3 ✅ User peut rechercher clients par nom ou téléphone
- [x] 27.4 ✅ User peut modifier un client
- [x] 27.5 ✅ User peut archiver et restaurer un client
- [x] 27.6 ✅ User bloqué si dépasse limite plan (Free: 20, Standard: 100)
- [x] 27.7 ✅ User voit compteur "X/Y clients" selon son plan
- [x] 27.8 ✅ User obtient 3 templates par défaut au premier accès
- [x] 27.9 ✅ User peut créer template custom avec champs dynamiques
- [x] 27.10 ✅ User peut enregistrer mesures d'un client
- [x] 27.11 ✅ User peut voir historique complet des mesures
- [ ] 27.12 ✅ User peut comparer 2 prises de mesures
- [x] 27.13 ✅ Mesures versionnées (nouveau record à chaque prise)
- [x] 27.14 ✅ Menu "Clients" activé dans sidebar
- [x] 27.15 ✅ Interface responsive mobile-first (cards/table)
- [x] 27.16 ✅ Isolation multi-tenant stricte (aucun leak de données)
- [ ] 27.17 ✅ Performance acceptable sur 3G (< 3s chargement)
