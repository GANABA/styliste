## ADDED Requirements

### Requirement: Styliste peut consulter son plan actuel et son usage
Le système SHALL afficher sur `/dashboard/subscription` le plan actuel du styliste, les limites du plan (clients, commandes actives, photos portfolio) et l'usage courant en temps réel.

#### Scenario: Affichage du plan actuel
- **WHEN** le styliste accède à `/dashboard/subscription`
- **THEN** le système affiche le nom du plan (ex. "Découverte"), la date de fin d'essai le cas échéant, et des jauges de progression pour chaque limite (clients X/20, commandes X/5, etc.)

#### Scenario: Badge essai gratuit
- **WHEN** le styliste est en période d'essai (trial) et que `subscription.trialEndsAt` est dans le futur
- **THEN** le système affiche un badge "Essai Pro — X jours restants" et une CTA pour upgrader

### Requirement: Styliste peut comparer les plans disponibles
Le système SHALL afficher un tableau comparatif de tous les plans (Découverte, Standard, Pro, Premium) avec leurs limites et prix.

#### Scenario: Tableau comparatif affiché
- **WHEN** le styliste consulte la page d'abonnement
- **THEN** le tableau affiche pour chaque plan : prix mensuel en FCFA, limite clients, limite commandes actives, portfolio (oui/non), notifications automatiques (oui/non), crédits SMS inclus

#### Scenario: Plan actuel mis en évidence
- **WHEN** le tableau comparatif est affiché
- **THEN** le plan actuel du styliste est mis en évidence visuellement (bordure colorée, badge "Votre plan")

### Requirement: Styliste peut simuler un upgrade de plan
Le système SHALL permettre au styliste de demander un upgrade de plan. Pour le MVP, l'upgrade est appliqué directement sans paiement réel.

#### Scenario: Upgrade vers un plan supérieur
- **WHEN** le styliste clique "Passer à Pro" depuis la page abonnement
- **THEN** le système affiche une modale de confirmation avec le nouveau prix, puis met à jour le plan immédiatement via `POST /api/subscriptions/upgrade`

#### Scenario: Tentative d'upgrade vers le plan actuel
- **WHEN** le styliste tente d'upgrader vers son plan actuel
- **THEN** le bouton "Choisir ce plan" est désactivé et affiche "Plan actuel"

### Requirement: Styliste peut simuler un downgrade de plan
Le système SHALL permettre au styliste de passer à un plan inférieur, sauf si son usage actuel dépasse les limites du nouveau plan.

#### Scenario: Downgrade bloqué si usage dépasse les limites
- **WHEN** le styliste tente de passer au plan Découverte (20 clients) alors qu'il a 35 clients actifs
- **THEN** le système affiche un message d'erreur listant les ressources à réduire avant de pouvoir downgrader

#### Scenario: Downgrade autorisé si usage dans les limites
- **WHEN** le styliste tente de downgrader et que son usage est dans les limites du nouveau plan
- **THEN** le système applique le downgrade et affiche un message de confirmation

### Requirement: Les limites de plan sont enforced dans toute l'application
Le système SHALL bloquer toute action dépassant les quotas du plan actuel et afficher un message clair avec CTA pour upgrader.

#### Scenario: Ajout client bloqué si limite atteinte
- **WHEN** le styliste tente de créer un nouveau client et que sa limite de clients est atteinte
- **THEN** le système retourne une erreur 403 avec le message "Limite de votre plan atteinte. Passez au plan Standard pour ajouter plus de clients." et un lien vers `/dashboard/subscription`

#### Scenario: Création commande bloquée si limite atteinte
- **WHEN** le styliste tente de créer une commande et qu'il a déjà atteint la limite de commandes actives de son plan
- **THEN** le système retourne une erreur 403 avec message et CTA upgrade

#### Scenario: Upload portfolio bloqué si plan insuffisant
- **WHEN** un styliste sur plan Découverte (sans portfolio) tente d'uploader une photo portfolio
- **THEN** le système retourne une erreur 403 indiquant que le portfolio est réservé aux plans Pro et Premium
