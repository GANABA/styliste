import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.stylistId) {
      return NextResponse.json({ onboardingCompleted: true }) // pas de stylist = admin, pas de redirect
    }

    const stylist = await prisma.stylist.findUnique({
      where: { id: session.user.stylistId },
      select: { onboardingCompleted: true },
    })

    return NextResponse.json({ onboardingCompleted: stylist?.onboardingCompleted ?? false })
  } catch {
    return NextResponse.json({ onboardingCompleted: true }) // fail open
  }
}
