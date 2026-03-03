'use client'

import { OrderStatus } from '@prisma/client'
import { cn } from '@/lib/utils'

interface TabConfig {
  value: string
  label: string
  status?: OrderStatus
}

const TABS: TabConfig[] = [
  { value: 'all',         label: 'Tous' },
  { value: 'QUOTE',       label: 'Devis',    status: OrderStatus.QUOTE },
  { value: 'IN_PROGRESS', label: 'En cours', status: OrderStatus.IN_PROGRESS },
  { value: 'READY',       label: 'Prêt',     status: OrderStatus.READY },
  { value: 'DELIVERED',   label: 'Livré',    status: OrderStatus.DELIVERED },
  { value: 'CANCELED',    label: 'Annulé',   status: OrderStatus.CANCELED },
]

interface OrderStatusTabsProps {
  activeTab: string
  counts: Partial<Record<string, number>>
  onTabChange: (tab: string) => void
}

export function OrderStatusTabs({ activeTab, counts, onTabChange }: OrderStatusTabsProps) {
  const totalCount = Object.values(counts).reduce((sum, c) => (sum ?? 0) + (c ?? 0), 0) ?? 0

  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1">
      {TABS.map((tab) => {
        const count = tab.value === 'all' ? totalCount : (counts[tab.value] ?? 0)
        const isActive = activeTab === tab.value

        return (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors shrink-0',
              isActive
                ? 'bg-blue-600 text-white font-medium'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            )}
          >
            {tab.label}
            {(count ?? 0) > 0 && (
              <span className={cn(
                'text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center',
                isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
              )}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
