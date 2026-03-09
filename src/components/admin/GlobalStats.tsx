'use client'

import { Users, ShoppingBag, Activity, BarChart3 } from 'lucide-react'

interface StatsData {
  totalStylists: number
  activeStylists: number
  totalOrders: number
  planDistribution: { name: string; count: number }[]
}

export function GlobalStats({ data }: { data: StatsData }) {
  const cards = [
    {
      label: 'Stylistes inscrits',
      value: data.totalStylists,
      icon: Users,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      label: 'Actifs (7 derniers jours)',
      value: data.activeStylists,
      icon: Activity,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Commandes totales',
      value: data.totalOrders,
      icon: ShoppingBag,
      color: 'text-blue-600 bg-blue-50',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${c.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{c.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{c.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Répartition des plans */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">Répartition des plans</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {data.planDistribution.map((p) => (
            <div key={p.name} className="text-center p-3 rounded-lg bg-gray-50">
              <p className="text-xl font-bold text-gray-900">{p.count}</p>
              <p className="text-xs text-gray-500">{p.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
