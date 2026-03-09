'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingChecklist } from './OnboardingChecklist'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
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

export function OnboardingWizard({ data }: OnboardingWizardProps) {
  const router = useRouter()
  const [skipping, setSkipping] = useState(false)

  const steps = [
    {
      id: 1,
      label: 'Compléter votre profil',
      description: 'Ajoutez votre nom de business, téléphone et ville',
      href: '/dashboard/settings',
      done: data.hasProfile,
    },
    {
      id: 2,
      label: 'Ajouter votre premier client',
      description: 'Commencez à constituer votre carnet de clients',
      href: '/dashboard/clients',
      done: data.hasClient,
    },
    {
      id: 3,
      label: 'Créer votre première commande',
      description: 'Enregistrez une commande de couture',
      href: '/dashboard/orders',
      done: data.hasOrder,
    },
    {
      id: 4,
      label: 'Configurer votre portfolio',
      description: 'Ajoutez des photos de vos créations (plan Pro requis)',
      href: '/dashboard/portfolio',
      done: data.hasPortfolio,
    },
  ]

  const allDone = steps.every((s) => s.done)

  const handleComplete = async () => {
    setSkipping(true)
    try {
      await fetch('/api/stylists/me/onboarding', { method: 'PATCH' })
      toast.success(allDone ? 'Félicitations ! Votre compte est configuré.' : 'Onboarding ignoré.')
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('Erreur')
    } finally {
      setSkipping(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-4">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bienvenue sur Styliste !</h1>
          <p className="mt-2 text-gray-500">
            Suivez ces 4 étapes pour bien démarrer votre activité.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <OnboardingChecklist steps={steps} />

          <div className="mt-6 flex flex-col gap-2">
            {allDone ? (
              <Button className="w-full" onClick={handleComplete} disabled={skipping}>
                {skipping ? 'En cours...' : '🎉 Accéder à mon dashboard'}
              </Button>
            ) : (
              <>
                <Button className="w-full" onClick={handleComplete} disabled={skipping} variant="outline">
                  {skipping ? 'En cours...' : 'Passer pour l\'instant'}
                </Button>
                <p className="text-center text-xs text-gray-400">
                  Vous pouvez revenir à ces étapes depuis votre dashboard
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
