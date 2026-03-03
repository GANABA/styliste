import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'
import { canTransition } from '@/lib/orders/status'

export async function PUT(
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

    const body = await request.json()
    const { status: newStatus, cancellationReason, actualDeliveryDate } = body

    if (!newStatus || !Object.values(OrderStatus).includes(newStatus)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    }

    // Valider la transition
    if (!canTransition(existing.status, newStatus)) {
      return NextResponse.json(
        { error: 'INVALID_TRANSITION', from: existing.status, to: newStatus },
        { status: 422 }
      )
    }

    // L'annulation nécessite une raison
    if (newStatus === OrderStatus.CANCELED && !cancellationReason?.trim()) {
      return NextResponse.json({ error: 'CANCELLATION_REASON_REQUIRED' }, { status: 400 })
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updateData: any = { status: newStatus }

      if (newStatus === OrderStatus.CANCELED) {
        updateData.cancellationReason = cancellationReason
        updateData.canceledAt = new Date()
      }

      if (newStatus === OrderStatus.DELIVERED) {
        updateData.actualDeliveryDate = actualDeliveryDate
          ? new Date(actualDeliveryDate)
          : new Date()
      }

      const order = await tx.order.update({
        where: { id: params.id },
        data: updateData,
        include: {
          client: { select: { id: true, name: true, phone: true } },
        },
      })

      // Logger la transition dans l'historique
      await tx.orderHistory.create({
        data: {
          orderId: params.id,
          changedByUserId: session.user.id,
          changeType: 'STATUS_CHANGE',
          fieldName: 'status',
          oldValue: existing.status,
          newValue: newStatus,
          comment: newStatus === OrderStatus.CANCELED ? `Annulé : ${cancellationReason}` : null,
        },
      })

      return order
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PUT /api/orders/:id/status]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
