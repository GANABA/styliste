'use client'

import { useParams } from 'next/navigation'
import { useOrder } from '@/hooks/useOrders'
import { OrderDetail } from '@/components/orders/OrderDetail'
import { ChevronLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function OrderDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { order, isLoading, error, refetch } = useOrder(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-2 min-h-[44px] -mx-2 px-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">
          {error ?? 'Commande introuvable'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-2 min-h-[44px] -mx-2 px-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Toutes les commandes
      </Link>
      <OrderDetail order={order} onRefresh={refetch} />
    </div>
  )
}
