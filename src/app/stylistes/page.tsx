'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, Users, Scissors, ArrowLeft } from 'lucide-react'
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
    <div className="min-h-screen bg-background">

      {/* Nav */}
      <nav className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Accueil</span>
          </Link>
          <span className="text-lg font-black text-stone-900" style={{ fontFamily: 'var(--font-playfair)' }}>
            Styliste<span className="text-amber-500">.com</span>
          </span>
          <Link
            href="/register"
            className="text-sm font-semibold bg-stone-900 text-white px-4 py-2 rounded-xl hover:bg-stone-700 transition-colors"
          >
            Rejoindre
          </Link>
        </div>
      </nav>

      {/* Hero compact */}
      <section className="bg-stone-950 py-10 px-4">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <Scissors className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Bénin · Artisans du tissu
            </span>
          </div>
          <h1
            className="text-3xl md:text-4xl font-black text-white leading-tight"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Annuaire des stylistes
          </h1>
          <p className="text-stone-400 text-sm max-w-md">
            Trouvez le styliste idéal et donnez vie à vos idées.
          </p>

          {/* Barre de recherche */}
          <div className="flex gap-2 pt-1">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
              <input
                className="w-full h-10 pl-9 pr-4 bg-stone-900 border border-stone-700 rounded-xl text-white placeholder-stone-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                placeholder="Nom du styliste..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <input
              className="h-10 w-32 px-3 bg-stone-900 border border-stone-700 rounded-xl text-white placeholder-stone-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="Ville..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Résultats */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-stone-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-stone-100 rounded w-2/3" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                  <div className="h-9 bg-stone-100 rounded-xl mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : stylists.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto">
              <Users className="h-7 w-7 text-stone-300" />
            </div>
            <p className="font-semibold text-foreground">Aucun styliste trouvé</p>
            <p className="text-sm text-muted-foreground">
              {search || city ? 'Essayez une autre recherche.' : 'Aucun styliste disponible pour le moment.'}
            </p>
            {(search || city) && (
              <button
                onClick={() => { setSearch(''); setCity('') }}
                className="text-sm text-amber-600 hover:text-amber-700 underline"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-5">
              <span className="font-semibold text-foreground">{stylists.length}</span>{' '}
              styliste{stylists.length !== 1 ? 's' : ''} trouvé{stylists.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {stylists.map((s) => <StylistCard key={s.id} stylist={s} />)}
            </div>
          </>
        )}
      </section>

      <footer className="border-t border-border py-5 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          Vous êtes styliste ?{' '}
          <Link href="/register" className="text-amber-500 hover:text-amber-600 font-medium">
            Rejoignez Styliste.com gratuitement
          </Link>
        </p>
      </footer>
    </div>
  )
}
