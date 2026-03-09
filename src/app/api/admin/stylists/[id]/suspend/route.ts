import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { stylist: true },
    })

    if (!user || user.role !== 'STYLIST') {
      return NextResponse.json({ error: 'Styliste introuvable' }, { status: 404 })
    }

    const newSuspended = !user.suspended
    await prisma.user.update({
      where: { id: params.id },
      data: { suspended: newSuspended },
    })

    // Log d'audit
    await prisma.auditLog.create({
      data: {
        adminId: session.user.id,
        action: newSuspended ? 'SUSPEND_STYLIST' : 'REACTIVATE_STYLIST',
        targetType: 'stylist',
        targetId: user.stylist?.id ?? params.id,
        metadata: { userId: params.id, email: user.email },
      },
    })

    return NextResponse.json({
      success: true,
      suspended: newSuspended,
      message: newSuspended ? 'Compte suspendu' : 'Compte réactivé',
    })
  } catch (error) {
    console.error('[POST /api/admin/stylists/[id]/suspend]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
