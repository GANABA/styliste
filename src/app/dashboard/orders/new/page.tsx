'use client'

import { useRouter } from 'next/navigation'
import { OrderForm } from '@/components/orders/OrderForm'
import { CreateOrderInput } from '@/types/orders'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewOrderPage() {
  const router = useRouter()

  const handleCreate = async (data: CreateOrderInput) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const body = await res.json()
      throw new Error(body.error || 'Erreur création')
    }
    const order = await res.json()
    router.push(`/dashboard/orders/${order.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/orders"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour aux commandes
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle commande</h1>
        <p className="text-sm text-gray-500 mt-1">Créer une commande pour un client</p>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <OrderForm mode="create" onSubmit={handleCreate as any} />
      </div>
    </div>
  )
}
