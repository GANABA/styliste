'use client'

import { Check } from 'lucide-react'
import Link from 'next/link'

interface Step {
  id: number
  label: string
  description: string
  href: string
  done: boolean
}

interface OnboardingChecklistProps {
  steps: Step[]
}

export function OnboardingChecklist({ steps }: OnboardingChecklistProps) {
  const completed = steps.filter((s) => s.done).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Progression</span>
        <span className="font-semibold text-gray-900">{completed}/{steps.length}</span>
      </div>

      {/* Barre de progression */}
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className="h-2 rounded-full bg-indigo-500 transition-all"
          style={{ width: `${(completed / steps.length) * 100}%` }}
        />
      </div>

      {/* Étapes */}
      <div className="space-y-2 pt-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-start gap-3 rounded-xl p-3 transition-all ${
              step.done ? 'bg-emerald-50' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                step.done
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-gray-300 bg-white'
              }`}
            >
              {step.done ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <span className="text-xs font-semibold text-gray-400">{step.id}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${step.done ? 'text-emerald-700 line-through' : 'text-gray-900'}`}>
                {step.label}
              </p>
              <p className="text-xs text-gray-500">{step.description}</p>
            </div>
            {!step.done && (
              <Link
                href={step.href}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium shrink-0"
              >
                Faire →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
