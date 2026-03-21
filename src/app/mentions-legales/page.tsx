import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Building2, Server, Copyright, AlertCircle, Cookie, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mentions légales | Styliste.com',
  description: 'Mentions légales de Styliste.com.',
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Accueil
          </Link>
          <span className="text-sm font-black" style={{ fontFamily: 'var(--font-playfair)' }}>
            Styliste<span className="text-amber-500">.com</span>
          </span>
          <div className="w-16" />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-3">Légal</p>
          <h1 className="text-3xl font-black text-foreground mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
            Mentions légales
          </h1>
          <p className="text-sm text-muted-foreground">Dernière mise à jour : janvier 2025</p>
        </div>

        <div className="space-y-4">
          {/* Éditeur */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-100 bg-stone-50/50">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4 text-amber-600" />
              </div>
              <h2 className="text-sm font-bold text-foreground">Éditeur du site</h2>
            </div>
            <div className="px-6 py-5">
              <dl className="space-y-3 text-sm">
                {[
                  { label: 'Raison sociale', value: 'Styliste.com' },
                  { label: 'Pays', value: 'Afrique de l\'Ouest' },
                  { label: 'Email', value: <a href="mailto:contact@styliste.com" className="text-amber-600 hover:underline">contact@styliste.com</a> },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-3">
                    <dt className="w-32 shrink-0 text-muted-foreground">{label}</dt>
                    <dd className="font-medium text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Hébergement */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-100 bg-stone-50/50">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <Server className="h-4 w-4 text-amber-600" />
              </div>
              <h2 className="text-sm font-bold text-foreground">Hébergement</h2>
            </div>
            <div className="px-6 py-5">
              <dl className="space-y-3 text-sm">
                {[
                  { label: 'Web', value: 'Vercel Inc., 340 Pine Street Suite 701, San Francisco CA 94104, USA' },
                  { label: 'Base de données', value: 'Neon Inc.' },
                  { label: 'Fichiers', value: 'Cloudflare, Inc.' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-3">
                    <dt className="w-32 shrink-0 text-muted-foreground">{label}</dt>
                    <dd className="font-medium text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Propriété intellectuelle */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-100 bg-stone-50/50">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <Copyright className="h-4 w-4 text-amber-600" />
              </div>
              <h2 className="text-sm font-bold text-foreground">Propriété intellectuelle</h2>
            </div>
            <div className="px-6 py-5 text-sm text-foreground leading-relaxed">
              <p>
                L&apos;ensemble du contenu du site Styliste.com (textes, graphiques, logo, code source) est la propriété
                exclusive de Styliste.com et est protégé par les lois applicables sur la propriété intellectuelle.
                Toute reproduction, même partielle, est strictement interdite sans autorisation préalable écrite.
              </p>
            </div>
          </div>

          {/* Responsabilité */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-100 bg-stone-50/50">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
              <h2 className="text-sm font-bold text-foreground">Responsabilité</h2>
            </div>
            <div className="px-6 py-5 text-sm text-foreground leading-relaxed">
              <p>
                Styliste.com met tout en œuvre pour assurer la fiabilité des informations publiées.
                Cependant, il ne peut être tenu responsable des erreurs ou omissions, ni des dommages résultant
                de l&apos;utilisation des informations fournies.
              </p>
            </div>
          </div>

          {/* Cookies */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-100 bg-stone-50/50">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <Cookie className="h-4 w-4 text-amber-600" />
              </div>
              <h2 className="text-sm font-bold text-foreground">Cookies</h2>
            </div>
            <div className="px-6 py-5 text-sm text-foreground leading-relaxed">
              <p>
                Styliste.com utilise uniquement des cookies techniques nécessaires au fonctionnement du service
                (authentification, préférences). <strong>Aucun cookie publicitaire ou de tracking tiers</strong> n&apos;est utilisé.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-100 bg-stone-50/50">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <Mail className="h-4 w-4 text-amber-600" />
              </div>
              <h2 className="text-sm font-bold text-foreground">Contact</h2>
            </div>
            <div className="px-6 py-5 text-sm text-foreground leading-relaxed">
              <p>
                Pour toute question ou réclamation :{' '}
                <a href="mailto:contact@styliste.com" className="text-amber-600 hover:underline font-medium">contact@styliste.com</a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-6 px-4 text-center mt-12">
        <p className="text-xs text-muted-foreground">
          <Link href="/" className="text-amber-500 hover:underline font-medium">Styliste.com</Link>
          {' '}·{' '}
          <Link href="/confidentialite" className="hover:underline">Confidentialité</Link>
          {' '}·{' '}
          <Link href="/cgu" className="hover:underline">CGU</Link>
        </p>
      </footer>
    </div>
  )
}
