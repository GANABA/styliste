'use client'

interface UsageMeterProps {
  label: string
  current: number
  limit: number // -1 = illimité, 0 = non disponible sur ce plan, >0 = limite fixe
}

export function UsageMeter({ label, current, limit }: UsageMeterProps) {
  const isUnavailable = limit === 0
  const isUnlimited = limit === -1
  const percent = (!isUnavailable && !isUnlimited)
    ? Math.min(100, Math.round((current / limit) * 100))
    : 0

  const color =
    percent >= 90 ? 'bg-red-500'
    : percent >= 70 ? 'bg-amber-500'
    : 'bg-emerald-500'

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">
          {isUnavailable ? (
            <span className="text-gray-400 text-xs">Non disponible sur ce plan</span>
          ) : isUnlimited ? (
            <span className="text-gray-900">{current} <span className="text-gray-400">/ illimité</span></span>
          ) : (
            <span className="text-gray-900">{current} <span className="text-gray-400">/ {limit}</span></span>
          )}
        </span>
      </div>
      {isUnavailable ? (
        <div className="h-2 w-full rounded-full bg-gray-100" />
      ) : isUnlimited ? (
        <div className="h-2 w-full rounded-full bg-emerald-100">
          <div className="h-2 w-full rounded-full bg-emerald-400 opacity-40" />
        </div>
      ) : (
        <div className="h-2 w-full rounded-full bg-gray-100">
          <div
            className={`h-2 rounded-full transition-all ${color}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  )
}
