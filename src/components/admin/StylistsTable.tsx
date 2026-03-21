'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { SuspendDialog } from './SuspendDialog'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Users, ShoppingBag, Calendar, Ban, CheckCircle2, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Stylist {
  id: string
  name: string
  email: string
  suspended: boolean
  createdAt: string
  plan: string
  clientCount: number
  orderCount: number
}

interface StylistsTableProps {
  stylists: Stylist[]
  onRefresh: () => void
}

const PLANS = ['Découverte', 'Standard', 'Pro', 'Premium']

const PLAN_BADGE: Record<string, string> = {
  'Découverte': 'bg-stone-100 text-stone-600 border-stone-200',
  'Standard':   'bg-amber-50 text-amber-700 border-amber-200',
  'Pro':        'bg-amber-100 text-amber-800 border-amber-300',
  'Premium':    'bg-amber-400 text-stone-950 border-amber-500',
}

function PlanSelect({ value, userId, onSuccess }: { value: string; userId: string; onSuccess: () => void }) {
  const handleChange = async (planName: string) => {
    const res = await fetch(`/api/admin/stylists/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planName }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success(`Plan mis à jour : ${planName}`)
      onSuccess()
    } else {
      toast.error(data.error ?? 'Erreur')
    }
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className={cn('h-7 w-32 text-xs border font-medium', PLAN_BADGE[value] ?? 'bg-stone-100 text-stone-600 border-stone-200')}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PLANS.map((p) => (
          <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function StatusBadge({ suspended }: { suspended: boolean }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full border',
      suspended
        ? 'bg-red-50 text-red-600 border-red-200'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', suspended ? 'bg-red-500' : 'bg-emerald-500')} />
      {suspended ? 'Suspendu' : 'Actif'}
    </span>
  )
}

export function StylistsTable({ stylists, onRefresh }: StylistsTableProps) {
  const [suspendTarget, setSuspendTarget] = useState<Stylist | null>(null)

  if (stylists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-stone-100 text-center">
        <div className="w-12 h-12 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center mb-3">
          <Users className="h-5 w-5 text-stone-300" />
        </div>
        <p className="text-sm text-stone-500 font-medium">Aucun styliste trouvé</p>
        <p className="text-xs text-stone-400 mt-1">Modifiez vos filtres pour afficher des résultats</p>
      </div>
    )
  }

  return (
    <>
      {/* ── TABLE DESKTOP (md+) ── */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/80">
              <th className="px-5 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wide">Styliste</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wide">Plan</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-stone-500 uppercase tracking-wide">Clients</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-stone-500 uppercase tracking-wide">Commandes</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wide">Inscription</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wide">Statut</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-stone-500 uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {stylists.map((s) => (
              <tr key={s.id} className="group hover:bg-stone-50/70 transition-colors">
                <td className="px-5 py-3.5">
                  <Link href={`/admin/stylists/${s.id}`} className="hover:text-amber-600 transition-colors">
                    <p className="font-semibold text-stone-900 text-sm leading-tight group-hover:text-amber-700 transition-colors">
                      {s.name}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">{s.email}</p>
                  </Link>
                </td>
                <td className="px-4 py-3.5">
                  <PlanSelect value={s.plan} userId={s.id} onSuccess={onRefresh} />
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className="text-sm font-semibold text-stone-700 tabular-nums">{s.clientCount}</span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className="text-sm font-semibold text-stone-700 tabular-nums">{s.orderCount}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs text-stone-400">
                    {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true, locale: fr })}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge suspended={s.suspended} />
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    onClick={() => setSuspendTarget(s)}
                    className={cn(
                      'inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all',
                      s.suspended
                        ? 'text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                        : 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100'
                    )}
                  >
                    {s.suspended
                      ? <><CheckCircle2 className="h-3 w-3" /> Réactiver</>
                      : <><Ban className="h-3 w-3" /> Suspendre</>
                    }
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── CARDS MOBILE (<md) ── */}
      <div className="md:hidden space-y-3">
        {stylists.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            {/* Header card */}
            <div className="flex items-start justify-between p-4 pb-3">
              <div className="min-w-0 flex-1">
                <Link href={`/admin/stylists/${s.id}`} className="flex items-center gap-1 group">
                  <p className="font-bold text-stone-900 truncate group-hover:text-amber-600 transition-colors">
                    {s.name}
                  </p>
                  <ChevronRight className="h-3.5 w-3.5 text-stone-300 shrink-0" />
                </Link>
                <p className="text-xs text-stone-400 mt-0.5 truncate">{s.email}</p>
              </div>
              <StatusBadge suspended={s.suspended} />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 divide-x divide-stone-100 border-y border-stone-100 bg-stone-50/50">
              <div className="flex flex-col items-center py-2.5 gap-0.5">
                <p className="text-base font-black text-stone-800 tabular-nums">{s.clientCount}</p>
                <p className="text-[10px] text-stone-400 uppercase tracking-wide font-medium">Clients</p>
              </div>
              <div className="flex flex-col items-center py-2.5 gap-0.5">
                <p className="text-base font-black text-stone-800 tabular-nums">{s.orderCount}</p>
                <p className="text-[10px] text-stone-400 uppercase tracking-wide font-medium">Commandes</p>
              </div>
              <div className="flex flex-col items-center py-2.5 gap-0.5">
                <p className="text-[10px] text-stone-500 text-center leading-tight">
                  {formatDistanceToNow(new Date(s.createdAt), { addSuffix: false, locale: fr })}
                </p>
                <p className="text-[10px] text-stone-400 uppercase tracking-wide font-medium">Inscription</p>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center gap-2 p-3">
              <div className="flex-1">
                <PlanSelect value={s.plan} userId={s.id} onSuccess={onRefresh} />
              </div>
              <button
                onClick={() => setSuspendTarget(s)}
                className={cn(
                  'flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg border transition-all',
                  s.suspended
                    ? 'text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                    : 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100'
                )}
              >
                {s.suspended
                  ? <><CheckCircle2 className="h-3 w-3" /> Réactiver</>
                  : <><Ban className="h-3 w-3" /> Suspendre</>
                }
              </button>
            </div>
          </div>
        ))}
      </div>

      {suspendTarget && (
        <SuspendDialog
          open={!!suspendTarget}
          onClose={() => setSuspendTarget(null)}
          onSuccess={() => { setSuspendTarget(null); onRefresh() }}
          userId={suspendTarget.id}
          userName={suspendTarget.name}
          isSuspended={suspendTarget.suspended}
        />
      )}
    </>
  )
}
