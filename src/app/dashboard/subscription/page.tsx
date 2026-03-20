'use client'

import { useEffect, useState } from 'react'
import { CreditCard, RefreshCw } from 'lucide-react'
import { UsageMeter } from '@/components/subscription/UsageMeter'
import { SubscriptionPlanCard } from '@/components/subscription/SubscriptionPlanCard'
import { PlanComparison } from '@/components/subscription/PlanComparison'
import { UpgradeDialog } from '@/components/subscription/UpgradeDialog'
import { PLAN_ORDER } from '@/lib/helpers/subscription'

interface SubscriptionData {
  plan: string
  subscription: { status: string; currentPeriodEnd: string } | null
  usage: {
    clients: { current: number; limit: number }
    orders: { current: number; limit: number }
    portfolio: { current: number; limit: number }
  }
}

interface PlanData {
  id: string
  name: string
  price: number
  limits: { maxClients: number; maxActiveOrders: number; maxPortfolioItems: number; smsCredits: number }
  features: { portfolio: boolean; notifications: boolean | string }
}

export default function SubscriptionPage() {
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [plans, setPlans] = useState<PlanData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchData = async () => {
    const [subRes, plansRes] = await Promise.all([
      fetch('/api/subscriptions/current'),
      fetch('/api/subscriptions/plans'),
    ])
    if (subRes.ok) setData(await subRes.json())
    if (plansRes.ok) {
      const p = await plansRes.json()
      setPlans(p.plans)
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName)
    setDialogOpen(true)
  }

  const isDowngrade = selectedPlan
    ? PLAN_ORDER.indexOf(selectedPlan) < PLAN_ORDER.indexOf(data?.plan ?? 'Découverte')
    : false

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <CreditCard className="h-6 w-6 text-indigo-600" />
        <div>
          <h1 className="page-title" style={{fontSize:"1.25rem"}}>Abonnement</h1>
          <p className="text-sm text-gray-500">
            Plan actuel : <span className="font-medium text-gray-900">{data?.plan}</span>
            {data?.subscription?.status === 'TRIAL' && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                Essai gratuit
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Jauges d'usage */}
      {data && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Votre usage
          </h2>
          <div className="space-y-4">
            <UsageMeter
              label="Clients"
              current={data.usage.clients.current}
              limit={data.usage.clients.limit}
            />
            <UsageMeter
              label="Commandes actives"
              current={data.usage.orders.current}
              limit={data.usage.orders.limit}
            />
            <UsageMeter
              label="Photos portfolio"
              current={data.usage.portfolio.current}
              limit={data.usage.portfolio.limit}
            />
          </div>
        </div>
      )}

      {/* Cartes des plans */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Changer de plan
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <SubscriptionPlanCard
              key={plan.id}
              plan={plan as any}
              isCurrent={plan.name === data?.plan}
              onSelect={handleSelectPlan}
            />
          ))}
        </div>
      </div>

      {/* Tableau comparatif */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Comparaison des plans
        </h2>
        <PlanComparison currentPlan={data?.plan ?? 'Découverte'} />
      </div>

      {/* Dialog de confirmation */}
      {selectedPlan && (
        <UpgradeDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSuccess={fetchData}
          targetPlan={selectedPlan}
          currentPlan={data?.plan ?? 'Découverte'}
          isDowngrade={isDowngrade}
        />
      )}
    </div>
  )
}
