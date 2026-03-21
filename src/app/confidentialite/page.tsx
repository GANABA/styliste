import { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowLeft, Shield, Database, Share2, Clock,
  UserCheck, Lock, HardDrive, FileDown, Trash2,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Politique de confidentialité | Styliste.com',
  description: 'Comment Styliste.com collecte, utilise et protège vos données personnelles.',
}

function SectionCard({
  id,
  icon: Icon,
  title,
  children,
  accent = false,
}: {
  id?: string
  icon: React.ElementType
  title: string
  children: React.ReactNode
  accent?: boolean
}) {
  return (
    <div
      id={id}
      className={`rounded-2xl border shadow-sm overflow-hidden ${
        accent
          ? 'border-amber-100 bg-amber-50/40'
          : 'border-stone-100 bg-white'
      }`}
    >
      <div className={`flex items-center gap-3 px-6 py-4 border-b ${accent ? 'border-amber-100 bg-amber-50/60' : 'border-stone-100 bg-stone-50/50'}`}>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${accent ? 'bg-amber-100' : 'bg-amber-50'}`}>
          <Icon className="h-4 w-4 text-amber-600" />
        </div>
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
      </div>
      <div className="px-6 py-5 text-sm text-foreground leading-relaxed">
        {children}
      </div>
    </div>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-muted-foreground">
      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
      {children}
    </li>
  )
}

export default function ConfidentialitePage() {
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

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-4">

        {/* En-tête */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-3">Légal</p>
          <h1 className="text-3xl font-black text-foreground mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
            Politique de confidentialité
          </h1>
          <p className="text-sm text-muted-foreground">Dernière mise à jour : janvier 2025</p>
        </div>

        {/* 1. Responsable */}
        <SectionCard id="responsable" icon={UserCheck} title="1. Responsable du traitement">
          <p>
            Styliste.com est édité et exploité par son équipe fondatrice, basée en Afrique de l&apos;Ouest.
            Pour toute question relative à la protection de vos données :{' '}
            <a href="mailto:contact@styliste.com" className="text-amber-600 hover:underline font-medium">contact@styliste.com</a>.
          </p>
        </SectionCard>

        {/* 2. Données collectées */}
        <SectionCard id="collecte" icon={Database} title="2. Données collectées">
          <p className="mb-3">Nous collectons uniquement les données nécessaires au fonctionnement du service :</p>
          <ul className="space-y-2">
            <Bullet>Compte : nom, adresse email, mot de passe (chiffré bcrypt)</Bullet>
            <Bullet>Atelier : nom commercial, ville, numéro de téléphone</Bullet>
            <Bullet>Données métier : clients, commandes, mesures, paiements</Bullet>
            <Bullet>Usage : pages visitées, actions effectuées (à des fins d&apos;amélioration du service)</Bullet>
          </ul>
        </SectionCard>

        {/* 3. Finalités */}
        <SectionCard id="finalites" icon={Shield} title="3. Finalités du traitement">
          <p className="mb-3">Vos données sont utilisées pour :</p>
          <ul className="space-y-2">
            <Bullet>Fournir et améliorer le service Styliste.com</Bullet>
            <Bullet>Gérer votre compte et vos abonnements</Bullet>
            <Bullet>Vous envoyer des notifications liées à votre activité</Bullet>
            <Bullet>Assurer la sécurité et prévenir les fraudes</Bullet>
          </ul>
        </SectionCard>

        {/* 4. Partage */}
        <SectionCard id="partage" icon={Share2} title="4. Partage des données">
          <p>
            Vos données ne sont <strong>jamais vendues</strong> à des tiers.
            Elles peuvent être partagées avec nos prestataires techniques (hébergement, emails transactionnels)
            dans le strict cadre de la fourniture du service, sur la base d&apos;accords de confidentialité.
          </p>
        </SectionCard>

        {/* 5. Conservation */}
        <SectionCard id="conservation" icon={Clock} title="5. Durée de conservation">
          <p>
            Vos données sont conservées pendant toute la durée de votre abonnement actif, puis pendant{' '}
            <strong>30 jours</strong> après la fermeture de votre compte pour permettre une éventuelle réactivation.
            À l&apos;issue de ce délai, elles sont supprimées définitivement de nos serveurs.
          </p>
        </SectionCard>

        {/* 6. Droits */}
        <SectionCard id="droits" icon={UserCheck} title="6. Vos droits">
          <p>
            Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement et de portabilité de vos données.
            Pour exercer ces droits, contactez-nous à{' '}
            <a href="mailto:contact@styliste.com" className="text-amber-600 hover:underline font-medium">contact@styliste.com</a>.
            Nous traiterons votre demande sous 72 heures ouvrées.
          </p>
        </SectionCard>

        {/* 7. Sécurité */}
        <SectionCard id="securite" icon={Lock} title="7. Sécurité">
          <p className="mb-3">Nous mettons en œuvre des mesures techniques appropriées pour protéger vos données :</p>
          <ul className="space-y-2">
            <Bullet>Chiffrement des mots de passe (bcrypt)</Bullet>
            <Bullet>Communications sécurisées (HTTPS / TLS)</Bullet>
            <Bullet>Accès restreints par rôle (RBAC)</Bullet>
            <Bullet>Requêtes base de données paramétrées (protection contre les injections)</Bullet>
          </ul>
        </SectionCard>

        {/* ── Séparation visuelle : Gestion de vos données ── */}
        <div id="vos-donnees" className="pt-6">
          <div className="mb-4">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-1">Vos droits pratiques</p>
            <h2 className="text-xl font-black text-foreground" style={{ fontFamily: 'var(--font-playfair)' }}>
              Gestion de vos données
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Comment accéder, exporter et supprimer vos données personnelles
            </p>
          </div>
        </div>

        {/* Propriété */}
        <SectionCard id="propriete" icon={Shield} title="Vos données vous appartiennent" accent>
          <p>
            Toutes les données que vous saisissez dans Styliste.com (clients, commandes, mesures, paiements)
            vous appartiennent <strong>intégralement</strong>. Styliste.com n&apos;a aucun droit de propriété sur ces informations
            et ne les exploite pas à des fins commerciales.
          </p>
        </SectionCard>

        {/* Hébergement */}
        <SectionCard id="hebergement" icon={HardDrive} title="Hébergement et localisation" accent>
          <p>
            Vos données sont hébergées sur des serveurs sécurisés chez des prestataires reconnus :
            Neon (base de données), Vercel (hébergement web) et Cloudflare R2 (stockage de fichiers).
            Ces prestataires sont contractuellement tenus de protéger vos données.
          </p>
        </SectionCard>

        {/* Export */}
        <SectionCard id="export" icon={FileDown} title="Exporter vos données" accent>
          <p>
            Vous pouvez demander l&apos;export complet de vos données en contactant notre support à{' '}
            <a href="mailto:contact@styliste.com" className="text-amber-600 hover:underline font-medium">contact@styliste.com</a>.
            Nous traiterons votre demande sous 72 heures ouvrées.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Une fonctionnalité d&apos;export autonome (CSV / PDF) est prévue dans une prochaine version.
          </p>
        </SectionCard>

        {/* Suppression */}
        <SectionCard id="suppression" icon={Trash2} title="Supprimer votre compte" accent>
          <p>
            Vous pouvez supprimer votre compte à tout moment depuis{' '}
            <strong>Paramètres › Zone de danger</strong>.
            Vos données sont conservées 30 jours pour permettre une réactivation éventuelle,
            puis supprimées définitivement.
          </p>
          <p className="mt-2">
            Pour une suppression immédiate, contactez{' '}
            <a href="mailto:contact@styliste.com" className="text-amber-600 hover:underline font-medium">contact@styliste.com</a>.
          </p>
        </SectionCard>

      </main>

      <footer className="border-t border-border py-6 px-4 text-center mt-8">
        <p className="text-xs text-muted-foreground">
          <Link href="/" className="text-amber-500 hover:underline font-medium">Styliste.com</Link>
          {' '}·{' '}
          <Link href="/cgu" className="hover:underline">CGU</Link>
          {' '}·{' '}
          <Link href="/mentions-legales" className="hover:underline">Mentions légales</Link>
        </p>
      </footer>
    </div>
  )
}
