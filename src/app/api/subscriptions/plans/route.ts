import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    })

    return NextResponse.json({ plans })
  } catch (error) {
    console.error('[GET /api/subscriptions/plans]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
