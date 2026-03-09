import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const stylist = await prisma.stylist.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        slug: true,
        businessName: true,
        phone: true,
        city: true,
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
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!stylist) {
      return NextResponse.json({ error: 'Styliste introuvable' }, { status: 404 })
    }

    return NextResponse.json({
      id: stylist.id,
      slug: stylist.slug,
      name: stylist.businessName ?? stylist.user.name,
      phone: stylist.phone,
      city: stylist.city,
      portfolioItems: stylist.portfolioItems,
    })
  } catch (error) {
    console.error('[GET /api/stylists/:slug]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
