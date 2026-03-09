## ADDED Requirements

### Requirement: Stylist can upload portfolio items
Le système SHALL permettre à un styliste authentifié (plan Pro ou Premium) d'uploader des photos de créations dans son portfolio. Chaque item SHALL contenir : imageUrl, title, description (optionnel), tags (optionnel), clientConsent (booléen), isPublished (booléen). Le styliste SHALL pouvoir uploader jusqu'à 50 items portfolio.

#### Scenario: Upload réussi d'un item portfolio
- **WHEN** le styliste Pro soumet une image valide avec un titre
- **THEN** le système crée un `PortfolioItem` avec `isPublished = false` par défaut, retourne HTTP 201 avec l'objet créé

#### Scenario: Upload bloqué — plan insuffisant
- **WHEN** un styliste Free ou Standard tente d'uploader un item portfolio
- **THEN** le système retourne HTTP 403 avec `{ error: 'PLAN_UPGRADE_REQUIRED', requiredPlan: 'PRO' }`

#### Scenario: Upload bloqué — limite 50 items atteinte
- **WHEN** le styliste a déjà 50 items portfolio et tente d'en ajouter un
- **THEN** le système retourne HTTP 422 avec `{ error: 'PORTFOLIO_LIMIT_REACHED', limit: 50 }`

---

### Requirement: Stylist can manage portfolio items
Le système SHALL permettre au styliste de modifier (titre, description, tags, clientConsent, isPublished) et supprimer ses items portfolio.

#### Scenario: Activation/désactivation d'un item
- **WHEN** le styliste appelle `PATCH /api/portfolio/[id]` avec `{ isPublished: true }`
- **THEN** le système met à jour `isPublished` et retourne HTTP 200 avec l'item mis à jour

#### Scenario: Suppression d'un item
- **WHEN** le styliste appelle `DELETE /api/portfolio/[id]`
- **THEN** le système supprime l'item et son fichier du stockage, retourne HTTP 204

#### Scenario: Accès refusé à l'item d'un autre styliste
- **WHEN** un styliste tente de modifier ou supprimer un item appartenant à un autre styliste
- **THEN** le système retourne HTTP 404

---

### Requirement: Stylist has a public portfolio page
Le système SHALL exposer une page publique accessible sans authentification à l'URL `/{stylistSlug}` affichant la galerie des items portfolio publiés du styliste, son nom/ville, et des boutons de contact (appel, WhatsApp).

#### Scenario: Consultation du portfolio public
- **WHEN** un visiteur accède à `/{stylistSlug}` d'un styliste avec des items publiés
- **THEN** la page affiche la galerie des items `isPublished = true`, le nom du styliste, sa ville, et les boutons de contact

#### Scenario: Portfolio non trouvé
- **WHEN** un visiteur accède à `/{slug}` qui ne correspond à aucun styliste
- **THEN** la page retourne HTTP 404

#### Scenario: Portfolio sans items publiés
- **WHEN** un styliste a un slug mais aucun item `isPublished = true`
- **THEN** la page affiche le profil du styliste avec un message "Aucune création publiée pour le moment"

#### Scenario: Page portfolio SEO-optimisée
- **WHEN** la page portfolio est rendue côté serveur
- **THEN** la page inclut des balises `<title>` et `<meta description>` avec le nom du styliste et sa ville

---

### Requirement: Stylist slug is unique and URL-safe
Le système SHALL générer automatiquement un `slug` unique et URL-safe pour chaque styliste au moment de l'inscription, basé sur `businessName` ou `user.name`. Le slug SHALL être modifiable par le styliste dans ses paramètres.

#### Scenario: Génération automatique du slug à l'inscription
- **WHEN** un nouveau styliste s'inscrit avec `businessName = "Monique Couture"`
- **THEN** le système génère `slug = "monique-couture"` (normalisé kebab-case ASCII)

#### Scenario: Collision de slug
- **WHEN** le slug généré existe déjà en base (`monique-couture`)
- **THEN** le système ajoute un suffixe numérique : `monique-couture-2`
