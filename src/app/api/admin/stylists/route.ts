import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') ?? ''
    const planFilter = searchParams.get('plan') ?? ''
    const statusFilter = searchParams.get('status') ?? ''
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const skip = (page - 1) * limit

    const userWhere: any = {
      role: 'STYLIST',
      deletedAt: null,
    }

    if (search) {
      userWhere.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (statusFilter === 'suspended') {
      userWhere.suspended = true
    } else if (statusFilter === 'active') {
      userWhere.suspended = false
    }

    const users = await prisma.user.findMany({
      where: userWhere,
      include: {
        stylist: {
          include: {
            subscriptions: {
              where: { status: { in: ['ACTIVE', 'TRIAL'] } },
              include: { plan: true },
              orderBy: { currentPeriodEnd: 'desc' },
              take: 1,
            },
            _count: {
              select: { clients: { where: { deletedAt: null } }, orders: { where: { deletedAt: null } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    const total = await prisma.user.count({ where: userWhere })

    const stylists = users
      .filter((u) => {
        if (!planFilter) return true
        return u.stylist?.subscriptions[0]?.plan.name === planFilter
      })
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        suspended: u.suspended,
        createdAt: u.createdAt,
        stylistId: u.stylist?.id,
        businessName: u.stylist?.businessName,
        city: u.stylist?.city,
        plan: u.stylist?.subscriptions[0]?.plan.name ?? 'Découverte',
        planStatus: u.stylist?.subscriptions[0]?.status ?? null,
        clientCount: u.stylist?._count.clients ?? 0,
        orderCount: u.stylist?._count.orders ?? 0,
      }))

    return NextResponse.json({ stylists, total, page, pages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('[GET /api/admin/stylists]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
