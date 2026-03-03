'use client'

import { OrderHistory, OrderChangeType } from '@/types/orders'
import { cn } from '@/lib/utils'
import {
  ArrowRight,
  DollarSign,
  Calendar,
  FileText,
  Info,
} from 'lucide-react'

interface OrderTimelineProps {
  history: OrderHistory[]
}

const CHANGE_TYPE_ICON: Record<OrderChangeType, React.ElementType> = {
  STATUS_CHANGE:      ArrowRight,
  PRICE_CHANGE:       DollarSign,
  DATE_CHANGE:        Calendar,
  DESCRIPTION_CHANGE: FileText,
  OTHER:              Info,
}

const STATUS_LABELS: Record<string, string> = {
  QUOTE:       'Devis',
  IN_PROGRESS: 'En cours',
  READY:       'Prêt',
  DELIVERED:   'Livré',
  CANCELED:    'Annulé',
}

function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  }).format(new Date(date))
}

function describeChange(entry: OrderHistory): string {
  if (entry.changeType === 'STATUS_CHANGE' && entry.oldValue && entry.newValue) {
    const from = STATUS_LABELS[entry.oldValue] ?? entry.oldValue
    const to = STATUS_LABELS[entry.newValue] ?? entry.newValue
    return `Statut : ${from} → ${to}`
  }
  if (entry.comment) return entry.comment
  if (entry.fieldName) return `Modification : ${entry.fieldName}`
  return 'Modification'
}

export function OrderTimeline({ history }: OrderTimelineProps) {
  if (history.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">Aucune modification enregistrée</p>
    )
  }

  return (
    <div className="relative">
      {/* Ligne verticale */}
      <div className="absolute left-4 top-4 bottom-4 w-px bg-gray-200" />

      <div className="flex flex-col gap-4">
        {history.map((entry) => {
          const Icon = CHANGE_TYPE_ICON[entry.changeType] ?? Info
          return (
            <div key={entry.id} className="flex items-start gap-3 pl-0">
              {/* Icône */}
              <div className={cn(
                'relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0',
                entry.changeType === 'STATUS_CHANGE'
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200'
              )}>
                <Icon className={cn(
                  'h-3.5 w-3.5',
                  entry.changeType === 'STATUS_CHANGE' ? 'text-blue-600' : 'text-gray-500'
                )} />
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm text-gray-800">{describeChange(entry)}</p>
                {entry.comment && entry.changeType !== 'STATUS_CHANGE' && (
                  <p className="text-xs text-gray-500 mt-0.5">{entry.comment}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">{formatDateTime(entry.createdAt)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
