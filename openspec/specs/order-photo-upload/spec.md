## ADDED Requirements

### Requirement: Stylist can upload photos to an order
Le système SHALL permettre l'upload de photos liées à une commande. Chaque photo SHALL avoir un type parmi : `reference`, `fabric`, `fitting`, `finished`. Le nombre total de photos par commande SHALL être limité à 10. Chaque fichier SHALL être limité à 5 MB. Les formats acceptés sont JPEG, PNG, et WebP.

#### Scenario: Upload réussi d'une photo
- **WHEN** le styliste envoie un `POST /api/orders/:id/photos` avec un fichier image valide (≤ 5MB, JPEG/PNG/WebP) et un `photoType`
- **THEN** le système optimise l'image (WebP, max 1200px), génère un thumbnail (400px), stocke les deux sur R2, crée un enregistrement `OrderPhoto`, et retourne HTTP 201 avec `{ id, photoUrl, thumbnailUrl, photoType }`

#### Scenario: Upload refusé — fichier trop volumineux
- **WHEN** le styliste tente d'uploader un fichier de plus de 5 MB
- **THEN** le système retourne HTTP 413 avec `{ error: 'FILE_TOO_LARGE', maxSizeMB: 5 }`

#### Scenario: Upload refusé — format non supporté
- **WHEN** le styliste tente d'uploader un fichier PDF ou GIF
- **THEN** le système retourne HTTP 415 avec `{ error: 'UNSUPPORTED_FORMAT', accepted: ['image/jpeg', 'image/png', 'image/webp'] }`

#### Scenario: Upload refusé — limite de photos atteinte
- **WHEN** la commande contient déjà 10 photos et le styliste tente d'en ajouter une
- **THEN** le système retourne HTTP 422 avec `{ error: 'PHOTO_LIMIT_REACHED', limit: 10 }`

#### Scenario: Upload refusé — commande n'appartient pas au styliste
- **WHEN** le styliste tente d'uploader une photo sur une commande lui appartenant pas
- **THEN** le système retourne HTTP 404

---

### Requirement: Photos are optimized before storage
Le système SHALL automatiquement convertir toute image uploadée en WebP, la redimensionner à 1200px max (en conservant le ratio), et générer un thumbnail 400px. L'optimisation SHALL se faire côté serveur avant le stockage.

#### Scenario: Image JPEG convertie en WebP
- **WHEN** le styliste uploade une image JPEG de 3000x2000px
- **THEN** le système stocke une version WebP de 1200x800px et un thumbnail WebP de 400x267px

#### Scenario: Image déjà petite non agrandie
- **WHEN** le styliste uploade une image de 300x200px
- **THEN** le système stocke l'image à sa taille d'origine (pas d'agrandissement), avec un thumbnail à la même taille

---

### Requirement: Stylist can delete a photo
Le système SHALL permettre la suppression d'une photo spécifique. La suppression SHALL retirer le fichier du stockage R2 ET supprimer l'enregistrement `OrderPhoto` en base.

#### Scenario: Suppression réussie
- **WHEN** le styliste appelle `DELETE /api/orders/:orderId/photos/:photoId` sur une photo lui appartenant
- **THEN** le système supprime le fichier de R2 (photo + thumbnail), supprime l'enregistrement `OrderPhoto`, et retourne HTTP 204

#### Scenario: Suppression refusée — photo appartenant à un autre styliste
- **WHEN** le styliste tente de supprimer une photo appartenant à la commande d'un autre styliste
- **THEN** le système retourne HTTP 404

---

### Requirement: Photos are listed with order details
Le système SHALL inclure les photos d'une commande dans la réponse de `GET /api/orders/:id`, triées par `displayOrder` ASC puis `createdAt` ASC.

#### Scenario: Photos retournées avec le détail de la commande
- **WHEN** le styliste appelle `GET /api/orders/:id`
- **THEN** la réponse inclut un tableau `photos` avec `id`, `photoUrl`, `thumbnailUrl`, `photoType`, `caption`, `displayOrder` pour chaque photo

#### Scenario: Commande sans photo
- **WHEN** le styliste appelle `GET /api/orders/:id` sur une commande sans photo
- **THEN** la réponse inclut `photos: []`

---

### Requirement: Storage falls back to local filesystem in development
Le système SHALL utiliser le filesystem local (`public/uploads/`) pour stocker les photos lorsque les variables d'environnement R2 ne sont pas configurées, afin de permettre le développement sans compte Cloudflare.

#### Scenario: Fallback local en développement
- **WHEN** les variables `R2_ACCESS_KEY_ID` et `R2_BUCKET_NAME` sont absentes et qu'une photo est uploadée
- **THEN** le système stocke l'image dans `public/uploads/orders/:orderId/` et retourne une URL relative `/uploads/orders/:orderId/:filename.webp`
