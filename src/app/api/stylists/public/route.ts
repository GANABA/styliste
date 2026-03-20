import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim()
    const city = searchParams.get('city')?.trim()

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
  } catch (error: unknown) {
    console.error('[GET /api/stylists/public]', error)
    return NextResponse.json([], { status: 200 })
  }
}
