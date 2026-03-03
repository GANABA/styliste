'use client'

import Link from 'next/link'
import { OrderListItem } from '@/types/orders'
import { OrderStatusBadge } from './OrderStatusBadge'
import { Calendar, User, Banknote, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OrderCardProps {
  order: OrderListItem
  className?: string
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}

function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(new Date(date))
}

function isOverdue(promisedDate: Date | string, status: string): boolean {
  if (['DELIVERED', 'CANCELED'].includes(status)) return false
  return new Date(promisedDate) < new Date()
}

export function OrderCard({ order, className }: OrderCardProps) {
  const overdue = isOverdue(order.promisedDate, order.status)

  return (
    <Link href={`/dashboard/orders/${order.id}`}>
      <div
        className={cn(
          'bg-white rounded-xl border p-4 hover:shadow-md transition-shadow cursor-pointer',
          overdue && 'border-orange-200',
          className
        )}
      >
        {/* Header : numéro + statut */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="text-xs text-gray-400 font-mono">{order.orderNumber}</p>
            <p className="font-semibold text-gray-900 text-sm mt-0.5 line-clamp-1">
              {order.garmentType}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Infos */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{order.client.name}</span>
          </div>

          <div className={cn(
            'flex items-center gap-2 text-sm',
            overdue ? 'text-orange-600 font-medium' : 'text-gray-600'
          )}>
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>
              {overdue ? 'En retard · ' : ''}
              {formatDate(order.promisedDate)}
            </span>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Banknote className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="font-medium">{formatPrice(order.totalPrice)}</span>
            </div>

            {order._count.photos > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <ImageIcon className="h-3 w-3" />
                <span>{order._count.photos}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
