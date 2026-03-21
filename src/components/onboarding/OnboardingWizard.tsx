'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Users, ShoppingBag, UserCircle, Images, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

interface OnboardingData {
  hasProfile: boolean
  hasClient: boolean
  hasOrder: boolean
  hasPortfolio: boolean
}

interface OnboardingWizardProps {
  data: OnboardingData
}

const STEP_ICONS = [UserCircle, Users, ShoppingBag, Images]

export function OnboardingWizard({ data }: OnboardingWizardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const steps = [
    {
      id: 1,
      label: 'Compléter votre profil',
      description: 'Nom de business, téléphone, ville',
      detail: 'Ces infos apparaissent sur votre portfolio public et permettent à vos clients de vous contacter.',
      href: '/dashboard/settings',
      done: data.hasProfile,
      cta: 'Configurer mon profil',
    },
    {
      id: 2,
      label: 'Ajouter votre premier client',
      description: 'Créez votre carnet de clients',
      detail: 'Nom, contact, mesures : tout centralisé. Votre premier client est toujours le plus important.',
      href: '/dashboard/clients/new',
      done: data.hasClient,
      cta: 'Ajouter un client',
    },
    {
      id: 3,
      label: 'Créer une commande',
      description: 'Enregistrez votre première commande',
      detail: 'Type de vêtement, prix, date de livraison. Suivez l\'avancement en temps réel.',
      href: '/dashboard/orders/new',
      done: data.hasOrder,
      cta: 'Créer une commande',
    },
    {
      id: 4,
      label: 'Configurer votre portfolio',
      description: 'Montrez vos créations au monde',
      detail: 'Disponible sur le plan Pro. Ajoutez vos plus belles photos pour attirer de nouveaux clients.',
      href: '/dashboard/portfolio',
      done: data.hasPortfolio,
      cta: 'Voir le portfolio',
      optional: true,
    },
  ]

  const completed = steps.filter((s) => s.done).length
  const progress = Math.round((completed / steps.length) * 100)
  const allMandatoryDone = steps.filter((s) => !s.optional).every((s) => s.done)

  const handleSkip = async () => {
    setLoading(true)
    try {
      await fetch('/api/stylists/me/onboarding', { method: 'PATCH' })
      toast.success(allMandatoryDone ? 'Félicitations ! Votre compte est configuré.' : 'Vous pouvez revenir ici à tout moment.')
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('Erreur, veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-400 mx-auto">
            <span className="text-2xl">✂️</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Bienvenue sur Styliste !</h1>
            <p className="text-stone-400 text-sm mt-1">Configurez votre compte en quelques étapes.</p>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-400">Progression</span>
            <span className="font-bold text-white">{completed}/{steps.length} étapes</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-2 rounded-full bg-amber-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {completed === steps.length && (
            <p className="text-xs text-amber-400 text-center font-medium">🎉 Tout est configuré !</p>
          )}
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step) => {
            const Icon = STEP_ICONS[step.id - 1]
            const cardContent = (
              <div className="flex items-start gap-3">
                {/* Icône statut */}
                <div className="shrink-0 mt-0.5">
                  {step.done ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-stone-600 flex items-center justify-center">
                      <span className="text-xs font-bold text-stone-500">{step.id}</span>
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-bold ${step.done ? 'text-emerald-400 line-through' : 'text-white'}`}>
                      {step.label}
                    </p>
                    {step.optional && (
                      <span className="text-xs text-stone-500 bg-stone-800 px-1.5 py-0.5 rounded-md">optionnel</span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${step.done ? 'text-emerald-500/70' : 'text-stone-400'}`}>
                    {step.description}
                  </p>
                  {!step.done && (
                    <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">{step.detail}</p>
                  )}
                </div>

                {/* Flèche action */}
                {!step.done && (
                  <div className="shrink-0 self-center">
                    <ChevronRight className="h-5 w-5 text-amber-400" />
                  </div>
                )}
              </div>
            )

            return step.done ? (
              <div
                key={step.id}
                className="rounded-2xl border p-4 bg-emerald-500/10 border-emerald-500/20"
              >
                {cardContent}
              </div>
            ) : (
              <Link
                key={step.id}
                href={step.href}
                className="block rounded-2xl border p-4 bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-amber-400/30 active:scale-[0.98] transition-all duration-150 cursor-pointer"
              >
                {cardContent}
              </Link>
            )
          })}
        </div>

        {/* CTA */}
        <div className="space-y-2">
          {allMandatoryDone ? (
            <button
              onClick={handleSkip}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-amber-400 text-stone-950 font-black py-3.5 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50"
            >
              {loading ? 'Chargement...' : '🎉 Accéder à mon dashboard'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          ) : (
            <button
              onClick={handleSkip}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-stone-400 border border-stone-700 py-3 rounded-xl hover:border-stone-500 hover:text-stone-300 transition-colors text-sm disabled:opacity-50"
            >
              {loading ? 'Chargement...' : 'Passer pour l\'instant'}
            </button>
          )}
          <p className="text-center text-xs text-stone-600">
            Vous pouvez compléter ces étapes plus tard depuis votre dashboard.
          </p>
        </div>

      </div>
    </div>
  )
}
