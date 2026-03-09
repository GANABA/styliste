import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { uploadOrderPhoto, validateFile } from '@/lib/storage/upload'
import { checkPortfolioLimit } from '@/lib/helpers/subscription'

const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const items = await prisma.portfolioItem.findMany({
      where: { stylistId: session.user.stylistId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('[GET /api/portfolio]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const stylistId = session.user.stylistId

    // Vérifier le plan et la limite portfolio
    const portfolioLimit = await checkPortfolioLimit(stylistId)
    if (!portfolioLimit.canCreate) {
      const isPlanIssue = !('limit' in portfolioLimit) || portfolioLimit.limit === 0
      return NextResponse.json(
        {
          error: isPlanIssue ? 'PLAN_UPGRADE_REQUIRED' : 'PORTFOLIO_LIMIT_REACHED',
          message: isPlanIssue
            ? 'Le portfolio est disponible sur les plans Pro et Premium. Passez au plan Pro.'
            : `Limite portfolio atteinte (${portfolioLimit.current}/${portfolioLimit.limit}).`,
          requiredPlan: 'Pro',
        },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string | null
    const description = formData.get('description') as string | null
    const tagsRaw = formData.get('tags') as string | null
    const clientConsent = formData.get('clientConsent') === 'true'

    if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
    if (!title?.trim()) return NextResponse.json({ error: 'Titre obligatoire' }, { status: 400 })

    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Format non supporté (jpeg, png, webp)' }, { status: 415 })
    }

    const validation = validateFile(Buffer.alloc(0), file.type, file.size)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error ?? 'Fichier invalide' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const { photoUrl, thumbnailUrl } = await uploadOrderPhoto(buffer, `portfolio-${stylistId}`)

    const tags = tagsRaw
      ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
      : []

    const item = await prisma.portfolioItem.create({
      data: {
        stylistId,
        imageUrl: photoUrl,
        thumbnailUrl: thumbnailUrl ?? null,
        title: title.trim(),
        description: description?.trim() ?? null,
        tags,
        clientConsent,
        isPublished: false,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error: any) {
    if (error?.message === 'STORAGE_NOT_CONFIGURED') {
      return NextResponse.json(
        { error: 'STORAGE_NOT_CONFIGURED', message: 'Stockage non configuré. Veuillez configurer Cloudflare R2 (R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ACCOUNT_ID, R2_BUCKET_NAME, R2_PUBLIC_URL).' },
        { status: 503 }
      )
    }
    console.error('[POST /api/portfolio]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
