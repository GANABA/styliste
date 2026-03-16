import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.stylistId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const stylistId = session.user.stylistId;

  const payments = await prisma.payment.findMany({
    where: { stylistId },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          garmentType: true,
          totalPrice: true,
          client: {
            select: { id: true, name: true },
          },
        },
      },
    },
    orderBy: { paymentDate: 'desc' },
  });

  const total = payments
    .filter((p) => p.paymentStatus === 'COMPLETED')
    .reduce((sum: number, p) => sum + p.amount, 0);

  return NextResponse.json({ payments, total });
}
