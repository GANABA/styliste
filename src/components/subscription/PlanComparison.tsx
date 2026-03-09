'use client'

import { Check, X } from 'lucide-react'

const PLANS = [
  {
    name: 'Découverte',
    price: 'Gratuit',
    clients: '20',
    orders: '5',
    portfolio: false,
    sms: '0',
    support: 'Communauté',
  },
  {
    name: 'Standard',
    price: '5 000 FCFA',
    clients: '100',
    orders: '15',
    portfolio: false,
    sms: '50',
    support: 'Email',
  },
  {
    name: 'Pro',
    price: '10 000 FCFA',
    clients: 'Illimité',
    orders: '20',
    portfolio: true,
    sms: '200',
    support: 'Prioritaire',
  },
  {
    name: 'Premium',
    price: '20 000 FCFA',
    clients: 'Illimité',
    orders: 'Illimité',
    portfolio: true,
    sms: '500',
    support: 'Dédié',
  },
]

interface PlanComparisonProps {
  currentPlan: string
}

export function PlanComparison({ currentPlan }: PlanComparisonProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left text-gray-500 font-medium pr-4">Fonctionnalité</th>
            {PLANS.map((p) => (
              <th
                key={p.name}
                className={`py-2 px-3 text-center font-semibold ${
                  p.name === currentPlan ? 'text-indigo-600' : 'text-gray-900'
                }`}
              >
                {p.name}
                {p.name === currentPlan && (
                  <span className="ml-1 text-xs font-normal text-indigo-400">(actuel)</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          <Row label="Prix/mois" values={PLANS.map((p) => p.price)} />
          <Row label="Clients max" values={PLANS.map((p) => p.clients)} />
          <Row label="Commandes actives" values={PLANS.map((p) => p.orders)} />
          <Row label="Crédits SMS" values={PLANS.map((p) => p.sms)} />
          <BoolRow label="Portfolio public" values={PLANS.map((p) => p.portfolio)} />
          <Row label="Support" values={PLANS.map((p) => p.support)} />
        </tbody>
      </table>
    </div>
  )
}

function Row({ label, values }: { label: string; values: string[] }) {
  return (
    <tr>
      <td className="py-2.5 pr-4 text-gray-600">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="py-2.5 px-3 text-center text-gray-900">{v}</td>
      ))}
    </tr>
  )
}

function BoolRow({ label, values }: { label: string; values: boolean[] }) {
  return (
    <tr>
      <td className="py-2.5 pr-4 text-gray-600">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="py-2.5 px-3 text-center">
          {v ? (
            <Check className="h-4 w-4 text-emerald-500 mx-auto" />
          ) : (
            <X className="h-4 w-4 text-gray-300 mx-auto" />
          )}
        </td>
      ))}
    </tr>
  )
}
