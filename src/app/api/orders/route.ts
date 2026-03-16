import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'
import { generateOrderNumber } from '@/lib/orders/number'
import { ACTIVE_STATUSES } from '@/lib/orders/status'
import { checkOrderLimit } from '@/lib/helpers/subscription'

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
      meta: { activeCount, activeLimit: 15 },
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

    // Vérifier la limite de commandes du plan (pré-check pour message précis)
    const orderLimit = await checkOrderLimit(stylistId)
    if (!orderLimit.canCreate) {
      return NextResponse.json(
        {
          error: 'PLAN_LIMIT_REACHED',
          message: `Limite de commandes actives atteinte (${orderLimit.current}/${orderLimit.limit}). Passez à un plan supérieur.`,
          current: orderLimit.current,
          limit: orderLimit.limit,
          planName: orderLimit.planName,
        },
        { status: 403 }
      )
    }

    const order = await prisma.$transaction(async (tx) => {
      // Re-vérifier la limite à l'intérieur de la transaction (évite les race conditions)
      if (orderLimit.limit !== -1) {
        const activeCount = await tx.order.count({
          where: { stylistId, status: { in: ACTIVE_STATUSES }, deletedAt: null },
        })
        if (activeCount >= orderLimit.limit) {
          throw { code: 'PLAN_LIMIT_REACHED', activeOrders: activeCount, limit: orderLimit.limit }
        }
      }

      // Vérifier que le client appartient au styliste
      const client = await tx.client.findFirst({
        where: { id: clientId, stylistId, deletedAt: null },
      })
      if (!client) {
        throw { code: 'CLIENT_NOT_FOUND', status: 404 }
      }

      // Générer le numéro de commande
      const orderNumber = await generateOrderNumber(tx, stylistId)

      const advance = body.advanceAmount ? Number(body.advanceAmount) : 0;

      const order = await tx.order.create({
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
          advanceAmount: advance,
          // Si avance > 0, initialiser totalPaid et paymentStatus
          totalPaid: advance > 0 ? advance : 0,
          paymentStatus: advance > 0
            ? (advance >= Number(totalPrice) ? 'PAID' : 'PARTIAL')
            : 'UNPAID',
          measurementsSnapshot: body.measurementsSnapshot || null,
        },
        include: {
          client: { select: { id: true, name: true, phone: true } },
        },
      });

      // Si avance > 0, créer un enregistrement Payment pour traçabilité
      if (advance > 0) {
        await tx.payment.create({
          data: {
            orderId: order.id,
            stylistId,
            amount: advance * 100, // stocké en centimes
            paymentType: 'ADVANCE',
            paymentMethod: body.advanceMethod || 'CASH',
            paymentDate: new Date(),
            paymentStatus: 'COMPLETED',
            notes: 'Avance versée à la prise de commande',
          },
        });
      }

      return order;
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
