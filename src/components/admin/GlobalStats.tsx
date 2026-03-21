'use client'

import { Users, ShoppingBag, Activity, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsData {
  totalStylists: number
  activeStylists: number
  totalOrders: number
  planDistribution: { name: string; count: number }[]
}

const PLAN_STYLE: Record<string, { bar: string; badge: string; dot: string }> = {
  'Découverte': {
    bar:   'bg-stone-300',
    badge: 'bg-stone-100 text-stone-600 border-stone-200',
    dot:   'bg-stone-400',
  },
  'Standard': {
    bar:   'bg-amber-300',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot:   'bg-amber-400',
  },
  'Pro': {
    bar:   'bg-amber-500',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    dot:   'bg-amber-500',
  },
  'Premium': {
    bar:   'bg-amber-600',
    badge: 'bg-amber-400 text-stone-950 border-amber-500',
    dot:   'bg-amber-600',
  },
}

export function GlobalStats({ data }: { data: StatsData }) {
  const total = data.planDistribution.reduce((sum, p) => sum + p.count, 0)
  const activeRate = data.totalStylists > 0
    ? Math.round((data.activeStylists / data.totalStylists) * 100)
    : 0

  const cards = [
    {
      label: 'Stylistes inscrits',
      value: data.totalStylists,
      sub: 'Total sur la plateforme',
      icon: Users,
      iconClass: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      label: 'Actifs · 7 derniers jours',
      value: data.activeStylists,
      sub: `${activeRate}% d'engagement`,
      icon: Activity,
      iconClass: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Commandes totales',
      value: data.totalOrders,
      sub: 'Toutes périodes confondues',
      icon: ShoppingBag,
      iconClass: 'text-violet-600 bg-violet-50 border-violet-100',
    },
  ]

  return (
    <div className="space-y-4">
      {/* ── Metric cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div
              key={c.label}
              className="group bg-white rounded-2xl border border-stone-100 p-5 shadow-sm hover:shadow-md hover:border-stone-200 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn('h-10 w-10 rounded-xl border flex items-center justify-center', c.iconClass)}>
                  <Icon className="h-5 w-5" />
                </div>
                <TrendingUp className="h-4 w-4 text-stone-200 group-hover:text-stone-300 transition-colors" />
              </div>
              <p className="text-3xl font-black text-stone-900 tabular-nums leading-none">
                {c.value.toLocaleString('fr-FR')}
              </p>
              <p className="text-sm font-medium text-stone-600 mt-1.5">{c.label}</p>
              <p className="text-xs text-stone-400 mt-0.5">{c.sub}</p>
            </div>
          )
        })}
      </div>

      {/* ── Plan distribution ── */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wide">
            Répartition des plans
          </h3>
          <span className="text-xs text-stone-400 font-medium">
            {total} abonnement{total !== 1 ? 's' : ''} actif{total !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-4">
          {data.planDistribution.map((p) => {
            const pct = total > 0 ? Math.round((p.count / total) * 100) : 0
            const style = PLAN_STYLE[p.name] ?? {
              bar: 'bg-stone-300',
              badge: 'bg-stone-100 text-stone-600 border-stone-200',
              dot: 'bg-stone-400',
            }
            return (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={cn('inline-block w-2 h-2 rounded-full', style.dot)} />
                    <span className="text-sm font-medium text-stone-700">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400 tabular-nums w-7 text-right">{pct}%</span>
                    <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full border tabular-nums', style.badge)}>
                      {p.count}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-700', style.bar)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
