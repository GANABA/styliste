import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'
import { generateOrderNumber } from '@/lib/orders/number'
import { ACTIVE_STATUSES } from '@/lib/orders/status'

const ACTIVE_ORDER_LIMIT = 15

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status') as OrderStatus | null

    const where: any = {
      stylistId: session.user.stylistId,
      deletedAt: null,
    }

    if (statusFilter && Object.values(OrderStatus).includes(statusFilter)) {
      where.status = statusFilter
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, phone: true } },
        photos: { select: { id: true, thumbnailUrl: true, photoType: true }, take: 1 },
        _count: { select: { photos: true } },
      },
      orderBy: { promisedDate: 'asc' },
    })

    // Compter les commandes actives pour l'affichage de la capacité
    const activeCount = await prisma.order.count({
      where: {
        stylistId: session.user.stylistId,
        status: { in: ACTIVE_STATUSES },
        deletedAt: null,
      },
    })

    return NextResponse.json({
      orders,
      meta: { activeCount, activeLimit: ACTIVE_ORDER_LIMIT },
    })
  } catch (error) {
    console.error('[GET /api/orders]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const stylistId = session.user.stylistId
    const body = await request.json()

    // Validation des champs obligatoires
    const { clientId, garmentType, promisedDate, totalPrice, fabricProvidedBy } = body
    if (!clientId || !garmentType || !promisedDate || totalPrice === undefined || !fabricProvidedBy) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants : clientId, garmentType, promisedDate, totalPrice, fabricProvidedBy' },
        { status: 400 }
      )
    }

    const order = await prisma.$transaction(async (tx) => {
      // Vérifier que le client appartient au styliste
      const client = await tx.client.findFirst({
        where: { id: clientId, stylistId, deletedAt: null },
      })
      if (!client) {
        throw { code: 'CLIENT_NOT_FOUND', status: 404 }
      }

      // Vérifier la limite de 15 commandes actives
      const activeCount = await tx.order.count({
        where: {
          stylistId,
          status: { in: ACTIVE_STATUSES },
          deletedAt: null,
        },
      })
      if (activeCount >= ACTIVE_ORDER_LIMIT) {
        throw { code: 'CAPACITY_EXCEEDED', activeOrders: activeCount, limit: ACTIVE_ORDER_LIMIT, status: 422 }
      }

      // Générer le numéro de commande
      const orderNumber = await generateOrderNumber(tx, stylistId)

      return tx.order.create({
        data: {
          stylistId,
          clientId,
          orderNumber,
          garmentType,
          promisedDate: new Date(promisedDate),
          totalPrice: Number(totalPrice),
          fabricProvidedBy,
          description: body.description || null,
          notes: body.notes || null,
          specialRequests: body.specialRequests || null,
          urgencyLevel: body.urgencyLevel || 'NORMAL',
          fabricDescription: body.fabricDescription || null,
          fabricReceivedDate: body.fabricReceivedDate ? new Date(body.fabricReceivedDate) : null,
          advanceAmount: body.advanceAmount ? Number(body.advanceAmount) : 0,
          measurementsSnapshot: body.measurementsSnapshot || null,
        },
        include: {
          client: { select: { id: true, name: true, phone: true } },
        },
      })
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error: any) {
    if (error.code === 'CLIENT_NOT_FOUND') {
      return NextResponse.json({ error: 'CLIENT_NOT_FOUND' }, { status: 404 })
    }
    if (error.code === 'CAPACITY_EXCEEDED') {
      return NextResponse.json(
        { error: 'CAPACITY_EXCEEDED', activeOrders: error.activeOrders, limit: error.limit },
        { status: 422 }
      )
    }
    console.error('[POST /api/orders]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
