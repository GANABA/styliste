'use client'

import { useState } from 'react'
import { OrderListItem, OrderStatus } from '@/types/orders'
import { OrderCard } from './OrderCard'
import { OrderStatusTabs } from './OrderStatusTabs'
import { ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface OrdersListProps {
  orders: OrderListItem[]
  activeCount: number
  activeLimit: number
}

function countByStatus(orders: OrderListItem[]): Partial<Record<string, number>> {
  return orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] ?? 0) + 1
    return acc
  }, {} as Partial<Record<string, number>>)
}

export function OrdersList({ orders, activeCount, activeLimit }: OrdersListProps) {
  const [activeTab, setActiveTab] = useState<string>('all')

  const counts = countByStatus(orders)

  const filtered = activeTab === 'all'
    ? orders
    : orders.filter((o) => o.status === activeTab)

  return (
    <div className="flex flex-col gap-4">
      {/* Capacité */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{activeCount}/{activeLimit} commandes actives</span>
        <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400 rounded-full transition-all"
            style={{ width: `${Math.min((activeCount / activeLimit) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Onglets */}
      <OrderStatusTabs
        activeTab={activeTab}
        counts={counts}
        onTabChange={setActiveTab}
      />

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <ShoppingBag className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm mb-4">
            {activeTab === 'all'
              ? 'Aucune commande pour le moment'
              : `Aucune commande avec le statut "${activeTab}"`}
          </p>
          {activeTab === 'all' && (
            <Button asChild size="sm">
              <Link href="/dashboard/orders/new">Créer une commande</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
