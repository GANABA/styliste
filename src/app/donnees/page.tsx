import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Gestion des données | Styliste.com',
  description: 'Comment gérer, exporter ou supprimer vos données sur Styliste.com.',
}

export default function DonneesPage() {
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
          <h1 className="page-title mb-2">Gestion de vos données</h1>
          <p className="text-sm text-muted-foreground">Dernière mise à jour : janvier 2025</p>
        </div>

        <div className="space-y-6 text-sm text-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">Vos données vous appartiennent</h2>
            <p>
              Toutes les données que vous saisissez dans Styliste.com (clients, commandes, mesures, paiements)
              vous appartiennent intégralement. Nous n&apos;avons aucun droit de propriété sur ces informations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">Accéder à vos données</h2>
            <p>
              Vous pouvez consulter l&apos;ensemble de vos données à tout moment depuis votre espace styliste.
              Chaque fiche client, commande et paiement est accessible et modifiable.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">Exporter vos données</h2>
            <p>
              Vous pouvez demander l&apos;export complet de vos données en contactant notre support à{' '}
              <a href="mailto:contact@styliste.com" className="text-amber-600 hover:underline">contact@styliste.com</a>.
              Nous traiterons votre demande sous 72 heures ouvrées.
            </p>
            <p className="text-muted-foreground">
              Une fonctionnalité d&apos;export autonome (CSV / PDF) est prévue dans une prochaine version.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">Supprimer vos données</h2>
            <p>
              Lors de la fermeture de votre compte, vos données sont conservées 30 jours pour permettre
              une réactivation éventuelle, puis supprimées définitivement de nos serveurs.
            </p>
            <p>
              Pour demander une suppression immédiate, contactez-nous à{' '}
              <a href="mailto:contact@styliste.com" className="text-amber-600 hover:underline">contact@styliste.com</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">Hébergement et localisation</h2>
            <p>
              Vos données sont hébergées sur des serveurs sécurisés. Nous utilisons des prestataires
              reconnus pour l&apos;hébergement (Neon / Vercel) et le stockage de fichiers (Cloudflare R2).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">Contact</h2>
            <p>
              Pour toute question relative à vos données personnelles :{' '}
              <a href="mailto:contact@styliste.com" className="text-amber-600 hover:underline">contact@styliste.com</a>
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border py-6 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          <Link href="/" className="text-amber-500 hover:underline font-medium">Styliste.com</Link>
          {' '}· <Link href="/confidentialite" className="hover:underline">Confidentialité</Link>
          {' '}· <Link href="/cgu" className="hover:underline">CGU</Link>
          {' '}· <Link href="/mentions-legales" className="hover:underline">Mentions légales</Link>
        </p>
      </footer>
    </div>
  )
}
