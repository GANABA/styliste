import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { registerSchema } from '@/lib/validations';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Valider les données
    const validatedData = registerSchema.parse(body);

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await hash(validatedData.password, 12);

    // Récupérer le plan gratuit
    const freePlan = await prisma.subscriptionPlan.findUnique({
      where: {
        name: 'Découverte',
      },
    });

    if (!freePlan) {
      return NextResponse.json(
        { error: 'Free plan not found' },
        { status: 500 }
      );
    }

    // Créer l'utilisateur, le styliste et la subscription en transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Créer l'utilisateur
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.name,
          role: 'STYLIST',
        },
      });

      // Créer le styliste
      const stylist = await tx.stylist.create({
        data: {
          userId: user.id,
        },
      });

      // Créer la subscription gratuite
      const subscription = await tx.subscription.create({
        data: {
          stylistId: stylist.id,
          planId: freePlan.id,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 an
        },
      });

      return { user, stylist, subscription };
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
