import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Phone } from 'lucide-react'
import { PortfolioGallery } from '@/components/portfolio/PortfolioGallery'
import { StylistPublicProfile } from '@/types/portfolio'

interface Props {
  params: { stylistSlug: string }
}

async function getStylistProfile(slug: string): Promise<StylistPublicProfile | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/stylists/${slug}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getStylistProfile(params.stylistSlug)
  if (!profile) return { title: 'Portfolio introuvable' }

  const name = profile.businessName ?? 'Styliste'
  const city = profile.city ? ` — ${profile.city}` : ''

  return {
    title: `${name}${city} | Portfolio`,
    description: `Découvrez les créations de ${name}${city} sur Styliste.com`,
  }
}

export default async function StylistPortfolioPage({ params }: Props) {
  const profile = await getStylistProfile(params.stylistSlug)
  if (!profile) notFound()

  const displayName = profile.businessName ?? 'Styliste'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Header profil */}
        <div className="bg-white rounded-2xl border p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 font-bold text-2xl flex items-center justify-center mx-auto mb-4">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
          {profile.city && (
            <p className="text-gray-500 text-sm mt-1">{profile.city}</p>
          )}

          {/* Boutons contact */}
          {profile.phone && (
            <div className="flex justify-center gap-3 mt-4">
              <a
                href={`tel:${profile.phone}`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Phone className="h-4 w-4" />
                Appeler
              </a>
              <a
                href={`https://wa.me/${profile.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
              >
                WhatsApp
              </a>
            </div>
          )}
        </div>

        {/* Galerie */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Créations ({profile.portfolioItems.length})
          </h2>
          <PortfolioGallery items={profile.portfolioItems} />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-4">
          Portfolio propulsé par{' '}
          <a href="/" className="text-blue-500 hover:underline">Styliste.com</a>
        </p>
      </div>
    </div>
  )
}
