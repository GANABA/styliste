import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { PLAN_ORDER } from '@/lib/helpers/subscription'

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

    // Récupérer le plan cible
    const targetPlan = await prisma.subscriptionPlan.findFirst({
      where: { name: planName, isActive: true },
    })
    if (!targetPlan) {
      return NextResponse.json({ error: 'Plan introuvable' }, { status: 404 })
    }

    // Récupérer l'abonnement actuel
    const currentSub = await prisma.subscription.findFirst({
      where: { stylistId, status: { in: ['ACTIVE', 'TRIAL'] } },
      include: { plan: true },
      orderBy: { currentPeriodEnd: 'desc' },
    })

    // Vérifier que c'est bien un upgrade
    const currentPlanIndex = PLAN_ORDER.indexOf(currentSub?.plan.name ?? 'Découverte')
    const targetPlanIndex = PLAN_ORDER.indexOf(planName)

    if (targetPlanIndex <= currentPlanIndex) {
      return NextResponse.json(
        { error: "Utilisez l'endpoint downgrade pour passer à un plan inférieur" },
        { status: 400 }
      )
    }

    // Mettre à jour ou créer l'abonnement
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
    console.error('[POST /api/subscriptions/upgrade]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
