'use client'

import { useState, useEffect, useCallback } from 'react'
import { OrderListItem, OrderWithRelations, CreateOrderInput, UpdateOrderInput, OrderStatus } from '@/types/orders'

interface UseOrdersOptions {
  status?: OrderStatus
}

interface OrdersState {
  orders: OrderListItem[]
  activeCount: number
  activeLimit: number
  isLoading: boolean
  error: string | null
}

export function useOrders(options?: UseOrdersOptions) {
  const [state, setState] = useState<OrdersState>({
    orders: [],
    activeCount: 0,
    activeLimit: 15,
    isLoading: true,
    error: null,
  })

  const fetchOrders = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const params = new URLSearchParams()
      if (options?.status) params.set('status', options.status)

      const res = await fetch(`/api/orders?${params}`)
      if (!res.ok) throw new Error('Erreur lors du chargement des commandes')

      const data = await res.json()
      setState({
        orders: data.orders,
        activeCount: data.meta.activeCount,
        activeLimit: data.meta.activeLimit,
        isLoading: false,
        error: null,
      })
    } catch (err: any) {
      setState((prev) => ({ ...prev, isLoading: false, error: err.message }))
    }
  }, [options?.status])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const createOrder = async (input: CreateOrderInput): Promise<OrderWithRelations> => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Erreur création commande')
    }
    const order = await res.json()
    await fetchOrders()
    return order
  }

  const deleteOrder = async (id: string): Promise<void> => {
    const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Erreur suppression commande')
    }
    await fetchOrders()
  }

  return {
    ...state,
    refetch: fetchOrders,
    createOrder,
    deleteOrder,
  }
}

export function useOrder(id: string) {
  const [order, setOrder] = useState<OrderWithRelations | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/orders/${id}`)
      if (!res.ok) {
        if (res.status === 404) throw new Error('Commande introuvable')
        throw new Error('Erreur serveur')
      }
      setOrder(await res.json())
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => { fetchOrder() }, [fetchOrder])

  const updateOrder = async (input: UpdateOrderInput): Promise<void> => {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Erreur mise à jour')
    }
    await fetchOrder()
  }

  return { order, isLoading, error, refetch: fetchOrder, updateOrder }
}
