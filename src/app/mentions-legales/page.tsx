import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mentions légales | Styliste.com',
  description: 'Mentions légales de Styliste.com.',
}

export default function MentionsLegalesPage() {
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
          <h1 className="page-title mb-2">Mentions légales</h1>
          <p className="text-sm text-muted-foreground">Dernière mise à jour : janvier 2025</p>
        </div>

        <div className="space-y-6 text-sm text-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">Éditeur du site</h2>
            <div className="text-muted-foreground space-y-1">
              <p><span className="font-medium text-foreground">Raison sociale :</span> Styliste.com</p>
              <p><span className="font-medium text-foreground">Pays :</span> République du Bénin</p>
              <p><span className="font-medium text-foreground">Email :</span>{' '}
                <a href="mailto:contact@styliste.com" className="text-amber-600 hover:underline">contact@styliste.com</a>
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">Hébergement</h2>
            <div className="text-muted-foreground space-y-1">
              <p><span className="font-medium text-foreground">Hébergeur web :</span> Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis</p>
              <p><span className="font-medium text-foreground">Base de données :</span> Neon Inc.</p>
              <p><span className="font-medium text-foreground">Stockage fichiers :</span> Cloudflare, Inc.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble du contenu du site Styliste.com (textes, graphiques, logo, code source) est la propriété
              exclusive de Styliste.com et est protégé par les lois applicables sur la propriété intellectuelle.
              Toute reproduction, même partielle, est strictement interdite sans autorisation préalable écrite.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">Responsabilité</h2>
            <p>
              Styliste.com met tout en œuvre pour assurer la fiabilité des informations publiées sur son site.
              Cependant, il ne peut être tenu responsable des erreurs ou omissions, ni des dommages résultant
              de l&apos;utilisation des informations fournies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">Cookies</h2>
            <p>
              Styliste.com utilise des cookies techniques nécessaires au fonctionnement du service
              (authentification, préférences). Aucun cookie publicitaire ou de tracking tiers n&apos;est utilisé.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">Contact</h2>
            <p>
              Pour toute question ou réclamation :{' '}
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
          {' '}· <Link href="/donnees" className="hover:underline">Gestion des données</Link>
        </p>
      </footer>
    </div>
  )
}
