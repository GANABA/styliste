'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { StylistCard } from '@/components/directory/StylistCard'

interface StylistListing {
  id: string
  slug: string | null
  name: string | null
  phone: string | null
  city: string | null
  coverImage: { thumbnailUrl: string | null; imageUrl: string } | null
  portfolioCount: number
}

export default function AnnuairePage() {
  const [stylists, setStylists] = useState<StylistListing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')

  const fetchStylists = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (city) params.set('city', city)

    fetch(`/api/stylists/public?${params}`)
      .then((r) => r.json())
      .then(setStylists)
      .catch(() => setStylists([]))
      .finally(() => setLoading(false))
  }, [search, city])

  useEffect(() => {
    const timer = setTimeout(fetchStylists, 300)
    return () => clearTimeout(timer)
  }, [fetchStylists])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Annuaire des Stylistes</h1>
          <p className="text-gray-500 mt-2">
            Trouvez le styliste idéal pour votre prochain vêtement
          </p>
        </div>

        {/* Filtres */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Rechercher par nom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Input
            className="w-48"
            placeholder="Filtrer par ville..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        {/* Résultats */}
        {loading ? (
          <div className="text-center py-16 text-sm text-gray-400">Chargement...</div>
        ) : stylists.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Users className="h-14 w-14 mx-auto text-gray-200" />
            <p className="text-gray-500 font-medium">Aucun styliste trouvé</p>
            <p className="text-sm text-gray-400">
              {search || city
                ? 'Essayez une autre recherche.'
                : 'Aucun styliste disponible pour le moment.'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">
              {stylists.length} styliste{stylists.length !== 1 ? 's' : ''} trouvé{stylists.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {stylists.map((s) => (
                <StylistCard key={s.id} stylist={s} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
