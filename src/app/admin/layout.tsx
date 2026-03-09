import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, Shield } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Stylistes', href: '/admin/stylists', icon: Users },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Admin */}
      <aside className="hidden md:flex w-56 flex-col bg-gray-900 text-white">
        <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-700">
          <Shield className="h-5 w-5 text-red-400" />
          <span className="font-semibold text-sm">Administration</span>
        </div>
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-gray-700">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Retour au dashboard
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="md:hidden flex items-center gap-2 bg-gray-900 text-white px-4 py-3">
          <Shield className="h-4 w-4 text-red-400" />
          <span className="font-medium text-sm">Admin</span>
          <div className="ml-auto flex gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-xs text-gray-300 hover:text-white px-2 py-1">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
