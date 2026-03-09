import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const stylist = await prisma.stylist.findUnique({
      where: { userId: session.user.id },
    })
    if (!stylist) return NextResponse.json({ error: 'Styliste introuvable' }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    const notifications = await prisma.notification.findMany({
      where: {
        stylistId: stylist.id,
        ...(orderId ? { orderId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('[GET /api/notifications]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
