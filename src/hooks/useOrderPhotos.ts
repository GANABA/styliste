'use client'

import { useState, useEffect, useCallback } from 'react'
import { OrderPhoto } from '@/types/orders'

export function useOrderPhotos(orderId: string) {
  const [photos, setPhotos] = useState<OrderPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPhotos = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/photos`)
      if (!res.ok) throw new Error('Erreur chargement photos')
      setPhotos(await res.json())
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [orderId])

  useEffect(() => { fetchPhotos() }, [fetchPhotos])

  const deletePhoto = async (photoId: string): Promise<void> => {
    const res = await fetch(`/api/orders/${orderId}/photos/${photoId}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Erreur suppression photo')
    }
    await fetchPhotos()
  }

  return { photos, isLoading, error, refetch: fetchPhotos, deletePhoto }
}
