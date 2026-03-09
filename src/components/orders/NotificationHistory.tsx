'use client'

import { Notification } from '@prisma/client'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'

interface NotificationHistoryProps {
  notifications: Notification[]
}

const TYPE_LABELS: Record<string, string> = {
  ORDER_READY: 'Commande prête',
  PAYMENT_REMINDER: 'Rappel paiement',
  PICKUP_REMINDER: 'Rappel retrait',
}

function formatDate(date: Date | string | null): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function NotificationHistory({ notifications }: NotificationHistoryProps) {
  if (notifications.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">Aucune notification envoyée</p>
    )
  }

  return (
    <div className="space-y-2">
      {notifications.map((n) => (
        <div key={n.id} className="flex items-center gap-3 py-2">
          {n.status === 'SENT' ? (
            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
          ) : n.status === 'FAILED' ? (
            <XCircle className="h-4 w-4 text-red-400 shrink-0" />
          ) : (
            <Clock className="h-4 w-4 text-gray-400 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700">
              {TYPE_LABELS[n.type] ?? n.type}
              <span className="text-gray-400 ml-1 text-xs">via email</span>
            </p>
            <p className="text-xs text-gray-400">
              {formatDate(n.sentAt ?? n.createdAt)}
            </p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            n.status === 'SENT'
              ? 'bg-green-100 text-green-700'
              : n.status === 'FAILED'
              ? 'bg-red-100 text-red-600'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {n.status === 'SENT' ? 'Envoyé' : n.status === 'FAILED' ? 'Échec' : 'En attente'}
          </span>
        </div>
      ))}
    </div>
  )
}
