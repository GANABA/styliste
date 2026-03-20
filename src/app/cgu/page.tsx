import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation | Styliste.com",
  description: "Conditions générales d'utilisation du service Styliste.com.",
}

export default function CguPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Accueil
          </Link>
          <span className="text-sm font-black" style={{ fontFamily: 'var(--font-playfair)' }}>
            Styliste<span className="text-amber-500">.com</span>
          </span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div>
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-3">Légal</p>
          <h1 className="page-title mb-2">Conditions générales d&apos;utilisation</h1>
          <p className="text-sm text-muted-foreground">Dernière mise à jour : janvier 2025</p>
        </div>

        <div className="space-y-6 text-sm text-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">1. Objet</h2>
            <p>
              Les présentes conditions générales d&apos;utilisation (CGU) régissent l&apos;accès et l&apos;utilisation
              du service Styliste.com, plateforme de gestion d&apos;atelier de couture à destination des stylistes
              et tailleurs professionnels.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">2. Accès au service</h2>
            <p>
              L&apos;accès au service nécessite la création d&apos;un compte avec une adresse email valide.
              L&apos;utilisateur est responsable de la confidentialité de ses identifiants de connexion.
            </p>
            <p>
              Une période d&apos;essai de 14 jours avec les fonctionnalités Pro est offerte sans engagement
              et sans carte bancaire requise.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">3. Abonnements et paiements</h2>
            <p>
              Les abonnements payants sont facturés mensuellement. En cas de non-paiement, un délai de grâce
              de 3 jours est accordé avant suspension du compte, puis 21 jours avant suppression définitive.
            </p>
            <p>
              La résiliation prend effet à la fin de la période d&apos;abonnement en cours.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">4. Propriété des données</h2>
            <p>
              Les données saisies par l&apos;utilisateur (clients, commandes, mesures, paiements) lui appartiennent
              entièrement. Styliste.com ne revendique aucun droit de propriété sur ces données.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">5. Utilisation acceptable</h2>
            <p>L&apos;utilisateur s&apos;engage à ne pas utiliser le service à des fins illicites, frauduleuses ou portant atteinte aux droits de tiers.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">6. Disponibilité</h2>
            <p>
              Styliste.com s&apos;efforce d&apos;assurer la disponibilité du service 24h/24, 7j/7.
              Des interruptions ponctuelles de maintenance peuvent survenir et seront communiquées dans la mesure du possible.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">7. Limitation de responsabilité</h2>
            <p>
              Styliste.com ne peut être tenu responsable des pertes de données résultant d&apos;une utilisation incorrecte
              du service ou d&apos;événements indépendants de sa volonté (cas de force majeure).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">8. Modification des CGU</h2>
            <p>
              Styliste.com se réserve le droit de modifier les présentes CGU. Les utilisateurs seront informés
              par email de tout changement substantiel.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">9. Droit applicable</h2>
            <p>
              Les présentes CGU sont soumises au droit béninois. En cas de litige, les parties s&apos;efforceront
              de trouver une solution amiable avant tout recours judiciaire.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border py-6 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          <Link href="/" className="text-amber-500 hover:underline font-medium">Styliste.com</Link>
          {' '}· <Link href="/confidentialite" className="hover:underline">Confidentialité</Link>
          {' '}· <Link href="/donnees" className="hover:underline">Gestion des données</Link>
          {' '}· <Link href="/mentions-legales" className="hover:underline">Mentions légales</Link>
        </p>
      </footer>
    </div>
  )
}
