'use client'

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Plan {
  name: string
  price: number // FCFA
  limits: {
    maxClients: number
    maxActiveOrders: number
    maxPortfolioItems: number
    smsCredits: number
  }
  features: {
    portfolio: boolean
    notifications: string | boolean
  }
}

interface SubscriptionPlanCardProps {
  plan: Plan
  isCurrent: boolean
  onSelect: (planName: string) => void
  disabled?: boolean
}

function formatLimit(val: number) {
  return val === -1 ? 'Illimité' : String(val)
}

export function SubscriptionPlanCard({
  plan,
  isCurrent,
  onSelect,
  disabled,
}: SubscriptionPlanCardProps) {
  const isPro = plan.name === 'Pro'

  return (
    <div
      className={`relative rounded-xl border-2 p-5 transition-all ${
        isCurrent
          ? 'border-indigo-500 bg-indigo-50'
          : isPro
          ? 'border-indigo-200 bg-white shadow-md'
          : 'border-gray-200 bg-white'
      }`}
    >
      {isPro && !isCurrent && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
          Recommandé
        </span>
      )}

      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{plan.name}</h3>
          <p className="text-2xl font-bold text-gray-900">
            {plan.price === 0 ? (
              'Gratuit'
            ) : (
              <>
                {plan.price.toLocaleString('fr-FR')}
                <span className="text-sm font-normal text-gray-500"> FCFA/mois</span>
              </>
            )}
          </p>
        </div>
        {isCurrent && <Badge variant="secondary">Plan actuel</Badge>}
      </div>

      <ul className="mb-4 space-y-1.5 text-sm text-gray-600">
        <li className="flex gap-2">
          <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
          {formatLimit(plan.limits.maxClients)} clients
        </li>
        <li className="flex gap-2">
          <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
          {formatLimit(plan.limits.maxActiveOrders)} commandes actives
        </li>
        <li className="flex gap-2">
          <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
          {plan.features.portfolio ? `Portfolio (${formatLimit(plan.limits.maxPortfolioItems)} photos)` : 'Pas de portfolio'}
        </li>
        <li className="flex gap-2">
          <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
          {plan.limits.smsCredits} crédits SMS/mois
        </li>
      </ul>

      <Button
        className="w-full"
        variant={isCurrent ? 'outline' : 'default'}
        disabled={isCurrent || disabled}
        onClick={() => !isCurrent && onSelect(plan.name)}
      >
        {isCurrent ? 'Plan actuel' : `Choisir ${plan.name}`}
      </Button>
    </div>
  )
}
