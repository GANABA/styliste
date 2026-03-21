import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { uploadLogoImage } from '@/lib/storage/upload'
import { validateMagicBytes } from '@/lib/storage/validateMagicBytes'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.stylistId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('logo') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop lourd (max 2 Mo)' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Détecter le type réel via magic bytes
    const mimeType = file.type || 'image/jpeg'
    const magicCheck = validateMagicBytes(buffer, mimeType)
    if (!magicCheck.valid) {
      // Tenter les 3 formats courants si le mimeType déclaré ne correspond pas
      const formats = ['image/jpeg', 'image/png', 'image/webp']
      const anyValid = formats.some((fmt) => validateMagicBytes(buffer, fmt).valid)
      if (!anyValid) {
        return NextResponse.json({ error: 'Format non supporté (JPEG, PNG ou WebP uniquement)' }, { status: 400 })
      }
    }

    const { logoUrl } = await uploadLogoImage(buffer, session.user.stylistId)

    await prisma.stylist.update({
      where: { id: session.user.stylistId },
      data: { logoUrl },
    })

    return NextResponse.json({ logoUrl })
  } catch (error: unknown) {
    console.error('[POST /api/stylists/me/logo]', error)
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 })
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.stylistId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    await prisma.stylist.update({
      where: { id: session.user.stylistId },
      data: { logoUrl: null },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('[DELETE /api/stylists/me/logo]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
