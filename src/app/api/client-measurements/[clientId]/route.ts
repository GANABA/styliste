import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateMeasurementSchema = z.object({
  measurements: z.record(z.string(), z.number()),
});

// PATCH /api/client-measurements/[measurementId] — modifier une mesure existante
export async function PATCH(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const measurementId = params.clientId; // le segment dynamique sert ici comme measurementId
    const body = await request.json();
    const { measurements } = updateMeasurementSchema.parse(body);

    // Vérifier que la mesure appartient à ce styliste via le client
    const measurement = await prisma.clientMeasurement.findUnique({
      where: { id: measurementId },
      include: { client: true },
    });

    if (!measurement) {
      return NextResponse.json({ error: "Mesure introuvable" }, { status: 404 });
    }

    if (measurement.client.stylistId !== session.user.stylistId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const updated = await prisma.clientMeasurement.update({
      where: { id: measurementId },
      data: { measurements: measurements as any, measuredAt: new Date() },
      include: { template: true },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    console.error("PATCH /api/client-measurements error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

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
