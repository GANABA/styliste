import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

async function getOrderForStylist(id: string, stylistId: string) {
  return prisma.order.findFirst({
    where: { id, stylistId, deletedAt: null },
    include: {
      client: { select: { id: true, name: true, phone: true, email: true } },
      photos: { orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] },
      history: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const order = await getOrderForStylist(params.id, session.user.stylistId)
    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('[GET /api/orders/:id]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const existing = await prisma.order.findFirst({
      where: { id: params.id, stylistId: session.user.stylistId, deletedAt: null },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }

    // Commandes terminales ne sont pas modifiables
    if (existing.status === OrderStatus.DELIVERED || existing.status === OrderStatus.CANCELED) {
      return NextResponse.json({ error: 'ORDER_NOT_EDITABLE' }, { status: 422 })
    }

    const body = await request.json()
    const allowedFields = [
      'garmentType', 'description', 'notes', 'specialRequests',
      'promisedDate', 'urgencyLevel',
      'fabricProvidedBy', 'fabricReceivedDate', 'fabricDescription',
      'totalPrice', 'advanceAmount', 'totalPaid', 'paymentStatus',
      'measurementsSnapshot',
    ]

    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'promisedDate' || field === 'fabricReceivedDate') {
          updateData[field] = body[field] ? new Date(body[field]) : null
        } else if (field === 'totalPrice' || field === 'advanceAmount' || field === 'totalPaid') {
          updateData[field] = Number(body[field])
        } else {
          updateData[field] = body[field]
        }
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: params.id },
        data: updateData,
        include: {
          client: { select: { id: true, name: true, phone: true } },
        },
      })

      // Logger la modification dans l'historique
      const changedFields = Object.keys(updateData)
      if (changedFields.length > 0) {
        let changeType: string = 'OTHER'
        if (changedFields.some(f => f.includes('price') || f.includes('amount') || f.includes('Paid'))) {
          changeType = 'PRICE_CHANGE'
        } else if (changedFields.includes('promisedDate')) {
          changeType = 'DATE_CHANGE'
        } else if (changedFields.some(f => ['description', 'garmentType', 'notes'].includes(f))) {
          changeType = 'DESCRIPTION_CHANGE'
        }

        await tx.orderHistory.create({
          data: {
            orderId: params.id,
            changedByUserId: session.user.id,
            changeType: changeType as any,
            fieldName: changedFields.join(', '),
            comment: `Modification : ${changedFields.join(', ')}`,
          },
        })
      }

      return order
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PATCH /api/orders/:id]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const existing = await prisma.order.findFirst({
      where: { id: params.id, stylistId: session.user.stylistId, deletedAt: null },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }

    // Seuls les devis et les annulés sont supprimables
    if (existing.status !== OrderStatus.QUOTE && existing.status !== OrderStatus.CANCELED) {
      return NextResponse.json({ error: 'ORDER_NOT_DELETABLE' }, { status: 422 })
    }

    await prisma.order.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[DELETE /api/orders/:id]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
