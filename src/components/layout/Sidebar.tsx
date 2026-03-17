'use client'

import { useEffect, memo } from 'react'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { Navigation } from './Navigation'
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
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — light, bord droit stone-200 */}
      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-50',
          'w-[256px] h-full flex flex-col bg-white border-r border-border',
          'transform transition-transform duration-300 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2
              className="text-xl font-black leading-none text-stone-900"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Styliste<span className="text-amber-500">.com</span>
            </h2>
            <p className="text-[11px] mt-0.5 font-medium tracking-widest uppercase text-stone-400">
              Gestion atelier
            </p>
          </div>

          <button
            className="md:hidden flex items-center justify-center h-8 w-8 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
            onClick={close}
            aria-label="Fermer le menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <Navigation />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border">
          <p className="text-[11px] text-stone-400 font-medium">v0.1 MVP</p>
        </div>
      </aside>
    </>
  )
}

export const Sidebar = memo(SidebarComponent)
