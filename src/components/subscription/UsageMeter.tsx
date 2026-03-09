'use client'

interface UsageMeterProps {
  label: string
  current: number
  limit: number // -1 = illimité
}

export function UsageMeter({ label, current, limit }: UsageMeterProps) {
  const isUnlimited = limit === -1 || limit === 0
  const percent = isUnlimited ? 0 : Math.min(100, Math.round((current / limit) * 100))

  const color =
    percent >= 90
      ? 'bg-red-500'
      : percent >= 70
      ? 'bg-amber-500'
      : 'bg-emerald-500'

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">
          {current}
          {!isUnlimited && <span className="text-gray-400"> / {limit}</span>}
          {isUnlimited && <span className="text-gray-400"> / ∞</span>}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-2 w-full rounded-full bg-gray-100">
          <div
            className={`h-2 rounded-full transition-all ${color}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
      {isUnlimited && (
        <div className="h-2 w-full rounded-full bg-emerald-100">
          <div className="h-2 w-full rounded-full bg-emerald-400 opacity-40" />
        </div>
      )}
    </div>
  )
}
