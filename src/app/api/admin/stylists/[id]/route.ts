import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        stylist: {
          include: {
            subscriptions: {
              include: { plan: true },
              orderBy: { currentPeriodEnd: 'desc' },
              take: 1,
            },
            _count: {
              select: {
                clients: { where: { deletedAt: null } },
                orders: { where: { deletedAt: null } },
                portfolioItems: true,
              },
            },
          },
        },
      },
    })

    if (!user || user.role !== 'STYLIST') {
      return NextResponse.json({ error: 'Styliste introuvable' }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      suspended: user.suspended,
      createdAt: user.createdAt,
      stylist: user.stylist,
      plan: user.stylist?.subscriptions[0]?.plan.name ?? 'Découverte',
    })
  } catch (error) {
    console.error('[GET /api/admin/stylists/[id]]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { planName } = await request.json()
    if (!planName) {
      return NextResponse.json({ error: 'planName requis' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { stylist: { include: { subscriptions: { orderBy: { currentPeriodEnd: 'desc' }, take: 1 } } } },
    })

    if (!user?.stylist) {
      return NextResponse.json({ error: 'Styliste introuvable' }, { status: 404 })
    }

    const targetPlan = await prisma.subscriptionPlan.findFirst({
      where: { name: planName, isActive: true },
    })
    if (!targetPlan) {
      return NextResponse.json({ error: 'Plan introuvable' }, { status: 404 })
    }

    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    const existingSub = user.stylist.subscriptions[0]
    if (existingSub) {
      await prisma.subscription.update({
        where: { id: existingSub.id },
        data: { planId: targetPlan.id, status: 'ACTIVE', currentPeriodStart: now, currentPeriodEnd: periodEnd },
      })
    } else {
      await prisma.subscription.create({
        data: {
          stylistId: user.stylist.id,
          planId: targetPlan.id,
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      })
    }

    // Log d'audit
    await prisma.auditLog.create({
      data: {
        adminId: session.user.id,
        action: 'CHANGE_PLAN',
        targetType: 'stylist',
        targetId: user.stylist.id,
        metadata: { planName, previousPlan: existingSub ? null : 'Découverte' },
      },
    })

    return NextResponse.json({ success: true, plan: planName })
  } catch (error) {
    console.error('[PUT /api/admin/stylists/[id]]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
