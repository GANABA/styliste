import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Phone, ArrowLeft, MapPin, Grid3X3, MessageCircle } from 'lucide-react'
import { PortfolioGallery } from '@/components/portfolio/PortfolioGallery'
import { StylistPublicProfile } from '@/types/portfolio'
import prisma from '@/lib/prisma'

interface Props {
  params: { stylistSlug: string }
}

async function getStylistProfile(slug: string): Promise<StylistPublicProfile | null> {
  try {
    const stylist = await prisma.stylist.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        businessName: true,
        phone: true,
        city: true,
        logoUrl: true,
        user: { select: { name: true } },
        portfolioItems: {
          where: { isPublished: true },
          select: {
            id: true,
            imageUrl: true,
            thumbnailUrl: true,
            title: true,
            description: true,
            tags: true,
            viewCount: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!stylist) return null

    return {
      id: stylist.id,
      slug: stylist.slug ?? slug,
      businessName: stylist.businessName ?? stylist.user.name,
      phone: stylist.phone,
      city: stylist.city,
      logoUrl: stylist.logoUrl ?? null,
      portfolioItems: stylist.portfolioItems,
    }
  } catch {
    return null
  }
}

export const revalidate = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getStylistProfile(params.stylistSlug)
  if (!profile) return { title: 'Portfolio introuvable' }
  const name = profile.businessName ?? 'Styliste'
  const city = profile.city ? ` · ${profile.city}` : ''
  return {
    title: `${name}${city} | Portfolio`,
    description: `Découvrez les créations de ${name}${city} sur Styliste.com`,
  }
}

export default async function StylistPortfolioPage({ params }: Props) {
  const profile = await getStylistProfile(params.stylistSlug)
  if (!profile) notFound()

  const displayName = profile.businessName ?? 'Styliste'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-background">

      {/* ── NAV ── */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/stylistes"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden md:inline">Annuaire</span>
          </Link>
          <Link
            href="/"
            className="text-base font-black"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Styliste<span className="text-amber-500">.com</span>
          </Link>
          <div className="w-16" />
        </div>
      </nav>

      {/* ── HERO PROFIL ── */}
      <section className="bg-stone-950 py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-4">
          {/* Avatar / Logo */}
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400/30 bg-amber-400/10 flex items-center justify-center">
            {profile.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.logoUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span
                className="text-3xl font-black text-amber-400"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {initial}
              </span>
            )}
          </div>

          <div>
            <h1
              className="text-3xl md:text-4xl font-black text-white"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {displayName}
            </h1>
            {profile.city && (
              <p className="flex items-center justify-center gap-1.5 text-stone-400 text-sm mt-2">
                <MapPin className="h-3.5 w-3.5" />
                {profile.city}, Bénin
              </p>
            )}
            <p className="flex items-center justify-center gap-1.5 text-stone-500 text-sm mt-1">
              <Grid3X3 className="h-3.5 w-3.5" />
              {profile.portfolioItems.length} création{profile.portfolioItems.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* CTAs contact */}
          {profile.phone && (
            <div className="flex gap-3 mt-1">
              <a
                href={`tel:${profile.phone}`}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-stone-950 rounded-xl text-sm font-semibold hover:bg-stone-100 transition-colors"
              >
                <Phone className="h-4 w-4" />
                Appeler
              </a>
              <a
                href={`https://wa.me/${profile.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 text-stone-950 rounded-xl text-sm font-semibold hover:bg-amber-300 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ── GALERIE ── */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        {profile.portfolioItems.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto">
              <Grid3X3 className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              Aucune création publiée pour le moment.
            </p>
          </div>
        ) : (
          <>
            <h2
              className="text-xl font-black text-foreground mb-6"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Créations
            </h2>
            <PortfolioGallery items={profile.portfolioItems} />
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          Portfolio propulsé par{' '}
          <Link href="/" className="text-amber-500 hover:underline font-medium">
            Styliste.com
          </Link>
          {' '}· la plateforme des stylistes africains
        </p>
      </footer>
    </div>
  )
}
