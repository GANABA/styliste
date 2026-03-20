import { GlobalStats } from '@/components/admin/GlobalStats'
import { Shield } from 'lucide-react'
import prisma from '@/lib/prisma'

async function getStats() {
  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [totalStylists, activeStylists, totalOrders, planDistribution] = await Promise.all([
      prisma.user.count({ where: { role: 'STYLIST', deletedAt: null } }),
      prisma.order.groupBy({
        by: ['stylistId'],
        where: { createdAt: { gte: sevenDaysAgo }, deletedAt: null },
        _count: true,
      }).then((r) => r.length),
      prisma.order.count({ where: { deletedAt: null } }),
      prisma.subscriptionPlan.findMany({
        include: {
          _count: {
            select: { subscriptions: { where: { status: { in: ['ACTIVE', 'TRIAL'] } } } },
          },
        },
      }),
    ])

    return {
      totalStylists,
      activeStylists,
      totalOrders,
      planDistribution: planDistribution.map((p) => ({ name: p.name, count: p._count.subscriptions })),
    }
  } catch {
    return null
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-red-500" />
        <div>
          <h1 className="page-title">Dashboard Administration</h1>
          <p className="text-sm text-gray-500">Vue d&apos;ensemble de la plateforme</p>
        </div>
      </div>

      {stats ? (
        <GlobalStats data={stats} />
      ) : (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Impossible de charger les statistiques.
        </div>
      )}
    </div>
  )
}
