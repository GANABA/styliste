'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, LayoutDashboard, Users, Menu, X, LogOut, ChevronRight } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Dashboard',  href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Stylistes',  href: '/admin/stylists',  icon: Users },
]

function getBreadcrumb(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean).slice(1)
  if (segments.length === 0) return 'Admin'
  const labels: Record<string, string> = {
    dashboard: 'Dashboard',
    stylists: 'Stylistes',
  }
  return segments.map((s) => labels[s] ?? s).join(' › ')
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={cn(
        'fixed md:static inset-y-0 left-0 z-50',
        'w-[240px] flex flex-col bg-stone-950',
        'transform transition-transform duration-300 ease-in-out md:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Amber accent strip */}
        <div className="h-0.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 shrink-0" />

        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
              <Shield className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div>
              <p
                className="text-sm font-black text-white leading-none"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                Styliste<span className="text-amber-400">.com</span>
              </p>
              <p className="text-[9px] text-stone-500 uppercase tracking-[0.18em] font-semibold mt-0.5">
                Administration
              </p>
            </div>
          </div>
          <button
            className="md:hidden h-7 w-7 flex items-center justify-center rounded-md text-stone-500 hover:text-white transition-colors"
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer le menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = href === '/admin/dashboard'
              ? pathname === href
              : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all duration-150',
                  active
                    ? 'bg-amber-400/10 text-amber-400 font-semibold'
                    : 'text-stone-400 hover:bg-stone-800 hover:text-stone-100'
                )}
              >
                <Icon className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  active ? 'text-amber-400' : 'text-stone-500 group-hover:text-stone-300'
                )} />
                <span className="flex-1">{label}</span>
                {active && (
                  <span className="w-1 h-4 rounded-full bg-amber-400 shrink-0" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Déconnexion */}
        <div className="p-3 border-t border-stone-800 shrink-0">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-stone-500 hover:bg-red-950/60 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">

        {/* Topbar */}
        <header className="h-14 border-b border-stone-200 bg-white flex items-center px-4 md:px-6 gap-3 shrink-0">
          {/* Hamburger mobile */}
          <button
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm min-w-0">
            <Shield className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <ChevronRight className="h-3 w-3 text-stone-300 shrink-0" />
            <span className="font-semibold text-stone-800 truncate">
              {getBreadcrumb(pathname)}
            </span>
          </div>
        </header>

        {/* Contenu */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
