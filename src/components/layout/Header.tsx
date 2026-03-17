'use client'

import { memo } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, User, CreditCard, LogOut, ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { navigationItems } from './Navigation'

interface HeaderProps {
  onMenuClick?: () => void
}

function getUserInitials(name?: string | null): string {
  if (!name) return 'S'
  const parts = name.trim().split(' ')
  return parts.length === 1
    ? parts[0].substring(0, 2).toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Retrouve le label de la page courante
function usePageTitle(pathname: string): string {
  if (pathname === '/dashboard') return 'Dashboard'
  const match = navigationItems.find(
    (item) => item.href !== '/dashboard' && pathname.startsWith(item.href)
  )
  return match?.label ?? 'Dashboard'
}

function HeaderComponent({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const pageTitle = usePageTitle(pathname)

  return (
    <header className={cn(
      'h-14 border-b border-border bg-background/95 backdrop-blur-sm',
      'px-4 md:px-6 flex items-center justify-between gap-4',
      'sticky top-0 z-30 transition-colors duration-200'
    )}>
      {/* Gauche : hamburger (mobile) + breadcrumb (desktop) */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden flex items-center justify-center h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          onClick={onMenuClick}
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo mobile */}
        <span
          className="md:hidden text-lg font-black"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          Styliste<span className="text-amber-500">.com</span>
        </span>

        {/* Breadcrumb desktop */}
        <div className="hidden md:flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">Atelier</span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          <span className="font-semibold text-foreground">{pageTitle}</span>
        </div>
      </div>

      {/* Droite : avatar + dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Menu utilisateur"
            data-testid="user-menu-trigger"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs font-bold bg-amber-400 text-stone-950">
                {getUserInitials(session?.user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium leading-tight text-foreground">
                {session?.user?.name?.split(' ')[0] ?? 'Mon compte'}
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {session?.user?.email}
              </p>
            </div>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold">{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
            <User className="mr-2 h-4 w-4" />
            Mon profil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/dashboard/subscription')}>
            <CreditCard className="mr-2 h-4 w-4" />
            Abonnement
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-destructive focus:text-destructive"
            data-testid="logout-button"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

export const Header = memo(HeaderComponent)
