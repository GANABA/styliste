import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, Shield, ArrowLeft } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const navItems = [
    { label: 'Dashboard',  href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Stylistes',  href: '/admin/stylists',  icon: Users },
  ]

  return (
    <div className="flex min-h-screen bg-background">

      {/* ── Sidebar Admin (toujours sombre) ── */}
      <aside className="hidden md:flex w-56 flex-col" style={{ backgroundColor: 'hsl(var(--sidebar-bg))' }}>
        {/* Ligne décorative */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

        {/* Header */}
        <div className="px-5 py-5" style={{ borderBottom: '1px solid hsl(var(--sidebar-border))' }}>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-amber-400/10 flex items-center justify-center">
              <Shield className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-black text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
                Administration
              </p>
              <p className="text-[10px] text-stone-500 uppercase tracking-wider">Styliste.com</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 p-3 flex-1">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-stone-400 hover:bg-stone-800 hover:text-stone-100 transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Retour dashboard */}
        <div className="p-3" style={{ borderTop: '1px solid hsl(var(--sidebar-border))' }}>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-stone-500 hover:text-stone-300 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour au dashboard
          </Link>
        </div>
      </aside>

      {/* ── Mobile topbar ── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center gap-3 px-4 py-3" style={{ backgroundColor: 'hsl(var(--sidebar-bg))', borderBottom: '1px solid hsl(var(--sidebar-border))' }}>
        <Shield className="h-4 w-4 text-amber-400" />
        <span className="font-black text-sm text-white" style={{ fontFamily: 'var(--font-playfair)' }}>Admin</span>
        <div className="ml-auto flex gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-xs text-stone-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-stone-800 transition-colors">
              {item.label}
            </Link>
          ))}
          <Link href="/dashboard" className="text-xs text-stone-500 hover:text-white px-2 py-1.5">
            ← Dashboard
          </Link>
        </div>
      </div>

      {/* ── Contenu ── */}
      <main className="flex-1 overflow-auto pt-0 md:pt-0">
        <div className="md:hidden h-12" /> {/* spacer mobile topbar */}
        {children}
      </main>
    </div>
  )
}
