import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

function getPeriodStart(period: string): Date | null {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  switch (period) {
    case '7d':  { const d = new Date(now); d.setDate(d.getDate() - 7);   return d; }
    case '30d': { const d = new Date(now); d.setDate(d.getDate() - 30);  return d; }
    case '3m':  { const d = new Date(now); d.setMonth(d.getMonth() - 3); return d; }
    case '12m': { const d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d; }
    case 'all': return null;
    default:    { const d = new Date(now); d.setDate(d.getDate() - 30);  return d; }
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const stylist = await prisma.stylist.findUnique({
    where: { userId: session.user.id },
  });
  if (!stylist) {
    return NextResponse.json({ error: 'Styliste introuvable' }, { status: 404 });
  }

  const period = req.nextUrl.searchParams.get('period') ?? '30d';
  const periodStart = getPeriodStart(period);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

  const [
    activeOrders,
    readyOrders,
    overdueOrders,
    revenueAgg,
    recentOrders,
    upcomingDeadlines,
  ] = await Promise.all([
    // Commandes actives (en cours de confection + prêtes mais non livrées)
    prisma.order.count({
      where: {
        stylistId: stylist.id,
        status: { in: ['IN_PROGRESS', 'READY'] },
        deletedAt: null,
      },
    }),

    // Commandes prêtes à remettre au client
    prisma.order.count({
      where: {
        stylistId: stylist.id,
        status: 'READY',
        deletedAt: null,
      },
    }),

    // Commandes en retard : date promise dépassée, pas encore livrées ni annulées
    prisma.order.count({
      where: {
        stylistId: stylist.id,
        promisedDate: { lt: today },
        status: { notIn: ['DELIVERED', 'CANCELED'] },
        deletedAt: null,
      },
    }),

    // CA sur la période sélectionnée (paiements complétés)
    prisma.payment.aggregate({
      where: {
        stylistId: stylist.id,
        paymentStatus: 'COMPLETED',
        ...(periodStart ? { paymentDate: { gte: periodStart } } : {}),
      },
      _sum: { amount: true },
    }),

    // 5 dernières commandes créées
    prisma.order.findMany({
      where: { stylistId: stylist.id, deletedAt: null },
      include: {
        client: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),

    // Échéances dans les 7 prochains jours
    prisma.order.findMany({
      where: {
        stylistId: stylist.id,
        promisedDate: { gte: today, lte: sevenDaysLater },
        status: { notIn: ['DELIVERED', 'CANCELED'] },
        deletedAt: null,
      },
      include: {
        client: { select: { id: true, name: true } },
      },
      orderBy: { promisedDate: 'asc' },
    }),
  ]);

  return NextResponse.json({
    activeOrders,
    readyOrders,
    overdueOrders,
    revenue: revenueAgg._sum.amount ?? 0, // en centimes
    recentOrders,
    upcomingDeadlines,
  });
}
