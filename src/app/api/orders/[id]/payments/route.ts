import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type { PrismaClient } from '@prisma/client';
import { PaymentStatus } from '@prisma/client';

const createPaymentSchema = z.object({
  amount: z.number().int().positive('Le montant doit être supérieur à 0'),
  paymentType: z.enum(['ADVANCE', 'PARTIAL', 'FINAL', 'REFUND']),
  paymentMethod: z.enum(['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER']),
  mobileMoneyProvider: z.string().optional(),
  mobileMoneyNumber: z.string().optional(),
  transactionReference: z.string().optional(),
  notes: z.string().optional(),
  paymentDate: z.string().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.stylistId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const stylistId = session.user.stylistId;

  const order = await prisma.order.findFirst({
    where: { id: params.id, stylistId, deletedAt: null },
  });
  if (!order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
  }

  const payments = await prisma.payment.findMany({
    where: { orderId: params.id },
    orderBy: { paymentDate: 'asc' },
  });

  return NextResponse.json({ payments });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.stylistId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const stylistId = session.user.stylistId;

  const order = await prisma.order.findFirst({
    where: { id: params.id, stylistId, deletedAt: null },
  });
  if (!order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
  }

  const body = await req.json();
  const parsed = createPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Le montant reçu est en centimes (PaymentForm multiplie par 100)
  const result = await prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => {
    const payment = await tx.payment.create({
      data: {
        orderId: params.id,
        stylistId,
        amount: data.amount, // stocké en centimes
        paymentType: data.paymentType,
        paymentMethod: data.paymentMethod,
        mobileMoneyProvider: data.mobileMoneyProvider,
        mobileMoneyNumber: data.mobileMoneyNumber,
        transactionReference: data.transactionReference,
        notes: data.notes,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
        paymentStatus: 'COMPLETED',
      },
    });

    // Recalculer le total payé (en centimes) puis convertir en FCFA pour cohérence avec totalPrice
    const allPayments = await tx.payment.aggregate({
      where: { orderId: params.id, paymentStatus: 'COMPLETED' },
      _sum: { amount: true },
    });
    const totalPaidCentimes = allPayments._sum.amount ?? 0;
    // order.totalPrice est en FCFA, on convertit totalPaid en FCFA aussi
    const totalPaidFCFA = Math.floor(totalPaidCentimes / 100);

    // Calculer le statut de paiement — comparaison FCFA vs FCFA
    let newPaymentStatus: PaymentStatus;
    if (totalPaidFCFA <= 0) {
      newPaymentStatus = PaymentStatus.UNPAID;
    } else if (totalPaidFCFA >= order.totalPrice) {
      newPaymentStatus = PaymentStatus.PAID;
    } else {
      newPaymentStatus = PaymentStatus.PARTIAL;
    }

    const updatedOrder = await tx.order.update({
      where: { id: params.id },
      data: {
        totalPaid: totalPaidFCFA, // stocké en FCFA, cohérent avec totalPrice
        paymentStatus: newPaymentStatus,
      },
    });

    return { payment, order: updatedOrder };
  });

  return NextResponse.json(result, { status: 201 });
}
