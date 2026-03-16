'use client'

import { useParams, useRouter } from 'next/navigation'
import { useOrder } from '@/hooks/useOrders'
import { OrderForm } from '@/components/orders/OrderForm'
import { CreateOrderInput, UpdateOrderInput } from '@/types/orders'
import { ChevronLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function EditOrderPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { order, isLoading, error } = useOrder(id)

  const handleUpdate = async (data: CreateOrderInput | UpdateOrderInput) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const body = await res.json()
      throw new Error(body.error || 'Erreur modification')
    }
    router.push(`/dashboard/orders/${id}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={`/dashboard/orders/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-2 min-h-[44px] -mx-2 px-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour à la commande
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Modifier la commande</h1>
        {order && (
          <p className="text-sm text-gray-500 mt-1">{order.orderNumber} — {order.garmentType}</p>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isLoading && !error && order && (
        <div className="bg-white rounded-xl border p-6">
          <OrderForm
            mode="edit"
            initialData={order}
            onSubmit={handleUpdate}
          />
        </div>
      )}
    </div>
  )
}
