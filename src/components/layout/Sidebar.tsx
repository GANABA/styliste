'use client';

import { useEffect, memo } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { Navigation } from './Navigation';
import { useSidebarStore } from '@/store/useSidebarStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

function SidebarComponent() {
  const { isOpen, close } = useSidebarStore();
  const pathname = usePathname();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    close();
  }, [pathname, close]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay - Mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-50',
          'w-[280px] border-r bg-white h-full flex flex-col',
          'transform transition-transform duration-300 ease-in-out',
          'md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand / Logo */}
        <div className="px-6 py-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Styliste.com</h2>
            <p className="text-sm text-gray-500 mt-1">Gestion Atelier</p>
          </div>

          {/* Close button - Mobile only */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={close}
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-6 overflow-y-auto">
          <Navigation />
        </div>

        {/* Footer - Version info */}
        <div className="px-6 py-4 border-t text-xs text-gray-400">
          <p>Version 0.1.0 (MVP)</p>
        </div>
      </aside>
    </>
  );
}

export const Sidebar = memo(SidebarComponent);
