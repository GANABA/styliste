'use client'

import Link from 'next/link'
import { useOrders } from '@/hooks/useOrders'
import { OrdersList } from '@/components/orders/OrdersList'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'

export function OrdersPageClient() {
  const { orders, activeCount, activeLimit, isLoading, error } = useOrders()

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gérez vos commandes et leur avancement
          </p>
        </div>
        <Button asChild className="min-h-[44px]">
          <Link href="/dashboard/orders/new">
            <Plus className="h-4 w-4 mr-1.5" />
            Nouvelle
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <OrdersList
          orders={orders}
          activeCount={activeCount}
          activeLimit={activeLimit}
        />
      )}
    </div>
  )
}
