import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.stylistId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const stylist = await prisma.stylist.findUnique({
    where: { id: session.user.stylistId },
    select: {
      id: true,
      slug: true,
      businessName: true,
      phone: true,
      city: true,
      address: true,
      onboardingCompleted: true,
      user: { select: { name: true, email: true } },
    },
  })

  if (!stylist) {
    return NextResponse.json({ error: 'Styliste introuvable' }, { status: 404 })
  }

  return NextResponse.json(stylist)
}

const updateProfileSchema = z.object({
  businessName: z.string().min(2, 'Minimum 2 caractères').max(100).optional(),
  phone: z.string().min(8, 'Numéro invalide').max(20).optional(),
  city: z.string().max(100).optional(),
  address: z.string().max(255).optional(),
  name: z.string().min(2, 'Minimum 2 caractères').max(100).optional(),
})

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.stylistId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = updateProfileSchema.parse(body)

    const { name, ...stylistData } = data

    // Mise à jour en transaction si nom utilisateur aussi modifié
    const stylist = await prisma.$transaction(async (tx) => {
      if (name) {
        await tx.user.update({
          where: { id: session.user.id },
          data: { name },
        })
      }
      return tx.stylist.update({
        where: { id: session.user.stylistId! },
        data: stylistData,
        select: {
          id: true,
          slug: true,
          businessName: true,
          phone: true,
          city: true,
          address: true,
          user: { select: { name: true, email: true } },
        },
      })
    })

    return NextResponse.json(stylist)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Données invalides', details: error.errors }, { status: 400 })
    }
    console.error('[PUT /api/stylists/me]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
