import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // Pas de stylistId = compte admin, onboarding non applicable
  if (!session.user.stylistId) {
    return NextResponse.json({ onboardingCompleted: true })
  }

  try {
    const stylist = await prisma.stylist.findUnique({
      where: { id: session.user.stylistId },
      select: { onboardingCompleted: true },
    })

    return NextResponse.json({ onboardingCompleted: stylist?.onboardingCompleted ?? false })
  } catch {
    // fail-safe : retourner false pour forcer le redirect onboarding plutôt que de laisser passer
    return NextResponse.json({ onboardingCompleted: false })
  }
}
