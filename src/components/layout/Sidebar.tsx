'use client'

import { useEffect, memo } from 'react'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { Navigation } from './Navigation'
import { ThemeToggle } from './ThemeToggle'
import { useSidebarStore } from '@/store/useSidebarStore'
import { cn } from '@/lib/utils'

function SidebarComponent() {
  const { isOpen, close } = useSidebarStore()
  const pathname = usePathname()

  useEffect(() => { close() }, [pathname, close])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — toujours sombre, style éditorial */}
      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-50',
          'w-[260px] h-full flex flex-col relative',
          'transform transition-transform duration-300 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ backgroundColor: 'hsl(var(--sidebar-bg))' }}
      >
        {/* Ligne décorative amber en haut */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5"
             style={{ borderBottom: '1px solid hsl(var(--sidebar-border))' }}>
          <div>
            <h2
              className="text-xl font-black leading-none"
              style={{ fontFamily: 'var(--font-playfair)', color: 'hsl(var(--sidebar-fg))' }}
            >
              Styliste<span className="text-amber-400">.com</span>
            </h2>
            <p className="text-[11px] mt-1 font-medium tracking-wider uppercase"
               style={{ color: 'hsl(var(--sidebar-muted))' }}>
              Gestion atelier
            </p>
          </div>

          {/* Bouton fermer — mobile uniquement */}
          <button
            className="md:hidden flex items-center justify-center h-8 w-8 rounded-lg hover:bg-stone-800 transition-colors"
            style={{ color: 'hsl(var(--sidebar-muted))' }}
            onClick={close}
            aria-label="Fermer le menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-5 overflow-y-auto">
          <Navigation />
        </div>

        {/* Footer sidebar */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid hsl(var(--sidebar-border))' }}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium"
               style={{ color: 'hsl(var(--sidebar-muted))' }}>
              v0.1 MVP
            </p>
            <ThemeToggle className="text-stone-500 hover:text-stone-200 hover:bg-stone-800" />
          </div>
        </div>
      </aside>
    </>
  )
}

export const Sidebar = memo(SidebarComponent)
