import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { PhotoType } from '@prisma/client'
import { uploadOrderPhoto, validateFile } from '@/lib/storage/upload'

const MAX_PHOTOS_PER_ORDER = 10
const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const order = await prisma.order.findFirst({
      where: { id: params.id, stylistId: session.user.stylistId, deletedAt: null },
    })
    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }

    const photos = await prisma.orderPhoto.findMany({
      where: { orderId: params.id },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    })

    return NextResponse.json(photos)
  } catch (error) {
    console.error('[GET /api/orders/:id/photos]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Vérifier la limite de photos
    const photoCount = await prisma.orderPhoto.count({ where: { orderId: params.id } })
    if (photoCount >= MAX_PHOTOS_PER_ORDER) {
      return NextResponse.json(
        { error: 'PHOTO_LIMIT_REACHED', limit: MAX_PHOTOS_PER_ORDER },
        { status: 422 }
      )
    }

    // Parser le multipart/form-data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const photoType = formData.get('photoType') as string | null
    const caption = formData.get('caption') as string | null

    if (!file) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
    }

    if (!photoType || !Object.values(PhotoType).includes(photoType as PhotoType)) {
      return NextResponse.json(
        { error: 'photoType invalide. Valeurs : REFERENCE, FABRIC, FITTING, FINISHED' },
        { status: 400 }
      )
    }

    const mimeType = file.type
    const size = file.size

    // Valider le format et la taille
    if (!ACCEPTED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: 'UNSUPPORTED_FORMAT', accepted: ACCEPTED_MIME_TYPES },
        { status: 415 }
      )
    }

    const validation = validateFile(Buffer.alloc(0), mimeType, size)
    if (!validation.valid) {
      if (validation.error === 'FILE_TOO_LARGE') {
        return NextResponse.json({ error: 'FILE_TOO_LARGE', maxSizeMB: 5 }, { status: 413 })
      }
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Convertir en Buffer et uploader
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { photoUrl, thumbnailUrl, key, thumbnailKey } = await uploadOrderPhoto(buffer, params.id)

    const photo = await prisma.orderPhoto.create({
      data: {
        orderId: params.id,
        photoUrl,
        thumbnailUrl,
        photoType: photoType as PhotoType,
        caption: caption || null,
        displayOrder: photoCount,
      },
    })

    // Stocker les clés de stockage dans un champ séparé non exposé via l'API publique
    // (Dans une vraie app, on stockerait key/thumbnailKey en DB pour pouvoir supprimer)
    // Pour le MVP, on les encode dans une convention de nommage de l'URL

    return NextResponse.json(photo, { status: 201 })
  } catch (error) {
    console.error('[POST /api/orders/:id/photos]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
