## ADDED Requirements

### Requirement: Wizard d'onboarding affiché au premier login
Le système SHALL rediriger les nouveaux stylistes (dont `onboardingCompleted = false`) vers `/onboarding` après leur première connexion.

#### Scenario: Redirection au premier login
- **WHEN** un styliste se connecte pour la première fois et que `stylist.onboardingCompleted = false`
- **THEN** le système redirige vers `/onboarding` au lieu du dashboard

#### Scenario: Onboarding ignoré si déjà complété
- **WHEN** un styliste dont `onboardingCompleted = true` se connecte
- **THEN** le système redirige directement vers `/dashboard` sans passer par `/onboarding`

### Requirement: Checklist d'onboarding 4 étapes
Le système SHALL afficher une checklist guidée avec 4 étapes à compléter : (1) Compléter le profil, (2) Ajouter un premier client, (3) Créer une première commande, (4) Configurer le portfolio.

#### Scenario: Progression de la checklist
- **WHEN** le styliste complete une étape (ex. ajoute son premier client)
- **THEN** l'étape correspondante est cochée automatiquement dans la checklist et la progression (X/4) est mise à jour

#### Scenario: Complétion de l'onboarding
- **WHEN** le styliste complète les 4 étapes
- **THEN** le système marque `onboardingCompleted = true` via `PATCH /api/stylists/me/onboarding`, affiche un message de félicitation et redirige vers `/dashboard`

#### Scenario: Possibilité de sauter l'onboarding
- **WHEN** le styliste clique "Passer pour l'instant"
- **THEN** le système marque `onboardingCompleted = true` et redirige vers `/dashboard` (l'onboarding ne sera plus affiché)

### Requirement: Page d'aide et FAQ accessible depuis toutes les pages
Le système SHALL fournir une page `/help` avec une FAQ catégorisée et un lien de contact support.

#### Scenario: Accès à la FAQ
- **WHEN** le styliste clique sur le lien "Aide" dans la navigation
- **THEN** le système affiche la page `/help` avec des questions/réponses organisées par catégorie (Compte, Clients, Commandes, Paiements, Portfolio)

#### Scenario: Lien de contact support
- **WHEN** le styliste ne trouve pas de réponse dans la FAQ
- **THEN** la page affiche un bouton "Contacter le support via WhatsApp" avec le numéro de support configuré
