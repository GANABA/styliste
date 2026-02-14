import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Verify client ownership first
    const client = await prisma.client.findUnique({
      where: { id: params.clientId },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client non trouvé" },
        { status: 404 }
      );
    }

    if (client.stylistId !== session.user.stylistId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Get query params for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Fetch measurement history
    const [measurements, total] = await Promise.all([
      prisma.clientMeasurement.findMany({
        where: { clientId: params.clientId },
        include: {
          template: true,
        },
        orderBy: { measuredAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.clientMeasurement.count({
        where: { clientId: params.clientId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      measurements,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("GET /api/client-measurements/[clientId] error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'historique des mesures" },
      { status: 500 }
    );
  }
}
