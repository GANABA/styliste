import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [
      totalStylists,
      activeStylists,
      totalOrders,
      planDistribution,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STYLIST', deletedAt: null } }),
      // JWT strategy: no session table — count stylists with recent orders as proxy
      prisma.order.groupBy({
        by: ['stylistId'],
        where: { createdAt: { gte: sevenDaysAgo }, deletedAt: null },
        _count: true,
      }).then((r) => r.length),
      prisma.order.count({ where: { deletedAt: null } }),
      prisma.subscriptionPlan.findMany({
        include: {
          _count: {
            select: {
              subscriptions: {
                where: { status: { in: ['ACTIVE', 'TRIAL'] } },
              },
            },
          },
        },
      }),
    ])

    return NextResponse.json({
      totalStylists,
      activeStylists,
      totalOrders,
      planDistribution: planDistribution.map((p) => ({
        name: p.name,
        count: p._count.subscriptions,
      })),
    })
  } catch (error) {
    console.error('[GET /api/admin/stats]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
