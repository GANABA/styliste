import prisma from "@/lib/prisma";

export const PLAN_LIMITS: Record<string, {
  maxClients: number;
  maxActiveOrders: number;
  maxPortfolioItems: number;
  hasPortfolio: boolean;
  price: number; // FCFA
}> = {
  Découverte: { maxClients: 20, maxActiveOrders: 5, maxPortfolioItems: 0, hasPortfolio: false, price: 0 },
  Standard:   { maxClients: 100, maxActiveOrders: 15, maxPortfolioItems: 0, hasPortfolio: false, price: 5000 },
  Pro:        { maxClients: -1, maxActiveOrders: 20, maxPortfolioItems: 50, hasPortfolio: true, price: 10000 },
  Premium:    { maxClients: -1, maxActiveOrders: -1, maxPortfolioItems: -1, hasPortfolio: true, price: 20000 },
};

// Ordre des plans pour comparaison upgrade/downgrade
export const PLAN_ORDER = ['Découverte', 'Standard', 'Pro', 'Premium'];

export async function getCurrentPlan(stylistId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      stylistId,
      status: { in: ['ACTIVE', 'TRIAL'] },
    },
    include: { plan: true },
    orderBy: { currentPeriodEnd: 'desc' },
  });

  if (!subscription) {
    return { name: 'Découverte', limits: PLAN_LIMITS['Découverte'], subscription: null };
  }

  const planName = subscription.plan.name;
  return {
    name: planName,
    limits: PLAN_LIMITS[planName] ?? PLAN_LIMITS['Découverte'],
    subscription,
  };
}

export async function checkClientLimit(stylistId: string) {
  const plan = await getCurrentPlan(stylistId);
  const currentCount = await prisma.client.count({
    where: { stylistId, deletedAt: null },
  });

  const limit = plan.limits.maxClients;
  return {
    canCreate: limit === -1 || currentCount < limit,
    current: currentCount,
    limit,
    planName: plan.name,
  };
}

export async function checkOrderLimit(stylistId: string) {
  const plan = await getCurrentPlan(stylistId);

  const ACTIVE_STATUSES = ['QUOTE', 'IN_PROGRESS', 'READY'];
  const currentCount = await prisma.order.count({
    where: {
      stylistId,
      status: { in: ACTIVE_STATUSES as any },
      deletedAt: null,
    },
  });

  const limit = plan.limits.maxActiveOrders;
  return {
    canCreate: limit === -1 || currentCount < limit,
    current: currentCount,
    limit,
    planName: plan.name,
  };
}

export async function checkPortfolioLimit(stylistId: string) {
  const plan = await getCurrentPlan(stylistId);

  if (!plan.limits.hasPortfolio) {
    return {
      canCreate: false,
      current: 0,
      limit: 0,
      planName: plan.name,
      reason: 'Portfolio non disponible sur ce plan',
    };
  }

  const currentCount = await prisma.portfolioItem.count({
    where: { stylistId },
  });

  const limit = plan.limits.maxPortfolioItems;
  return {
    canCreate: limit === -1 || currentCount < limit,
    current: currentCount,
    limit,
    planName: plan.name,
  };
}

export async function getUsage(stylistId: string) {
  const plan = await getCurrentPlan(stylistId);
  const ACTIVE_STATUSES = ['QUOTE', 'IN_PROGRESS', 'READY'];

  const [clientCount, orderCount, portfolioCount] = await Promise.all([
    prisma.client.count({ where: { stylistId, deletedAt: null } }),
    prisma.order.count({ where: { stylistId, status: { in: ACTIVE_STATUSES as any }, deletedAt: null } }),
    prisma.portfolioItem.count({ where: { stylistId } }),
  ]);

  return {
    plan: plan.name,
    subscription: plan.subscription,
    usage: {
      clients: { current: clientCount, limit: plan.limits.maxClients },
      orders: { current: orderCount, limit: plan.limits.maxActiveOrders },
      portfolio: { current: portfolioCount, limit: plan.limits.maxPortfolioItems },
    },
  };
}
