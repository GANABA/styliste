import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const item = await prisma.portfolioItem.findFirst({
      where: { id: params.id, stylistId: session.user.stylistId },
    })
    if (!item) {
      return NextResponse.json({ error: 'Item introuvable' }, { status: 404 })
    }

    const body = await request.json()
    const { isPublished, title, description, tags, clientConsent } = body

    const updated = await prisma.portfolioItem.update({
      where: { id: params.id },
      data: {
        ...(isPublished !== undefined && { isPublished }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(tags !== undefined && { tags }),
        ...(clientConsent !== undefined && { clientConsent }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PATCH /api/portfolio/:id]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const item = await prisma.portfolioItem.findFirst({
      where: { id: params.id, stylistId: session.user.stylistId },
    })
    if (!item) {
      return NextResponse.json({ error: 'Item introuvable' }, { status: 404 })
    }

    await prisma.portfolioItem.delete({ where: { id: params.id } })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[DELETE /api/portfolio/:id]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
