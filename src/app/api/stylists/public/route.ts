import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const PORTFOLIO_PLANS = ['Pro', 'Premium']

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim()
    const city = searchParams.get('city')?.trim()

    // Trouver les stylistes avec au moins 1 item publié et plan Pro/Premium
    const stylists = await prisma.stylist.findMany({
      where: {
        slug: { not: null },
        deletedAt: null,
        ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
        ...(search ? {
          OR: [
            { businessName: { contains: search, mode: 'insensitive' } },
            { user: { name: { contains: search, mode: 'insensitive' } } },
          ],
        } : {}),
        portfolioItems: {
          some: { isPublished: true },
        },
        subscriptions: {
          some: {
            status: { in: ['ACTIVE', 'TRIAL'] },
            plan: { name: { in: PORTFOLIO_PLANS } },
          },
        },
      },
      select: {
        id: true,
        slug: true,
        businessName: true,
        phone: true,
        city: true,
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
      coverImage: s.portfolioItems[0] ?? null,
      portfolioCount: s._count.portfolioItems,
    }))

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[GET /api/stylists/public]', error)
    return NextResponse.json({ error: 'Erreur serveur', detail: error?.message, code: error?.code }, { status: 500 })
  }
}
