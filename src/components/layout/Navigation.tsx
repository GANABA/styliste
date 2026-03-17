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
  { label: 'Dashboard',    href: '/dashboard',                        icon: LayoutDashboard, section: 'principal' },
  { label: 'Clients',      href: '/dashboard/clients',                icon: Users,           section: 'principal' },
  { label: 'Commandes',    href: '/dashboard/orders',                 icon: ShoppingBag,     section: 'principal' },
  { label: 'Paiements',    href: '/dashboard/payments',               icon: CreditCard,      section: 'principal' },
  { label: 'Planning',     href: '/dashboard/calendar',               icon: Calendar,        section: 'principal' },
  { label: 'Mesures',      href: '/dashboard/measurements/templates', icon: Ruler,           section: 'atelier' },
  { label: 'Portfolio',    href: '/dashboard/portfolio',              icon: ImageIcon,       section: 'atelier' },
  { label: 'Abonnement',   href: '/dashboard/subscription',          icon: BadgeCheck,      section: 'compte' },
  { label: 'Paramètres',   href: '/dashboard/settings',              icon: Settings,        section: 'compte' },
  { label: 'Aide',         href: '/help',                             icon: HelpCircle,      section: 'compte' },
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
    <nav className="flex flex-col gap-5" aria-label="Navigation principale">
      {Object.entries(grouped).map(([section, items]) => (
        <div key={section}>
          <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-widest uppercase"
             style={{ color: 'hsl(var(--sidebar-muted))' }}>
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
                    'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150',
                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400',
                    isActive
                      ? 'bg-amber-400/10 text-amber-400 font-medium'
                      : 'text-stone-400 hover:bg-stone-800 hover:text-stone-100',
                    item.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-stone-400'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  aria-disabled={item.disabled}
                  onClick={(e) => item.disabled && e.preventDefault()}
                >
                  {/* Indicateur actif */}
                  <span className={cn(
                    'absolute left-0 w-0.5 h-5 rounded-r-full bg-amber-400 transition-all duration-150',
                    isActive ? 'opacity-100' : 'opacity-0'
                  )} />

                  <Icon className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    isActive ? 'text-amber-400' : 'text-stone-500 group-hover:text-stone-300'
                  )} />
                  <span>{item.label}</span>

                  {item.disabled && (
                    <span className="ml-auto text-[10px] text-stone-600 font-medium">Bientôt</span>
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
