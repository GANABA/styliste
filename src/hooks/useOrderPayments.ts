'use client'

import { useState, useEffect, useCallback } from 'react'

interface Payment {
  id: string
  amount: number
  paymentType: string
  paymentMethod: string
  mobileMoneyProvider: string | null
  paymentDate: string
  notes: string | null
  paymentStatus: string
}

export function useOrderPayments(orderId: string) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchPayments = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/payments`)
      if (!res.ok) return
      const data = await res.json()
      setPayments(data.payments)
    } finally {
      setIsLoading(false)
    }
  }, [orderId])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  return { payments, isLoading, refetch: fetchPayments }
}
