import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { uploadOrderPhoto, validateFile } from '@/lib/storage/upload'
import { getCurrentPlan } from '@/lib/helpers/subscription'

const MAX_PORTFOLIO_ITEMS = 50
const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const PORTFOLIO_PLANS = ['Pro', 'Premium']

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

    // Vérifier le plan
    const plan = await getCurrentPlan(stylistId)
    if (!PORTFOLIO_PLANS.includes(plan.name)) {
      return NextResponse.json(
        { error: 'PLAN_UPGRADE_REQUIRED', requiredPlan: 'PRO' },
        { status: 403 }
      )
    }

    // Vérifier la limite
    const itemCount = await prisma.portfolioItem.count({ where: { stylistId } })
    if (itemCount >= MAX_PORTFOLIO_ITEMS) {
      return NextResponse.json(
        { error: 'PORTFOLIO_LIMIT_REACHED', limit: MAX_PORTFOLIO_ITEMS },
        { status: 422 }
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
  } catch (error) {
    console.error('[POST /api/portfolio]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
