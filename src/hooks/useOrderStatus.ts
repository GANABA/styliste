'use client'

import { useState } from 'react'
import { OrderStatus } from '@/types/orders'

export function useOrderStatus(orderId: string, onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const transition = async (
    newStatus: OrderStatus,
    cancellationReason?: string,
    actualDeliveryDate?: string
  ): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, cancellationReason, actualDeliveryDate }),
      })
      if (!res.ok) {
        const data = await res.json()
        if (data.error === 'INVALID_TRANSITION') {
          throw new Error(`Transition invalide : ${data.from} → ${data.to}`)
        }
        if (data.error === 'CANCELLATION_REASON_REQUIRED') {
          throw new Error('La raison d\'annulation est obligatoire')
        }
        throw new Error(data.error || 'Erreur transition statut')
      }
      onSuccess?.()
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { transition, isLoading, error }
}
