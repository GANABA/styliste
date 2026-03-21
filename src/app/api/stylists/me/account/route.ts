import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    // Soft-delete : on marque deletedAt sur le styliste et l'utilisateur
    await prisma.$transaction(async (tx) => {
      if (session.user.stylistId) {
        await tx.stylist.update({
          where: { id: session.user.stylistId },
          data: { deletedAt: new Date() },
        })
      }
      await tx.user.update({
        where: { id: session.user.id },
        data: { deletedAt: new Date() },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('[DELETE /api/stylists/me/account]', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression du compte' }, { status: 500 })
  }
}
