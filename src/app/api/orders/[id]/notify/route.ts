import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sendEmail } from '@/lib/resend'
import { OrderReadyEmail } from '@/emails/OrderReadyEmail'
import { PaymentReminderEmail } from '@/emails/PaymentReminderEmail'
import { PickupReminderEmail } from '@/emails/PickupReminderEmail'
import { getCurrentPlan } from '@/lib/helpers/subscription'
import { NotificationType } from '@prisma/client'
import * as React from 'react'

const EMAIL_PLANS = ['Standard', 'Pro', 'Premium']

function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(date)
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const stylist = await prisma.stylist.findUnique({
      where: { userId: session.user.id },
      include: { user: { select: { name: true, email: true } } },
    })
    if (!stylist) return NextResponse.json({ error: 'Styliste introuvable' }, { status: 404 })

    // Vérifier le plan
    const plan = await getCurrentPlan(stylist.id)
    if (!EMAIL_PLANS.includes(plan.name)) {
      return NextResponse.json(
        { error: 'PLAN_UPGRADE_REQUIRED', requiredPlan: 'STANDARD' },
        { status: 403 }
      )
    }

    const order = await prisma.order.findFirst({
      where: { id: params.id, stylistId: stylist.id, deletedAt: null },
      include: { client: true },
    })
    if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })

    if (!order.client.email) {
      return NextResponse.json({ error: 'CLIENT_NO_EMAIL' }, { status: 422 })
    }

    const body = await request.json()
    const type = body.type as NotificationType

    if (!['ORDER_READY', 'PAYMENT_REMINDER', 'PICKUP_REMINDER'].includes(type)) {
      return NextResponse.json({ error: 'Type de notification invalide' }, { status: 400 })
    }

    if (type === 'ORDER_READY' && order.status !== 'READY') {
      return NextResponse.json({ error: 'La commande doit être au statut READY' }, { status: 422 })
    }

    if (type === 'PAYMENT_REMINDER' && order.paymentStatus === 'PAID') {
      return NextResponse.json({ error: 'ORDER_ALREADY_PAID' }, { status: 422 })
    }

    const stylistName = stylist.businessName ?? stylist.user.name ?? 'Votre styliste'

    let subject = ''
    let emailElement: React.ReactElement

    if (type === 'ORDER_READY') {
      subject = `Votre ${order.garmentType} est prêt(e) !`
      emailElement = React.createElement(OrderReadyEmail, {
        clientName: order.client.name,
        garmentType: order.garmentType,
        stylistName,
        stylistPhone: stylist.phone ?? '',
        stylistCity: stylist.city ?? undefined,
        orderNumber: order.orderNumber,
      })
    } else if (type === 'PAYMENT_REMINDER') {
      subject = `Rappel de paiement — ${order.garmentType}`
      emailElement = React.createElement(PaymentReminderEmail, {
        clientName: order.client.name,
        garmentType: order.garmentType,
        orderNumber: order.orderNumber,
        totalPrice: order.totalPrice,
        totalPaid: order.totalPaid,
        balanceDue: Math.max(0, order.totalPrice - order.totalPaid),
        stylistName,
        stylistPhone: stylist.phone ?? '',
      })
    } else {
      subject = `Rappel de retrait — ${order.garmentType} vous attend`
      emailElement = React.createElement(PickupReminderEmail, {
        clientName: order.client.name,
        garmentType: order.garmentType,
        orderNumber: order.orderNumber,
        promisedDate: formatDate(new Date(order.promisedDate)),
        stylistName,
        stylistPhone: stylist.phone ?? '',
        stylistCity: stylist.city ?? undefined,
      })
    }

    const result = await sendEmail({
      to: order.client.email,
      subject,
      react: emailElement,
    })

    // Enregistrer la notification en base
    const notification = await prisma.notification.create({
      data: {
        stylistId: stylist.id,
        orderId: order.id,
        clientId: order.clientId,
        type,
        channel: 'EMAIL',
        status: result.success ? 'SENT' : 'FAILED',
        sentAt: result.success ? new Date() : null,
        errorMessage: result.error ?? null,
      },
    })

    if (!result.success) {
      return NextResponse.json({ error: 'EMAIL_SEND_FAILED', detail: result.error }, { status: 502 })
    }

    return NextResponse.json({ success: true, notificationId: notification.id })
  } catch (error) {
    console.error('[POST /api/orders/:id/notify]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
