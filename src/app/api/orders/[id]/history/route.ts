import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier que la commande appartient au styliste
    const order = await prisma.order.findFirst({
      where: { id: params.id, stylistId: session.user.stylistId, deletedAt: null },
    })
    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }

    const history = await prisma.orderHistory.findMany({
      where: { orderId: params.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(history)
  } catch (error) {
    console.error('[GET /api/orders/:id/history]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
