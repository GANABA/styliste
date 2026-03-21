'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export function AdminNav() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-stone-500 hover:bg-red-50 hover:text-red-600 transition-colors"
    >
      <LogOut className="h-4 w-4" />
      Se déconnecter
    </button>
  )
}
