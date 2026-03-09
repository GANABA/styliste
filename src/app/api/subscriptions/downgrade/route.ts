import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { PLAN_LIMITS, PLAN_ORDER } from '@/lib/helpers/subscription'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { planName } = await request.json()
    if (!planName) {
      return NextResponse.json({ error: 'planName requis' }, { status: 400 })
    }

    const stylistId = session.user.stylistId
    const targetLimits = PLAN_LIMITS[planName]
    if (!targetLimits) {
      return NextResponse.json({ error: 'Plan introuvable' }, { status: 404 })
    }

    const targetPlan = await prisma.subscriptionPlan.findFirst({
      where: { name: planName, isActive: true },
    })
    if (!targetPlan) {
      return NextResponse.json({ error: 'Plan introuvable en base' }, { status: 404 })
    }

    // Vérifier que c'est bien un downgrade
    const currentSub = await prisma.subscription.findFirst({
      where: { stylistId, status: { in: ['ACTIVE', 'TRIAL'] } },
      include: { plan: true },
      orderBy: { currentPeriodEnd: 'desc' },
    })

    const currentPlanIndex = PLAN_ORDER.indexOf(currentSub?.plan.name ?? 'Découverte')
    const targetPlanIndex = PLAN_ORDER.indexOf(planName)

    if (targetPlanIndex >= currentPlanIndex) {
      return NextResponse.json(
        { error: "Utilisez l'endpoint upgrade pour passer à un plan supérieur" },
        { status: 400 }
      )
    }

    // Vérifier que l'usage actuel respecte les limites du nouveau plan
    const ACTIVE_STATUSES = ['QUOTE', 'IN_PROGRESS', 'READY']
    const [clientCount, orderCount, portfolioCount] = await Promise.all([
      prisma.client.count({ where: { stylistId, deletedAt: null } }),
      prisma.order.count({ where: { stylistId, status: { in: ACTIVE_STATUSES as any }, deletedAt: null } }),
      prisma.portfolioItem.count({ where: { stylistId } }),
    ])

    const blockers: string[] = []

    if (targetLimits.maxClients !== -1 && clientCount > targetLimits.maxClients) {
      blockers.push(`Vous avez ${clientCount} clients (limite du plan ${planName} : ${targetLimits.maxClients}). Archivez ${clientCount - targetLimits.maxClients} client(s).`)
    }
    if (targetLimits.maxActiveOrders !== -1 && orderCount > targetLimits.maxActiveOrders) {
      blockers.push(`Vous avez ${orderCount} commandes actives (limite : ${targetLimits.maxActiveOrders}). Livrez ou annulez ${orderCount - targetLimits.maxActiveOrders} commande(s).`)
    }
    if (!targetLimits.hasPortfolio && portfolioCount > 0) {
      blockers.push(`Vous avez ${portfolioCount} photo(s) portfolio. Le plan ${planName} ne propose pas de portfolio.`)
    }

    if (blockers.length > 0) {
      return NextResponse.json(
        { error: 'Impossible de downgrader : usage dépasse les limites du plan cible', blockers },
        { status: 400 }
      )
    }

    // Appliquer le downgrade
    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    if (currentSub) {
      await prisma.subscription.update({
        where: { id: currentSub.id },
        data: {
          planId: targetPlan.id,
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      })
    } else {
      await prisma.subscription.create({
        data: {
          stylistId,
          planId: targetPlan.id,
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      })
    }

    return NextResponse.json({ success: true, plan: planName })
  } catch (error) {
    console.error('[POST /api/subscriptions/downgrade]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
