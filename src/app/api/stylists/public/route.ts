import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const PORTFOLIO_PLANS = ['Pro', 'Premium']

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim()
    const city = searchParams.get('city')?.trim()

    // Étape 1 : récupérer les stylistIds avec un abonnement Pro/Premium actif
    const eligibleSubs = await prisma.subscription.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIAL'] },
        plan: { name: { in: PORTFOLIO_PLANS } },
      },
      select: { stylistId: true },
    })
    const eligibleIds = eligibleSubs.map((s) => s.stylistId)

    if (eligibleIds.length === 0) {
      return NextResponse.json([])
    }

    // Étape 2 : récupérer les stylistes éligibles avec portfolio publié
    const stylists = await prisma.stylist.findMany({
      where: {
        id: { in: eligibleIds },
        slug: { not: null },
        deletedAt: null,
        portfolioItems: { some: { isPublished: true } },
        ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
        ...(search ? {
          OR: [
            { businessName: { contains: search, mode: 'insensitive' } },
            { user: { name: { contains: search, mode: 'insensitive' } } },
          ],
        } : {}),
      },
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
          select: { id: true, thumbnailUrl: true, imageUrl: true, title: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: { select: { portfolioItems: { where: { isPublished: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const result = stylists.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.businessName ?? s.user.name,
      phone: s.phone,
      city: s.city,
      logoUrl: s.logoUrl,
      coverImage: s.portfolioItems[0] ?? null,
      portfolioCount: s._count.portfolioItems,
    }))

    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('[GET /api/stylists/public]', error)
    return NextResponse.json([], { status: 200 })
  }
}
