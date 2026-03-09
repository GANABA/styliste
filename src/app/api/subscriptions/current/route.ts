import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUsage } from '@/lib/helpers/subscription'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const data = await getUsage(session.user.stylistId)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[GET /api/subscriptions/current]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
