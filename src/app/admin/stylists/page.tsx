'use client'

import { useState, useEffect, useCallback } from 'react'
import { StylistsTable } from '@/components/admin/StylistsTable'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Search } from 'lucide-react'

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
  const [stylists, setStylists] = useState<Stylist[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [plan, setPlan] = useState('all')
  const [status, setStatus] = useState('all')

  const fetchStylists = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (plan && plan !== 'all') params.set('plan', plan)
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

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-gray-600" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">Stylistes</h1>
          <p className="text-sm text-gray-500">{total} styliste(s) inscrit(s)</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={plan} onValueChange={setPlan}>
          <SelectTrigger className="w-40">
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
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Tous statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="suspended">Suspendus</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400 text-sm">Chargement...</div>
      ) : (
        <StylistsTable stylists={stylists} onRefresh={fetchStylists} />
      )}
    </div>
  )
}
