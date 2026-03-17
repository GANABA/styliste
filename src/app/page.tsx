import Link from 'next/link'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import {
  CheckCircle2, Users, ShoppingBag, CreditCard,
  ArrowRight, Smartphone, Globe, Ruler, Star,
  ChevronRight,
} from 'lucide-react'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-playfair',
})
const dm = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm',
})

// ── Data ────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Users,
    title: 'Carnet de clients numérique',
    desc: 'Fiche complète pour chaque client : coordonnées, mensurations, historique de commandes. Fini les carnets perdus.',
    color: 'bg-amber-50 text-amber-700',
  },
  {
    icon: ShoppingBag,
    title: 'Suivi des commandes en temps réel',
    desc: 'De la prise en charge à la livraison — statut, photos, délais, relances automatiques. Vos clients restent informés.',
    color: 'bg-emerald-50 text-emerald-700',
  },
  {
    icon: CreditCard,
    title: 'Paiements & factures instantanés',
    desc: 'Enregistrez les avances, suivez les soldes, générez un reçu PDF en un tap. Plus de pertes d\'argent.',
    color: 'bg-sky-50 text-sky-700',
  },
  {
    icon: Ruler,
    title: 'Mesures toujours disponibles',
    desc: 'Modèles de mesures personnalisables par type de vêtement. Historique versionné pour chaque client.',
    color: 'bg-rose-50 text-rose-700',
  },
  {
    icon: Globe,
    title: 'Portfolio public & annuaire',
    desc: 'Une page pro à votre nom pour montrer vos créations. Vos clients potentiels vous trouvent facilement.',
    color: 'bg-violet-50 text-violet-700',
  },
  {
    icon: Smartphone,
    title: 'Pensé pour le mobile',
    desc: 'Fonctionne parfaitement sur téléphone, même avec une connexion lente. Votre atelier dans votre poche.',
    color: 'bg-orange-50 text-orange-700',
  },
]

const STEPS = [
  { n: '01', title: 'Créez votre compte', desc: '2 minutes. Aucune carte bancaire requise pour démarrer.' },
  { n: '02', title: 'Configurez votre atelier', desc: 'Ajoutez vos clients, modèles de mesures, et premières commandes.' },
  { n: '03', title: 'Gérez tout depuis votre téléphone', desc: 'Statuts, paiements, relances — tout en quelques taps.' },
]

const PLANS = [
  {
    name: 'Découverte',
    price: 'Gratuit',
    period: '',
    desc: 'Pour commencer sans risque',
    highlight: false,
    features: ['20 clients', '5 commandes actives', 'Mesures & templates', 'Accès web & mobile'],
    cta: 'Commencer gratuitement',
    href: '/register',
  },
  {
    name: 'Standard',
    price: '5 000',
    period: 'FCFA / mois',
    desc: 'Pour développer votre activité',
    highlight: false,
    features: ['100 clients', '15 commandes actives', 'Notifications email auto', 'Historique complet'],
    cta: 'Choisir Standard',
    href: '/register?plan=standard',
  },
  {
    name: 'Pro',
    price: '10 000',
    period: 'FCFA / mois',
    desc: 'Pour les stylistes ambitieux',
    highlight: true,
    badge: 'Populaire',
    features: ['Clients illimités', '20 commandes actives', 'Portfolio public', 'Annuaire stylistes'],
    cta: 'Choisir Pro',
    href: '/register?plan=pro',
  },
  {
    name: 'Premium',
    price: '20 000',
    period: 'FCFA / mois',
    desc: 'Pour les ateliers en croissance',
    highlight: false,
    features: ['Tout Pro inclus', 'Commandes illimitées', 'Multi-employés (bientôt)', 'Support prioritaire'],
    cta: 'Choisir Premium',
    href: '/register?plan=premium',
  },
]

const TESTIMONIALS = [
  {
    name: 'Aminata K.',
    city: 'Cotonou',
    text: 'Avant je perdais des commandes et j\'oubliais les mesures. Maintenant tout est dans mon téléphone.',
    rating: 5,
  },
  {
    name: 'Fatou D.',
    city: 'Parakou',
    text: 'Mes clients reçoivent une notification quand leur robe est prête. Ils adorent ça !',
    rating: 5,
  },
  {
    name: 'Mariam S.',
    city: 'Abomey',
    text: 'Le portfolio m\'a ramené 3 nouveaux clients ce mois-ci. Je n\'aurais jamais imaginé ça.',
    rating: 5,
  },
]

// ── Component ────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className={`${playfair.variable} ${dm.variable}`} style={{ fontFamily: 'var(--font-dm), sans-serif' }}>

      {/* ── NAV ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-black tracking-tight text-stone-900" style={{ fontFamily: 'var(--font-playfair)' }}>
            Styliste<span className="text-amber-500">.com</span>
          </span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:inline text-sm text-stone-600 hover:text-stone-900 px-3 py-2 transition-colors">
              Connexion
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-stone-900 text-white px-4 py-2 rounded-xl hover:bg-stone-700 transition-colors"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen bg-stone-950 flex items-center overflow-hidden pt-16">
        {/* Texture décorative */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />
        {/* Glow ambiant */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center">
          {/* Texte */}
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-full">
              <Star className="h-3 w-3 fill-amber-400" />
              Essai gratuit 14 jours — Aucune carte requise
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1]"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Votre atelier de couture,{' '}
              <span className="text-amber-400 italic">enfin numérique.</span>
            </h1>

            <p className="text-lg text-stone-400 leading-relaxed max-w-lg">
              Gérez clients, commandes, paiements et portfolio depuis votre téléphone.
              Fini les cahiers perdus et les oublis — tout est dans Styliste.com.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-amber-400 text-stone-950 font-bold px-6 py-3.5 rounded-xl hover:bg-amber-300 transition-colors text-sm"
              >
                Créer mon compte gratuitement
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/stylistes"
                className="inline-flex items-center justify-center gap-2 text-stone-300 border border-stone-700 px-6 py-3.5 rounded-xl hover:border-stone-500 hover:text-white transition-colors text-sm"
              >
                Voir l&apos;annuaire
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-2">
              {[
                { val: '200+', label: 'stylistes actifs' },
                { val: '14j', label: "d'essai Pro offerts" },
                { val: '100%', label: 'mobile-friendly' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-playfair)' }}>{stat.val}</p>
                  <p className="text-xs text-stone-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card visuelle */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Main card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-stone-400">Commandes actives</p>
                    <p className="text-3xl font-black text-white" style={{ fontFamily: 'var(--font-playfair)' }}>12</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-400/20 flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-amber-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'Aïcha Mensah', item: 'Robe de soirée', status: 'Prête', color: 'text-emerald-400 bg-emerald-400/10' },
                    { name: 'Fatou Diallo', item: 'Boubou brodé', status: 'En cours', color: 'text-amber-400 bg-amber-400/10' },
                    { name: 'Mariam Ouédraogo', item: 'Tailleur', status: 'Devis', color: 'text-stone-400 bg-stone-400/10' },
                  ].map((row) => (
                    <div key={row.name} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5">
                      <div className="w-7 h-7 rounded-full bg-amber-400/20 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
                        {row.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-white truncate">{row.name}</p>
                        <p className="text-xs text-stone-500 truncate">{row.item}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${row.color}`}>{row.status}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg">
                ✓ Paiement reçu — 25 000 FCFA
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="bg-stone-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest">Fonctionnalités</p>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900" style={{ fontFamily: 'var(--font-playfair)' }}>
              Tout ce dont vous avez besoin,<br className="hidden sm:block" /> rien de superflu.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-stone-100 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-stone-900 mb-2 text-[15px]">{f.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-stone-900 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">En 3 étapes</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
              Démarrez en moins de 10 minutes.
            </h2>
          </div>

          <div className="space-y-6">
            {STEPS.map((step, i) => (
              <div key={step.n} className="flex gap-6 items-start">
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                  <span className="text-lg font-black text-amber-400" style={{ fontFamily: 'var(--font-playfair)' }}>{step.n}</span>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="font-bold text-white text-lg mb-1">{step.title}</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block shrink-0 pt-14 pl-7">
                    <div className="w-px h-6 bg-stone-700" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-amber-400 text-stone-950 font-bold px-8 py-4 rounded-xl hover:bg-amber-300 transition-colors"
            >
              Je me lance maintenant
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest">Témoignages</p>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900" style={{ fontFamily: 'var(--font-playfair)' }}>
              Ce que disent nos stylistes.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-stone-700 leading-relaxed mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="text-sm font-bold text-stone-900">{t.name}</p>
                  <p className="text-xs text-stone-400">{t.city}, Bénin</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="bg-stone-50 py-20 px-4" id="pricing">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest">Tarifs</p>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900" style={{ fontFamily: 'var(--font-playfair)' }}>
              Un plan pour chaque étape<br className="hidden sm:block" /> de votre activité.
            </h2>
            <p className="text-stone-500 text-sm">14 jours d&apos;essai Pro offerts. Aucune carte bancaire requise.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 flex flex-col ${
                  plan.highlight
                    ? 'bg-stone-900 border-stone-800 shadow-xl'
                    : 'bg-white border-stone-200'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-400 text-stone-950 text-xs font-black px-3 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className={`font-black text-lg mb-1 ${plan.highlight ? 'text-white' : 'text-stone-900'}`}
                    style={{ fontFamily: 'var(--font-playfair)' }}>
                    {plan.name}
                  </h3>
                  <p className={`text-xs ${plan.highlight ? 'text-stone-400' : 'text-stone-500'}`}>{plan.desc}</p>
                </div>

                <div className="mb-6">
                  <span className={`text-3xl font-black ${plan.highlight ? 'text-amber-400' : 'text-stone-900'}`}
                    style={{ fontFamily: 'var(--font-playfair)' }}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-xs ml-1 ${plan.highlight ? 'text-stone-400' : 'text-stone-500'}`}>
                      {plan.period}
                    </span>
                  )}
                </div>

                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${plan.highlight ? 'text-amber-400' : 'text-emerald-500'}`} />
                      <span className={plan.highlight ? 'text-stone-300' : 'text-stone-600'}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`inline-flex items-center justify-center gap-1.5 w-full py-3 rounded-xl text-sm font-bold transition-colors ${
                    plan.highlight
                      ? 'bg-amber-400 text-stone-950 hover:bg-amber-300'
                      : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
                  }`}
                >
                  {plan.cta}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-amber-400 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black text-stone-950 leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
            Votre atelier mérite<br /> un outil à la hauteur.
          </h2>
          <p className="text-stone-800 text-lg max-w-xl mx-auto">
            Rejoignez plus de 200 stylistes qui ont dit adieu aux cahiers et aux oublis.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-stone-950 text-white font-bold px-8 py-4 rounded-xl hover:bg-stone-800 transition-colors text-sm"
          >
            Commencer gratuitement — 14 jours Pro offerts
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs text-stone-700">
            Aucune carte bancaire. Annulation à tout moment.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-stone-950 text-stone-500 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <span className="font-black text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
            Styliste<span className="text-amber-400">.com</span>
          </span>
          <div className="flex gap-6">
            <Link href="/stylistes" className="hover:text-white transition-colors">Annuaire</Link>
            <Link href="/help" className="hover:text-white transition-colors">Aide</Link>
            <Link href="/login" className="hover:text-white transition-colors">Connexion</Link>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} Styliste.com — Bénin 🇧🇯</p>
        </div>
      </footer>

    </div>
  )
}
