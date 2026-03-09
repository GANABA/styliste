## ADDED Requirements

### Requirement: Public stylists directory is accessible
Le système SHALL exposer une page publique `/stylistes` listant les stylistes ayant au moins un item portfolio publié et un plan Pro ou Premium. La page SHALL être accessible sans authentification et SEO-optimisée.

#### Scenario: Consultation de l'annuaire
- **WHEN** un visiteur accède à `/stylistes`
- **THEN** la page affiche la liste des stylistes éligibles avec leur nom, ville, et un lien vers leur portfolio

#### Scenario: Annuaire vide
- **WHEN** aucun styliste n'a de portfolio publié
- **THEN** la page affiche un message "Aucun styliste disponible pour le moment"

#### Scenario: Page annuaire SEO-optimisée
- **WHEN** la page est rendue côté serveur
- **THEN** la page inclut des balises `<title>` et `<meta description>` décrivant l'annuaire

---

### Requirement: Visitor can search stylists by name or city
Le système SHALL permettre aux visiteurs de filtrer les stylistes de l'annuaire par nom (recherche textuelle) et/ou par ville.

#### Scenario: Recherche par nom
- **WHEN** un visiteur saisit "Monique" dans le champ de recherche
- **THEN** la liste se filtre pour ne montrer que les stylistes dont le nom contient "Monique"

#### Scenario: Recherche par ville
- **WHEN** un visiteur saisit "Cotonou" dans le filtre ville
- **THEN** la liste se filtre pour ne montrer que les stylistes de Cotonou

#### Scenario: Aucun résultat
- **WHEN** la recherche ne correspond à aucun styliste
- **THEN** la page affiche un message "Aucun styliste trouvé pour cette recherche"

---

### Requirement: Public stylists API returns only eligible stylists
Le système SHALL exposer `GET /api/stylists/public` retournant uniquement les stylistes ayant `portfolioItemCount >= 1` (publiés) et un plan Pro/Premium actif. Les données retournées SHALL inclure : slug, businessName/name, city, phone, et la première photo portfolio.

#### Scenario: Récupération des stylistes éligibles
- **WHEN** un client appelle `GET /api/stylists/public`
- **THEN** le système retourne la liste des stylistes éligibles avec leurs données publiques uniquement (pas d'email, pas de données sensibles)

#### Scenario: Données sensibles masquées
- **WHEN** l'API retourne les profils stylistes
- **THEN** les champs `email`, `userId`, et autres données internes ne sont PAS inclus dans la réponse

---

### Requirement: Visitor can access a stylist's public profile via slug
Le système SHALL exposer `GET /api/stylists/[slug]` retournant le profil public complet d'un styliste (nom, ville, phone, items portfolio publiés) pour le rendu de la page `/{stylistSlug}`.

#### Scenario: Profil public trouvé
- **WHEN** un client appelle `GET /api/stylists/monique-couture`
- **THEN** le système retourne le profil public avec les items portfolio `isPublished = true`

#### Scenario: Profil non trouvé
- **WHEN** le slug ne correspond à aucun styliste
- **THEN** le système retourne HTTP 404
