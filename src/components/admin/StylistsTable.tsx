'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SuspendDialog } from './SuspendDialog'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

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

export function StylistsTable({ stylists, onRefresh }: StylistsTableProps) {
  const [suspendTarget, setSuspendTarget] = useState<Stylist | null>(null)

  const handleChangePlan = async (userId: string, planName: string) => {
    const res = await fetch(`/api/admin/stylists/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planName }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success(`Plan mis à jour : ${planName}`)
      onRefresh()
    } else {
      toast.error(data.error ?? 'Erreur')
    }
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Styliste</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Plan</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Clients</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Commandes</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Inscription</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Statut</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stylists.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  Aucun styliste trouvé
                </td>
              </tr>
            )}
            {stylists.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Select
                    value={s.plan}
                    onValueChange={(v) => handleChangePlan(s.id, v)}
                  >
                    <SelectTrigger className="h-8 w-36 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLANS.map((p) => (
                        <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 text-center text-gray-700">{s.clientCount}</td>
                <td className="px-4 py-3 text-center text-gray-700">{s.orderCount}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true, locale: fr })}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={s.suspended ? 'destructive' : 'secondary'}>
                    {s.suspended ? 'Suspendu' : 'Actif'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant={s.suspended ? 'outline' : 'ghost'}
                    className={s.suspended ? 'text-emerald-600 hover:text-emerald-700' : 'text-red-600 hover:text-red-700'}
                    onClick={() => setSuspendTarget(s)}
                  >
                    {s.suspended ? 'Réactiver' : 'Suspendre'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
