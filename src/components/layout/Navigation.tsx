'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LucideIcon,
  LayoutDashboard, Users, ShoppingBag, Calendar,
  CreditCard, Ruler, ImageIcon, Settings, BadgeCheck, HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  disabled?: boolean
  section?: string
}

export const navigationItems: NavItem[] = [
  { label: 'Dashboard',   href: '/dashboard',                        icon: LayoutDashboard, section: 'principal' },
  { label: 'Clients',     href: '/dashboard/clients',                icon: Users,           section: 'principal' },
  { label: 'Commandes',   href: '/dashboard/orders',                 icon: ShoppingBag,     section: 'principal' },
  { label: 'Paiements',   href: '/dashboard/payments',               icon: CreditCard,      section: 'principal' },
  { label: 'Planning',    href: '/dashboard/calendar',               icon: Calendar,        section: 'principal' },
  { label: 'Mesures',     href: '/dashboard/measurements/templates', icon: Ruler,           section: 'atelier' },
  { label: 'Portfolio',   href: '/dashboard/portfolio',              icon: ImageIcon,       section: 'atelier' },
  { label: 'Abonnement',  href: '/dashboard/subscription',          icon: BadgeCheck,      section: 'compte' },
  { label: 'Paramètres',  href: '/dashboard/settings',              icon: Settings,        section: 'compte' },
  { label: 'Aide',        href: '/dashboard/help',                   icon: HelpCircle,      section: 'compte' },
]

const SECTIONS: Record<string, string> = {
  principal: 'Principal',
  atelier:   'Atelier',
  compte:    'Compte',
}

export function Navigation() {
  const pathname = usePathname()

  const grouped = navigationItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const section = item.section ?? 'principal'
    if (!acc[section]) acc[section] = []
    acc[section].push(item)
    return acc
  }, {})

  return (
    <nav className="flex flex-col gap-4" aria-label="Navigation principale">
      {Object.entries(grouped).map(([section, items]) => (
        <div key={section}>
          <p className="px-3 mb-1 text-[10px] font-bold tracking-widest uppercase text-stone-400">
            {SECTIONS[section]}
          </p>
          <div className="flex flex-col gap-0.5">
            {items.map((item) => {
              const Icon = item.icon
              const isActive = item.href === '/dashboard'
                ? pathname === item.href
                : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.disabled ? '#' : item.href}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
                    isActive
                      ? 'bg-amber-50 text-amber-700 font-semibold'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
                    item.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-stone-600'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  aria-disabled={item.disabled}
                  onClick={(e) => item.disabled && e.preventDefault()}
                >
                  <Icon className={cn(
                    'h-4 w-4 shrink-0',
                    isActive ? 'text-amber-600' : 'text-stone-400'
                  )} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500" />
                  )}
                  {item.disabled && (
                    <span className="ml-auto text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-md">
                      Bientôt
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}
