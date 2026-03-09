import Link from 'next/link'
import { Phone, ExternalLink } from 'lucide-react'

interface StylistCardProps {
  stylist: {
    id: string
    slug: string | null
    name: string | null
    phone: string | null
    city: string | null
    coverImage: { thumbnailUrl: string | null; imageUrl: string } | null
    portfolioCount: number
  }
}

export function StylistCard({ stylist }: StylistCardProps) {
  const name = stylist.name ?? 'Styliste'
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow">
      {/* Cover image */}
      <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
        {stylist.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={stylist.coverImage.thumbnailUrl ?? stylist.coverImage.imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-bold text-blue-300">{initial}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900">{name}</h3>
        {stylist.city && (
          <p className="text-sm text-gray-500 mt-0.5">{stylist.city}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {stylist.portfolioCount} création{stylist.portfolioCount !== 1 ? 's' : ''}
        </p>

        <div className="flex gap-2 mt-3">
          {stylist.slug && (
            <Link
              href={`/${stylist.slug}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Portfolio
            </Link>
          )}
          {stylist.phone && (
            <a
              href={`tel:${stylist.phone}`}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
