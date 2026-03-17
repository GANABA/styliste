import Link from 'next/link'
import { Phone, ArrowUpRight, ImageIcon } from 'lucide-react'

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

const GRADIENT_PALETTE = [
  'from-amber-900/80 to-stone-900',
  'from-stone-800 to-stone-950',
  'from-amber-800/60 to-stone-900',
  'from-stone-700 to-stone-950',
]

export function StylistCard({ stylist }: StylistCardProps) {
  const name = stylist.name ?? 'Styliste'
  const initial = name.charAt(0).toUpperCase()
  const gradientIndex = name.charCodeAt(0) % GRADIENT_PALETTE.length
  const gradient = GRADIENT_PALETTE[gradientIndex]

  return (
    <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-stone-200/50 dark:hover:shadow-stone-900/50 hover:-translate-y-0.5 transition-all duration-200">
      {/* Cover */}
      <div className="aspect-[4/3] relative overflow-hidden bg-stone-900">
        {stylist.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={stylist.coverImage.thumbnailUrl ?? stylist.coverImage.imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-2`}>
            <span
              className="text-5xl font-black text-white/20"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {initial}
            </span>
            <ImageIcon className="h-5 w-5 text-white/20" />
          </div>
        )}

        {/* Badge créations */}
        <div className="absolute bottom-3 right-3">
          <span className="text-[11px] font-semibold bg-black/60 backdrop-blur-sm text-white/90 px-2.5 py-1 rounded-full">
            {stylist.portfolioCount} création{stylist.portfolioCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Infos */}
      <div className="p-4">
        <div className="mb-3">
          <h3
            className="font-bold text-foreground text-base leading-tight"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {name}
          </h3>
          {stylist.city && (
            <p className="text-sm text-muted-foreground mt-0.5">{stylist.city}, Bénin</p>
          )}
        </div>

        <div className="flex gap-2">
          {stylist.slug && (
            <Link
              href={`/${stylist.slug}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl border border-border text-foreground hover:bg-amber-400 hover:text-stone-950 hover:border-amber-400 transition-all duration-150"
            >
              Voir portfolio
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
          {stylist.phone && (
            <a
              href={`tel:${stylist.phone}`}
              className="flex items-center justify-center h-9 w-9 rounded-xl bg-stone-100 dark:bg-stone-800 text-muted-foreground hover:bg-amber-400 hover:text-stone-950 transition-all duration-150"
              aria-label={`Appeler ${name}`}
            >
              <Phone className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
