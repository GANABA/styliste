## MODIFIED Requirements

### Requirement: Session utilisateur inclut le rôle et le statut de suspension
La session NextAuth SHALL inclure le champ `role` (valeurs : `USER`, `ADMIN`) et le champ `suspended` (boolean) provenant du modèle `User`. Le middleware SHALL utiliser ces valeurs pour protéger les routes `/admin/*`.

#### Scenario: Session admin retourne le rôle ADMIN
- **WHEN** un utilisateur avec `user.role = "ADMIN"` se connecte
- **THEN** `session.user.role` vaut `"ADMIN"` et est accessible côté serveur et dans les composants Next.js

#### Scenario: Session standard retourne le rôle USER
- **WHEN** un utilisateur avec `user.role = "USER"` se connecte
- **THEN** `session.user.role` vaut `"USER"`

#### Scenario: Connexion refusée pour un compte suspendu
- **WHEN** un utilisateur dont `user.suspended = true` tente de se connecter
- **THEN** NextAuth retourne une erreur d'authentification et la session n'est pas créée
