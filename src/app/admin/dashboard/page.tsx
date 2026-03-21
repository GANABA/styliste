import { GlobalStats } from '@/components/admin/GlobalStats'
import { Shield, AlertTriangle } from 'lucide-react'
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
        orderBy: { price: 'asc' },
      }),
    ])

    return {
      totalStylists,
      activeStylists,
      totalOrders,
      planDistribution: planDistribution.map((p) => ({
        name: p.name,
        count: p._count.subscriptions,
      })),
    }
  } catch {
    return null
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
          <Shield className="h-4.5 w-4.5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-black text-stone-900" style={{ fontFamily: 'var(--font-playfair)' }}>
            Vue d&apos;ensemble
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">Métriques globales de la plateforme</p>
        </div>
      </div>

      {stats ? (
        <GlobalStats data={stats} />
      ) : (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">Impossible de charger les statistiques. Vérifiez la connexion à la base de données.</p>
        </div>
      )}
    </div>
  )
}
