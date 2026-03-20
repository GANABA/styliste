'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, Users, MapPin } from 'lucide-react'
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
      .then((data) => setStylists(Array.isArray(data) ? data : []))
      .catch(() => setStylists([]))
      .finally(() => setLoading(false))
  }, [search, city])

  useEffect(() => {
    const timer = setTimeout(fetchStylists, 300)
    return () => clearTimeout(timer)
  }, [fetchStylists])

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── NAV ── */}
      <nav className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-black text-stone-900 shrink-0"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Styliste<span className="text-amber-500">.com</span>
          </Link>

          {/* Barre de recherche centrale */}
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                className="w-full h-9 pl-9 pr-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                placeholder="Nom du styliste..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative hidden sm:block">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                className="h-9 w-28 pl-8 pr-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                placeholder="Ville..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/register"
            className="text-sm font-semibold bg-stone-900 text-white px-4 py-2 rounded-xl hover:bg-stone-700 transition-colors shrink-0"
          >
            Rejoindre
          </Link>
        </div>

        {/* Filtre ville mobile */}
        <div className="sm:hidden px-4 pb-3">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              className="w-full h-9 pl-8 pr-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="Filtrer par ville..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </div>
      </nav>

      {/* ── EN-TÊTE RÉSULTATS ── */}
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-stone-900" style={{ fontFamily: 'var(--font-playfair)' }}>
              Annuaire des stylistes
            </h1>
            {!loading && (
              <p className="text-sm text-stone-500 mt-0.5">
                {stylists.length > 0 ? (
                  <>
                    <span className="font-semibold text-stone-700">{stylists.length}</span>{' '}
                    styliste{stylists.length !== 1 ? 's' : ''} trouvé{stylists.length !== 1 ? 's' : ''}
                    {(search || city) && ' pour votre recherche'}
                  </>
                ) : (search || city) ? 'Aucun résultat' : 'Aucun styliste disponible'}
              </p>
            )}
          </div>

          {(search || city) && (
            <button
              onClick={() => { setSearch(''); setCity('') }}
              className="text-xs text-amber-600 hover:text-amber-700 font-medium underline underline-offset-2"
            >
              Effacer les filtres
            </button>
          )}
        </div>
      </div>

      {/* ── RÉSULTATS ── */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-stone-200 bg-white overflow-hidden animate-pulse">
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
          <div className="text-center py-24 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto">
              <Users className="h-8 w-8 text-stone-300" />
            </div>
            <div>
              <p className="font-semibold text-stone-700">
                {search || city ? 'Aucun styliste trouvé' : 'Aucun styliste disponible'}
              </p>
              <p className="text-sm text-stone-400 mt-1">
                {search || city
                  ? 'Essayez une recherche différente ou supprimez les filtres.'
                  : 'Les stylistes avec un portfolio public apparaîtront ici.'}
              </p>
            </div>
            {(search || city) && (
              <button
                onClick={() => { setSearch(''); setCity('') }}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium underline"
              >
                Afficher tous les stylistes
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {stylists.map((s) => <StylistCard key={s.id} stylist={s} />)}
          </div>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-stone-200 bg-white py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
          <p>
            Vous êtes styliste ?{' '}
            <Link href="/register" className="text-amber-600 hover:text-amber-700 font-medium">
              Rejoignez Styliste.com gratuitement
            </Link>
          </p>
          <div className="flex gap-4">
            <Link href="/confidentialite" className="hover:text-stone-600 transition-colors">Confidentialité</Link>
            <Link href="/cgu" className="hover:text-stone-600 transition-colors">CGU</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
