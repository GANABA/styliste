## ADDED Requirements

### Requirement: Vue planning des commandes par date
Le système SHALL afficher toutes les commandes non livrées du styliste triées par date promise croissante, groupées par semaine.

#### Scenario: Affichage du planning
- **WHEN** le styliste accède à `/dashboard/calendar`
- **THEN** il voit ses commandes actives (statuts QUOTE, IN_PROGRESS, READY) groupées par semaine, triées par `promised_date` croissant

#### Scenario: Aucune commande active
- **WHEN** le styliste n'a aucune commande non livrée
- **THEN** la page affiche un message "Aucune commande à planifier"

### Requirement: Code couleur par statut dans le planning
Le système SHALL appliquer un code couleur visuel à chaque commande dans le planning selon son statut.

#### Scenario: Commande en retard
- **WHEN** la `promised_date` d'une commande est antérieure à la date du jour et le statut n'est pas DELIVERED
- **THEN** la commande est affichée avec un indicateur visuel rouge "En retard"

#### Scenario: Commande prête à livrer
- **WHEN** le statut de la commande est READY
- **THEN** la commande est affichée avec un indicateur vert "Prête"

#### Scenario: Commande en cours
- **WHEN** le statut est IN_PROGRESS
- **THEN** la commande est affichée avec un indicateur bleu

#### Scenario: Commande au stade devis
- **WHEN** le statut est QUOTE
- **THEN** la commande est affichée avec un indicateur gris

### Requirement: Alerte retards dans le planning
Le système SHALL afficher un résumé du nombre de commandes en retard en haut de la page planning.

#### Scenario: Présence de retards
- **WHEN** au moins une commande a sa `promised_date` dépassée et n'est pas livrée
- **THEN** un bandeau d'alerte affiche "X commande(s) en retard" avec un lien vers les commandes concernées

### Requirement: Navigation rapide vers la commande depuis le planning
Le système SHALL permettre au styliste de naviguer vers la fiche détail d'une commande directement depuis le planning.

#### Scenario: Clic sur une commande dans le planning
- **WHEN** le styliste clique sur une commande dans la vue planning
- **THEN** il est redirigé vers `/dashboard/orders/[id]`
