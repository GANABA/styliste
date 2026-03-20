import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Politique de confidentialité | Styliste.com',
  description: 'Comment Styliste.com collecte, utilise et protège vos données personnelles.',
}

export default function ConfidentialitePage() {
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
          <h1 className="page-title mb-2">Politique de confidentialité</h1>
          <p className="text-sm text-muted-foreground">Dernière mise à jour : janvier 2025</p>
        </div>

        <div className="prose prose-stone max-w-none space-y-6 text-sm text-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">1. Responsable du traitement</h2>
            <p>
              Styliste.com est édité et exploité par son équipe fondatrice, basée au Bénin.
              Pour toute question relative à la protection de vos données, contactez-nous à :{' '}
              <a href="mailto:contact@styliste.com" className="text-amber-600 hover:underline">contact@styliste.com</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">2. Données collectées</h2>
            <p>Nous collectons uniquement les données nécessaires au fonctionnement du service :</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Informations de compte : nom, adresse email, mot de passe (chiffré)</li>
              <li>Données professionnelles : nom d&apos;atelier, ville, numéro de téléphone</li>
              <li>Données métier saisies : clients, commandes, mesures, paiements</li>
              <li>Données d&apos;usage : pages visitées, actions effectuées (à des fins d&apos;amélioration)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">3. Finalités du traitement</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Fournir et améliorer le service Styliste.com</li>
              <li>Gérer votre compte et vos abonnements</li>
              <li>Vous envoyer des notifications liées à votre activité</li>
              <li>Assurer la sécurité et prévenir les fraudes</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">4. Partage des données</h2>
            <p>
              Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec nos prestataires techniques
              (hébergement, emails transactionnels) dans le strict cadre de la fourniture du service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">5. Durée de conservation</h2>
            <p>
              Vos données sont conservées pendant toute la durée de votre abonnement actif, puis pendant 30 jours
              après la fermeture de votre compte pour permettre une éventuelle réactivation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">6. Vos droits</h2>
            <p>
              Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement et de portabilité de vos données.
              Pour exercer ces droits, contactez-nous à{' '}
              <a href="mailto:contact@styliste.com" className="text-amber-600 hover:underline">contact@styliste.com</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">7. Sécurité</h2>
            <p>
              Nous mettons en œuvre des mesures techniques appropriées pour protéger vos données :
              chiffrement des mots de passe (bcrypt), communications HTTPS, accès restreints par rôle.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border py-6 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          <Link href="/" className="text-amber-500 hover:underline font-medium">Styliste.com</Link>
          {' '}· <Link href="/cgu" className="hover:underline">CGU</Link>
          {' '}· <Link href="/donnees" className="hover:underline">Gestion des données</Link>
          {' '}· <Link href="/mentions-legales" className="hover:underline">Mentions légales</Link>
        </p>
      </footer>
    </div>
  )
}
