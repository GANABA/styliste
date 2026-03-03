import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { clientCreateSchema } from "@/lib/validations/clients";
import { checkClientLimit } from "@/lib/helpers/subscription";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    // Support both ?status=archived and ?archived=true
    const archived = searchParams.get("archived") === "true" || searchParams.get("status") === "archived";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      stylistId: session.user.stylistId,
    };

    // Filter by status
    if (archived) {
      where.deletedAt = { not: null };
    } else {
      where.deletedAt = null;
    }

    // Search by name or phone
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.client.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Include limit info for the counter UI
    const limitInfo = await checkClientLimit(session.user.stylistId);

    return NextResponse.json({
      clients,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      limitInfo: {
        current: limitInfo.current,
        limit: limitInfo.limit,
        planName: limitInfo.planName,
      },
    });
  } catch (error) {
    console.error("GET /api/clients error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des clients" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = clientCreateSchema.parse(body);

    // Check subscription limits
    const limitCheck = await checkClientLimit(session.user.stylistId);

    if (!limitCheck.canCreate) {
      return NextResponse.json(
        {
          error: `Limite de ${limitCheck.limit} clients atteinte. Passez au plan supérieur.`,
          current: limitCheck.current,
          limit: limitCheck.limit,
          planName: limitCheck.planName,
        },
        { status: 403 }
      );
    }

    // Create client
    const client = await prisma.client.create({
      data: {
        ...validatedData,
        email: validatedData.email || null,
        stylistId: session.user.stylistId,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/clients error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la création du client" },
      { status: 500 }
    );
  }
}
