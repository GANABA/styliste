'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, Users, ArrowLeft, Scissors } from 'lucide-react'
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

      {/* ── NAV ── */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Retour</span>
          </Link>
          <span
            className="text-lg font-black"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Styliste<span className="text-amber-500">.com</span>
          </span>
          <Link
            href="/register"
            className="text-sm font-semibold bg-stone-900 dark:bg-amber-400 text-white dark:text-stone-950 px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            Rejoindre
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="bg-stone-950 py-14 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-full">
            <Scissors className="h-3 w-3" />
            Artisans du tissu, Bénin
          </div>
          <h1
            className="text-3xl md:text-5xl font-black text-white leading-tight"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Annuaire des stylistes
          </h1>
          <p className="text-stone-400 text-base md:text-lg max-w-xl mx-auto">
            Trouvez un styliste talentueux près de chez vous et donnez vie à vos idées.
          </p>

          {/* Barre de recherche intégrée dans le hero */}
          <div className="max-w-xl mx-auto mt-6 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
              <input
                className="w-full h-11 pl-10 pr-4 bg-stone-900 border border-stone-700 rounded-xl text-white placeholder-stone-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                placeholder="Nom du styliste..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <input
              className="h-11 w-36 px-4 bg-stone-900 border border-stone-700 rounded-xl text-white placeholder-stone-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="Ville..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* ── RÉSULTATS ── */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        {loading ? (
          /* Skeleton */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-9 bg-muted rounded-xl mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : stylists.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Aucun styliste trouvé</p>
              <p className="text-sm text-muted-foreground mt-1">
                {search || city ? 'Essayez une autre recherche.' : 'Aucun styliste disponible pour le moment.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-5">
              <span className="font-semibold text-foreground">{stylists.length}</span>{' '}
              styliste{stylists.length !== 1 ? 's' : ''} trouvé{stylists.length !== 1 ? 's' : ''}
              {(search || city) && (
                <button
                  onClick={() => { setSearch(''); setCity('') }}
                  className="ml-3 text-amber-500 hover:text-amber-600 text-xs underline"
                >
                  Effacer les filtres
                </button>
              )}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {stylists.map((s) => <StylistCard key={s.id} stylist={s} />)}
            </div>
          </>
        )}
      </section>

      {/* Footer léger */}
      <footer className="border-t border-border py-6 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          Vous êtes styliste ?{' '}
          <Link href="/register" className="text-amber-500 hover:underline font-medium">
            Rejoignez Styliste.com gratuitement →
          </Link>
        </p>
      </footer>
    </div>
  )
}
