import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    await prisma.stylist.update({
      where: { id: session.user.stylistId },
      data: { onboardingCompleted: true },
    })

    return NextResponse.json({ success: true, onboardingCompleted: true })
  } catch (error) {
    console.error('[PATCH /api/stylists/me/onboarding]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
