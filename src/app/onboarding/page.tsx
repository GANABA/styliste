import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.stylistId) redirect('/login')

  const stylistId = session.user.stylistId

  // Si onboarding déjà complété → dashboard
  const stylist = await prisma.stylist.findUnique({
    where: { id: stylistId },
    include: {
      _count: { select: { clients: { where: { deletedAt: null } }, orders: { where: { deletedAt: null } }, portfolioItems: true } },
    },
  })

  if (stylist?.onboardingCompleted) {
    redirect('/dashboard')
  }

  const data = {
    hasProfile: !!(stylist?.businessName || stylist?.phone || stylist?.city),
    hasClient: (stylist?._count.clients ?? 0) > 0,
    hasOrder: (stylist?._count.orders ?? 0) > 0,
    hasPortfolio: (stylist?._count.portfolioItems ?? 0) > 0,
  }

  return <OnboardingWizard data={data} />
}
