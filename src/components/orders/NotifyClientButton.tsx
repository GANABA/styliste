'use client'

import { useState } from 'react'
import { Bell, ChevronDown } from 'lucide-react'
import { NotificationType } from '@prisma/client'

interface NotifyClientButtonProps {
  hasEmail: boolean
  orderStatus: string
  paymentStatus: string
  onSend: (type: NotificationType) => Promise<boolean>
  sending: boolean
}

const NOTIFICATION_OPTIONS: { type: NotificationType; label: string; description: string }[] = [
  {
    type: 'ORDER_READY',
    label: 'Commande prête',
    description: 'Informer le client que sa commande est terminée',
  },
  {
    type: 'PAYMENT_REMINDER',
    label: 'Rappel paiement',
    description: 'Rappeler le solde restant dû',
  },
  {
    type: 'PICKUP_REMINDER',
    label: 'Rappel retrait',
    description: 'Inviter le client à venir récupérer sa commande',
  },
]

export function NotifyClientButton({
  hasEmail,
  orderStatus,
  paymentStatus,
  onSend,
  sending,
}: NotifyClientButtonProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<NotificationType | null>(null)

  const handleSelect = async (type: NotificationType) => {
    setOpen(false)
    setSelected(type)
    await onSend(type)
    setSelected(null)
  }

  const isDisabled = !hasEmail || sending

  if (!hasEmail) {
    return (
      <div
        title="Ce client n'a pas d'adresse email"
        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-400 text-sm cursor-not-allowed select-none"
      >
        <Bell className="h-4 w-4" />
        <span>Notifier le client</span>
        <span className="text-xs">(pas d&apos;email)</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={isDisabled}
        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-700 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Bell className="h-4 w-4" />
        <span>{sending && selected ? 'Envoi...' : 'Notifier le client'}</span>
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
            {NOTIFICATION_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                onClick={() => handleSelect(opt.type)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
              >
                <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
