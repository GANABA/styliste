import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, FileText, LogIn, CreditCard, Database, Ban, Clock, AlertCircle, RefreshCw, Scale } from 'lucide-react'

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation | Styliste.com",
  description: "Conditions générales d'utilisation du service Styliste.com.",
}

const sections = [
  {
    id: 'objet',
    icon: FileText,
    title: '1. Objet',
    content: (
      <p>
        Les présentes conditions générales d&apos;utilisation (CGU) régissent l&apos;accès et l&apos;utilisation
        du service Styliste.com, plateforme de gestion d&apos;atelier de couture à destination des stylistes
        et tailleurs professionnels en Afrique de l&apos;Ouest.
      </p>
    ),
  },
  {
    id: 'acces',
    icon: LogIn,
    title: '2. Accès au service',
    content: (
      <>
        <p>
          L&apos;accès au service nécessite la création d&apos;un compte avec une adresse email valide.
          L&apos;utilisateur est responsable de la confidentialité de ses identifiants de connexion.
        </p>
        <p className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100 text-amber-800 text-xs font-medium">
          Essai gratuit de 14 jours avec les fonctionnalités Pro, sans engagement ni carte bancaire.
        </p>
      </>
    ),
  },
  {
    id: 'abonnements',
    icon: CreditCard,
    title: '3. Abonnements et paiements',
    content: (
      <>
        <p>
          Les abonnements payants sont facturés <strong>mensuellement</strong>. En cas de non-paiement :
        </p>
        <ul className="mt-3 space-y-2">
          {[
            '3 jours de délai de grâce accordés',
            'Suspension du compte à J+3',
            'Suppression définitive des données à J+24',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-3">La résiliation prend effet à la fin de la période d&apos;abonnement en cours.</p>
      </>
    ),
  },
  {
    id: 'donnees',
    icon: Database,
    title: '4. Propriété des données',
    content: (
      <p>
        Les données saisies par l&apos;utilisateur (clients, commandes, mesures, paiements) lui appartiennent
        <strong> entièrement</strong>. Styliste.com ne revendique aucun droit de propriété sur ces données.
        Consultez notre{' '}
        <Link href="/confidentialite#vos-donnees" className="text-amber-600 hover:underline font-medium">
          politique de gestion des données
        </Link>{' '}
        pour plus de détails.
      </p>
    ),
  },
  {
    id: 'utilisation',
    icon: Ban,
    title: '5. Utilisation acceptable',
    content: (
      <p>
        L&apos;utilisateur s&apos;engage à ne pas utiliser le service à des fins illicites, frauduleuses
        ou portant atteinte aux droits de tiers. Tout comportement abusif entraîne la suspension immédiate du compte.
      </p>
    ),
  },
  {
    id: 'disponibilite',
    icon: Clock,
    title: '6. Disponibilité',
    content: (
      <p>
        Styliste.com s&apos;efforce d&apos;assurer la disponibilité du service 24h/24, 7j/7.
        Des interruptions ponctuelles de maintenance peuvent survenir et seront communiquées à l&apos;avance dans la mesure du possible.
      </p>
    ),
  },
  {
    id: 'responsabilite',
    icon: AlertCircle,
    title: '7. Limitation de responsabilité',
    content: (
      <p>
        Styliste.com ne peut être tenu responsable des pertes de données résultant d&apos;une utilisation incorrecte
        du service ou d&apos;événements indépendants de sa volonté (cas de force majeure, pannes d&apos;infrastructures tiers).
      </p>
    ),
  },
  {
    id: 'modification',
    icon: RefreshCw,
    title: '8. Modification des CGU',
    content: (
      <p>
        Styliste.com se réserve le droit de modifier les présentes CGU. Les utilisateurs seront informés
        par email de tout changement substantiel avec un préavis de 15 jours.
      </p>
    ),
  },
  {
    id: 'droit',
    icon: Scale,
    title: '9. Droit applicable',
    content: (
      <p>
        Les présentes CGU sont soumises au <strong>droit applicable dans le pays de résidence de l&apos;éditeur</strong>. En cas de litige, les parties s&apos;efforceront
        de trouver une solution amiable avant tout recours judiciaire.
      </p>
    ),
  },
]

export default function CguPage() {
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
            Conditions générales d&apos;utilisation
          </h1>
          <p className="text-sm text-muted-foreground">Dernière mise à jour : janvier 2025</p>
        </div>

        <div className="space-y-4">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <div key={section.id} id={section.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-100 bg-stone-50/50">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-amber-600" />
                  </div>
                  <h2 className="text-sm font-bold text-foreground">{section.title}</h2>
                </div>
                <div className="px-6 py-5 text-sm text-foreground leading-relaxed">
                  {section.content}
                </div>
              </div>
            )
          })}
        </div>
      </main>

      <footer className="border-t border-border py-6 px-4 text-center mt-12">
        <p className="text-xs text-muted-foreground">
          <Link href="/" className="text-amber-500 hover:underline font-medium">Styliste.com</Link>
          {' '}·{' '}
          <Link href="/confidentialite" className="hover:underline">Confidentialité</Link>
          {' '}·{' '}
          <Link href="/mentions-legales" className="hover:underline">Mentions légales</Link>
        </p>
      </footer>
    </div>
  )
}
