'use client'

import { useState, useEffect, useCallback } from 'react'
import { StylistsTable } from '@/components/admin/StylistsTable'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Users, Search, SlidersHorizontal } from 'lucide-react'

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

export default function AdminStylistsPage() {
  const [stylists, setStylists]     = useState<Stylist[]>([])
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [plan, setPlan]             = useState('all')
  const [status, setStatus]         = useState('all')

  const fetchStylists = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (plan   && plan   !== 'all') params.set('plan', plan)
    if (status && status !== 'all') params.set('status', status)

    const res = await fetch(`/api/admin/stylists?${params.toString()}`)
    if (res.ok) {
      const data = await res.json()
      setStylists(data.stylists)
      setTotal(data.total)
    }
    setLoading(false)
  }, [search, plan, status])

  useEffect(() => {
    const t = setTimeout(fetchStylists, 300)
    return () => clearTimeout(t)
  }, [fetchStylists])

  const hasFilters = plan !== 'all' || status !== 'all' || search !== ''

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* ── En-tête ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
            <Users className="h-4 w-4 text-stone-500" />
          </div>
          <div>
            <h1 className="text-xl font-black text-stone-900" style={{ fontFamily: 'var(--font-playfair)' }}>
              Stylistes
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">
              {loading ? '…' : `${total} styliste${total !== 1 ? 's' : ''} inscrit${total !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Filtres ── */}
      <div className="bg-white rounded-2xl border border-stone-100 p-3 shadow-sm">
        <div className="flex flex-col md:flex-row gap-2">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
            <Input
              className="pl-9 bg-stone-50 border-stone-200 focus:bg-white focus:border-amber-300 focus:ring-amber-400/30 text-sm placeholder:text-stone-400"
              placeholder="Rechercher par nom ou email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filtres select */}
          <div className="flex gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-stone-400 hidden md:block" />
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger className="w-36 bg-stone-50 border-stone-200 text-sm focus:border-amber-300 focus:ring-amber-400/30">
                  <SelectValue placeholder="Tous les plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les plans</SelectItem>
                  <SelectItem value="Découverte">Découverte</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-32 bg-stone-50 border-stone-200 text-sm focus:border-amber-300 focus:ring-amber-400/30">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="suspended">Suspendus</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <button
                onClick={() => { setSearch(''); setPlan('all'); setStatus('all') }}
                className="px-3 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors border border-stone-200"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Tableau / Cards ── */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-stone-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <StylistsTable stylists={stylists} onRefresh={fetchStylists} />
      )}
    </div>
  )
}
