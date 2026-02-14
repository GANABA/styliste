import prisma from "@/lib/prisma";

export const PLAN_LIMITS = {
  Free: { maxClients: 20 },
  Standard: { maxClients: 100 },
  Pro: { maxClients: Infinity },
  Premium: { maxClients: Infinity },
} as const;

export async function getCurrentPlan(stylistId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      stylistId,
      status: "ACTIVE",
    },
    include: {
      plan: true,
    },
    orderBy: {
      currentPeriodEnd: "desc",
    },
  });

  if (!subscription) {
    // Retourner plan Free par défaut si aucun abonnement actif
    return {
      name: "Free" as const,
      limits: PLAN_LIMITS.Free,
    };
  }

  const planName = subscription.plan.name as keyof typeof PLAN_LIMITS;
  return {
    name: planName,
    limits: PLAN_LIMITS[planName] || PLAN_LIMITS.Free,
  };
}

export async function checkClientLimit(stylistId: string) {
  const plan = await getCurrentPlan(stylistId);

  const currentCount = await prisma.client.count({
    where: {
      stylistId,
      deletedAt: null,
    },
  });

  return {
    canCreate: currentCount < plan.limits.maxClients,
    current: currentCount,
    limit: plan.limits.maxClients,
    planName: plan.name,
  };
}
