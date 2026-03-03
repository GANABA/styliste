import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; photoId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier que la commande appartient au styliste
    const order = await prisma.order.findFirst({
      where: { id: params.id, stylistId: session.user.stylistId, deletedAt: null },
    })
    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }

    const photo = await prisma.orderPhoto.findFirst({
      where: { id: params.photoId, orderId: params.id },
    })
    if (!photo) {
      return NextResponse.json({ error: 'Photo introuvable' }, { status: 404 })
    }

    // Supprimer de la DB (le fichier R2/local est supprimé best-effort)
    await prisma.orderPhoto.delete({ where: { id: params.photoId } })

    // Tenter de supprimer le fichier physique (non bloquant)
    try {
      const { deleteOrderPhoto } = await import('@/lib/storage/upload')
      // Extraire la key depuis l'URL (convention : derniers segments du path)
      const urlPath = new URL(photo.photoUrl, 'http://localhost').pathname
      const key = urlPath.replace(/^\/uploads\//, '').replace(/^\//, '')
      const thumbPath = photo.thumbnailUrl
        ? new URL(photo.thumbnailUrl, 'http://localhost').pathname.replace(/^\/uploads\//, '').replace(/^\//, '')
        : key.replace('.webp', '_thumb.webp')
      await deleteOrderPhoto(key, thumbPath)
    } catch {
      // Ignorer les erreurs de suppression physique — la DB est déjà nettoyée
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[DELETE /api/orders/:id/photos/:photoId]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
