'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon, LayoutDashboard, Users, ShoppingBag, Calendar, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
}

export const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Clients',
    href: '/dashboard/clients',
    icon: Users,
    disabled: true,
  },
  {
    label: 'Commandes',
    href: '/dashboard/orders',
    icon: ShoppingBag,
    disabled: true,
  },
  {
    label: 'Calendrier',
    href: '/dashboard/calendar',
    icon: Calendar,
    disabled: true,
  },
  {
    label: 'Paramètres',
    href: '/dashboard/settings',
    icon: Settings,
    disabled: true,
  },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="Navigation principale">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.disabled ? '#' : item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
              'hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              isActive && 'bg-blue-50 text-blue-700 font-medium',
              !isActive && 'text-gray-700',
              item.disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent'
            )}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            aria-disabled={item.disabled}
            onClick={(e) => {
              if (item.disabled) {
                e.preventDefault();
              }
            }}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
            {item.disabled && (
              <span className="ml-auto text-xs text-gray-400">Bientôt</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
