import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, Shield } from 'lucide-react'
import { AdminNav } from '@/components/admin/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Stylistes', href: '/admin/stylists',  icon: Users },
  ]

  return (
    <div className="flex min-h-screen bg-background">

      {/* ── Sidebar Admin ── */}
      <aside className="hidden md:flex w-56 flex-col bg-white border-r border-border">
        {/* Accent top */}
        <div className="h-0.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />

        {/* Logo admin */}
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Shield className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-black text-stone-900" style={{ fontFamily: 'var(--font-playfair)' }}>
                Styliste<span className="text-amber-500">.com</span>
              </p>
              <p className="text-[10px] text-stone-400 uppercase tracking-wider font-medium">Administration</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 p-3 flex-1">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
            >
              <Icon className="h-4 w-4 text-stone-400" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-border">
          <AdminNav />
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar mobile */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-border">
          <Shield className="h-4 w-4 text-amber-600" />
          <span className="font-black text-sm text-stone-900" style={{ fontFamily: 'var(--font-playfair)' }}>
            Admin
          </span>
          <div className="ml-auto flex gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}
                className="text-xs text-stone-500 hover:text-stone-900 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
