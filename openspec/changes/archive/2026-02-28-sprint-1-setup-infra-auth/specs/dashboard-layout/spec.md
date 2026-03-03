## Purpose

Layout de base du dashboard styliste avec navigation responsive, sidebar, header, et structure de l'interface utilisateur optimisée mobile-first pour Styliste.com.

## ADDED Requirements

### Requirement: Dashboard layout structure
Le système SHALL fournir un layout dashboard persistant avec sidebar, header, et zone de contenu principale.

#### Scenario: Dashboard layout file exists
- **WHEN** le dashboard est configuré
- **THEN** le fichier `app/dashboard/layout.tsx` MUST exister avec la structure du layout

#### Scenario: Layout includes sidebar
- **WHEN** le dashboard layout est rendu
- **THEN** il MUST inclure un composant Sidebar pour la navigation

#### Scenario: Layout includes header
- **WHEN** le dashboard layout est rendu
- **THEN** il MUST inclure un composant Header avec user menu

#### Scenario: Layout includes main content area
- **WHEN** le dashboard layout est rendu
- **THEN** il MUST inclure une zone de contenu principale où les pages enfants sont rendues

#### Scenario: Layout persists across navigation
- **WHEN** l'utilisateur navigue entre les pages du dashboard
- **THEN** le layout (sidebar + header) MUST rester monté sans re-render

### Requirement: Sidebar navigation component
Le système SHALL fournir un sidebar avec navigation vers les sections principales du dashboard.

#### Scenario: Sidebar component created
- **WHEN** le composant est créé
- **THEN** le fichier `components/layout/Sidebar.tsx` MUST exister

#### Scenario: Sidebar navigation items for Sprint 1
- **WHEN** le sidebar est rendu
- **THEN** il MUST afficher les items de navigation: Dashboard (home), Clients (disabled), Commandes (disabled), Calendrier (disabled), Paramètres (disabled)

#### Scenario: Active navigation item highlighted
- **WHEN** l'utilisateur est sur une page spécifique
- **THEN** l'item de navigation correspondant MUST être visuellement mis en évidence

#### Scenario: Navigation items with icons
- **WHEN** les items de navigation sont affichés
- **THEN** chaque item MUST avoir une icône Lucide associée (LayoutDashboard, Users, ShoppingBag, Calendar, Settings)

#### Scenario: Sidebar logo/brand
- **WHEN** le sidebar est rendu
- **THEN** il MUST afficher le logo ou nom "Styliste.com" en haut

### Requirement: Responsive sidebar behavior
Le système SHALL adapter le comportement du sidebar selon la taille d'écran (mobile-first).

#### Scenario: Mobile sidebar as drawer
- **WHEN** l'écran est en mode mobile (< 768px)
- **THEN** le sidebar MUST être caché par défaut et ouvert via un drawer overlay

#### Scenario: Mobile menu toggle button
- **WHEN** l'écran est en mode mobile
- **THEN** un bouton menu hamburger MUST être visible dans le header pour ouvrir le sidebar

#### Scenario: Desktop sidebar always visible
- **WHEN** l'écran est en mode desktop (≥ 768px)
- **THEN** le sidebar MUST être visible en permanence sur le côté gauche

#### Scenario: Sidebar close on mobile navigation
- **WHEN** l'utilisateur clique sur un lien de navigation sur mobile
- **THEN** le sidebar drawer MUST se fermer automatiquement

#### Scenario: Sidebar overlay on mobile
- **WHEN** le sidebar drawer est ouvert sur mobile
- **THEN** un overlay semi-transparent MUST couvrir le reste de l'écran

#### Scenario: Sidebar width responsive
- **WHEN** le sidebar est affiché
- **THEN** sa largeur MUST être 280px sur desktop et 100% sur mobile

### Requirement: Header component
Le système SHALL fournir un header avec menu utilisateur, breadcrumbs, et actions rapides.

#### Scenario: Header component created
- **WHEN** le composant est créé
- **THEN** le fichier `components/layout/Header.tsx` MUST exister

#### Scenario: User menu in header
- **WHEN** le header est rendu
- **THEN** il MUST afficher un avatar/menu utilisateur avec le nom de l'utilisateur connecté

#### Scenario: User menu dropdown
- **WHEN** l'utilisateur clique sur son avatar dans le header
- **THEN** un dropdown menu MUST s'ouvrir avec les options: Mon profil, Abonnement, Se déconnecter

#### Scenario: Logout from user menu
- **WHEN** l'utilisateur clique sur "Se déconnecter"
- **THEN** le système MUST appeler la fonction de logout NextAuth

#### Scenario: Header mobile menu toggle
- **WHEN** l'écran est en mode mobile
- **THEN** le header MUST afficher le bouton menu hamburger pour ouvrir le sidebar

#### Scenario: Header styling mobile-first
- **WHEN** le header est rendu sur mobile
- **THEN** il MUST avoir un padding réduit et occuper toute la largeur

### Requirement: Dashboard home page placeholder
Le système SHALL fournir une page d'accueil dashboard basique comme point d'entrée après login.

#### Scenario: Dashboard home page exists
- **WHEN** le dashboard est configuré
- **THEN** le fichier `app/dashboard/page.tsx` MUST exister

#### Scenario: Dashboard home displays welcome message
- **WHEN** l'utilisateur accède à `/dashboard`
- **THEN** la page MUST afficher un message de bienvenue avec le nom de l'utilisateur

#### Scenario: Dashboard home placeholder content
- **WHEN** la page dashboard home est rendue
- **THEN** elle MUST afficher un message indiquant que les statistiques et fonctionnalités arrivent dans les prochains sprints

#### Scenario: Dashboard home shows user info
- **WHEN** la page dashboard home est rendue
- **THEN** elle MUST afficher les informations de base de l'utilisateur connecté (nom, email, rôle)

### Requirement: Navigation component utilities
Le système SHALL fournir des composants et utilitaires pour faciliter la navigation dans le dashboard.

#### Scenario: Navigation component created
- **WHEN** le composant est créé
- **THEN** le fichier `components/layout/Navigation.tsx` MUST exister avec la liste des routes dashboard

#### Scenario: Navigation routes configuration
- **WHEN** la navigation est configurée
- **THEN** elle MUST définir les routes: { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }, etc.

#### Scenario: Active route detection
- **WHEN** le composant Navigation détecte la route active
- **THEN** il MUST utiliser `usePathname()` de Next.js pour identifier la route courante

### Requirement: Mobile-first touch targets
Le système SHALL respecter les guidelines mobile-first avec des touch targets suffisamment grands.

#### Scenario: Navigation items touch target size
- **WHEN** les items de navigation sont rendus
- **THEN** leur hauteur MUST être au minimum 44px pour être facilement cliquables au doigt

#### Scenario: User menu button touch target size
- **WHEN** le bouton user menu est rendu
- **THEN** sa taille MUST être au minimum 44x44px

#### Scenario: Menu hamburger button size
- **WHEN** le bouton menu hamburger est rendu sur mobile
- **THEN** sa taille MUST être au minimum 44x44px

### Requirement: Light theme styling
Le système SHALL utiliser uniquement le thème clair pour le MVP (dark mode exclus).

#### Scenario: Light theme colors applied
- **WHEN** le dashboard est rendu
- **THEN** il MUST utiliser les couleurs du thème clair (background blanc/gris clair, text noir/gris foncé)

#### Scenario: No dark mode toggle
- **WHEN** le dashboard est rendu
- **THEN** aucun bouton de toggle dark/light mode NE DOIT être présent

#### Scenario: Consistent color palette
- **WHEN** les composants du dashboard sont rendus
- **THEN** ils MUST utiliser les couleurs cohérentes du design system shadcn/ui (primary, secondary, muted, etc.)

### Requirement: Sidebar collapse functionality
Le système SHALL permettre de réduire le sidebar sur desktop pour maximiser l'espace de contenu (future enhancement, structure préparée).

#### Scenario: Sidebar state management
- **WHEN** le sidebar est initialisé
- **THEN** un store Zustand MUST gérer l'état collapsed/expanded (préparation pour future feature)

#### Scenario: Sidebar default state
- **WHEN** le dashboard est chargé pour la première fois
- **THEN** le sidebar MUST être en état "expanded" par défaut sur desktop

### Requirement: Loading states for navigation
Le système SHALL afficher des états de chargement lors de la navigation entre pages dashboard.

#### Scenario: Navigation loading indicator
- **WHEN** l'utilisateur clique sur un lien de navigation
- **THEN** un indicateur de chargement visuel MUST apparaître pendant la transition

#### Scenario: Skeleton loading for dashboard home
- **WHEN** la page dashboard home charge
- **THEN** elle PEUT afficher un skeleton placeholder avant le contenu réel

### Requirement: Accessibility for navigation
Le système SHALL respecter les standards d'accessibilité ARIA pour la navigation.

#### Scenario: Semantic HTML nav element
- **WHEN** la navigation est rendue
- **THEN** elle MUST utiliser l'élément HTML `<nav>` sémantique

#### Scenario: ARIA labels on navigation items
- **WHEN** les items de navigation sont rendus
- **THEN** ils MUST avoir des attributs `aria-label` descriptifs

#### Scenario: Keyboard navigation support
- **WHEN** l'utilisateur navigue au clavier
- **THEN** il MUST pouvoir naviguer entre les items avec Tab et activer avec Enter/Space

#### Scenario: Focus visible on navigation items
- **WHEN** un item de navigation reçoit le focus clavier
- **THEN** il MUST avoir un outline visible (ring-2)

### Requirement: User avatar component
Le système SHALL afficher un avatar utilisateur dans le header avec initiales ou photo de profil.

#### Scenario: Avatar component created
- **WHEN** le composant avatar est créé
- **THEN** il MUST utiliser le composant `Avatar` de shadcn/ui

#### Scenario: Avatar displays user initials
- **WHEN** l'utilisateur n'a pas de photo de profil
- **THEN** l'avatar MUST afficher les initiales du nom (ex: "John Doe" → "JD")

#### Scenario: Avatar displays profile picture
- **WHEN** l'utilisateur a une photo de profil
- **THEN** l'avatar MUST afficher l'image avec fallback sur initiales

#### Scenario: Avatar with fallback color
- **WHEN** l'avatar est rendu
- **THEN** il MUST avoir une couleur de fond distinctive (basée sur hash du user ID)

### Requirement: Breadcrumbs navigation
Le système SHALL afficher des breadcrumbs dans le header pour indiquer la position dans la hiérarchie (préparation pour sprints futurs).

#### Scenario: Breadcrumbs component placeholder
- **WHEN** le header est créé
- **THEN** il MUST inclure un espace réservé pour les breadcrumbs (utilisés à partir Sprint 2)

#### Scenario: Home breadcrumb only for Sprint 1
- **WHEN** l'utilisateur est sur `/dashboard`
- **THEN** les breadcrumbs MUST afficher uniquement "Dashboard"

### Requirement: Performance optimization for layout
Le système SHALL optimiser les performances du layout pour garantir un rendu rapide sur mobile 3G.

#### Scenario: Layout components memoized
- **WHEN** les composants layout sont créés
- **THEN** ils SHOULD utiliser React.memo() pour éviter les re-renders inutiles

#### Scenario: Icons lazy loaded
- **WHEN** les icônes Lucide sont importées
- **THEN** elles SHOULD être importées individuellement (tree-shaking) plutôt que depuis le package entier

#### Scenario: No heavy animations on mobile
- **WHEN** le sidebar s'ouvre sur mobile
- **THEN** l'animation MUST être simple (transform: translateX) sans effets lourds

### Requirement: Error boundary for dashboard
Le système SHALL implémenter un error boundary pour capturer les erreurs dans le dashboard sans crasher toute l'application.

#### Scenario: Error boundary wraps dashboard layout
- **WHEN** le dashboard layout est rendu
- **THEN** il MUST être wrappé dans un ErrorBoundary React

#### Scenario: Error UI displayed on crash
- **WHEN** une erreur non gérée se produit dans le dashboard
- **THEN** un message d'erreur user-friendly MUST s'afficher au lieu de l'écran blanc

#### Scenario: Error boundary logs error
- **WHEN** une erreur est capturée par l'error boundary
- **THEN** elle MUST être loggée (console en dev, Sentry en prod futur)

### Requirement: Layout spacing and padding
Le système SHALL utiliser un système d'espacement cohérent basé sur Tailwind pour le layout.

#### Scenario: Consistent padding in main content
- **WHEN** le contenu principal est rendu
- **THEN** il MUST avoir un padding de p-6 (24px) sur desktop et p-4 (16px) sur mobile

#### Scenario: Sidebar padding
- **WHEN** le sidebar est rendu
- **THEN** il MUST avoir un padding interne p-4 (16px)

#### Scenario: Header height consistent
- **WHEN** le header est rendu
- **THEN** il MUST avoir une hauteur fixe de h-16 (64px) sur toutes les résolutions
