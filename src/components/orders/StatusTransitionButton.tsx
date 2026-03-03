'use client'

import { useState } from 'react'
import { OrderStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { CancellationModal } from './CancellationModal'
import { getNextStatuses, STATUS_NEXT_LABEL } from '@/lib/orders/status'
import { XCircle } from 'lucide-react'

interface StatusTransitionButtonProps {
  currentStatus: OrderStatus
  orderId: string
  onTransition: (newStatus: OrderStatus, cancellationReason?: string) => Promise<void>
}

export function StatusTransitionButton({
  currentStatus,
  orderId: _orderId,
  onTransition,
}: StatusTransitionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const nextStatuses = getNextStatuses(currentStatus)
  if (nextStatuses.length === 0) return null

  // Statut principal (premier dans la liste, ex: IN_PROGRESS si on est en QUOTE)
  const primaryNext = nextStatuses.find((s) => s !== OrderStatus.CANCELED)
  const canCancel = nextStatuses.includes(OrderStatus.CANCELED)

  const handlePrimary = async () => {
    if (!primaryNext) return
    setIsLoading(true)
    try {
      await onTransition(primaryNext)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async (reason: string) => {
    setIsLoading(true)
    try {
      await onTransition(OrderStatus.CANCELED, reason)
      setShowCancelModal(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        {primaryNext && (
          <Button
            onClick={handlePrimary}
            disabled={isLoading}
            className="flex-1 min-h-[44px]"
          >
            {isLoading ? 'En cours...' : STATUS_NEXT_LABEL[currentStatus]}
          </Button>
        )}
        {canCancel && (
          <Button
            variant="outline"
            onClick={() => setShowCancelModal(true)}
            disabled={isLoading}
            className="text-red-600 border-red-200 hover:bg-red-50 min-h-[44px]"
            title="Annuler la commande"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        )}
      </div>

      <CancellationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        isLoading={isLoading}
      />
    </>
  )
}
