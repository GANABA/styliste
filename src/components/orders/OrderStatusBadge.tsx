'use client'

import { OrderStatus } from '@prisma/client'
import { cn } from '@/lib/utils'

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  QUOTE:       { label: 'Devis',    className: 'bg-gray-100 text-gray-700 border-gray-200' },
  IN_PROGRESS: { label: 'En cours', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  READY:       { label: 'Prêt',     className: 'bg-green-100 text-green-700 border-green-200' },
  DELIVERED:   { label: 'Livré',    className: 'bg-purple-100 text-purple-700 border-purple-200' },
  CANCELED:    { label: 'Annulé',   className: 'bg-red-100 text-red-700 border-red-200' },
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}

export { STATUS_CONFIG }
