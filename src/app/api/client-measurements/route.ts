import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { measurementCreateSchema } from "@/lib/validations/measurements";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = measurementCreateSchema.parse(body);

    // Verify client ownership
    const client = await prisma.client.findUnique({
      where: { id: validatedData.clientId },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client non trouvé" },
        { status: 404 }
      );
    }

    if (client.stylistId !== session.user.stylistId) {
      return NextResponse.json(
        { error: "Non autorisé - ce client ne vous appartient pas" },
        { status: 403 }
      );
    }

    // Verify template ownership
    const template = await prisma.measurementTemplate.findUnique({
      where: { id: validatedData.templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template non trouvé" },
        { status: 404 }
      );
    }

    if (template.stylistId !== session.user.stylistId) {
      return NextResponse.json(
        { error: "Non autorisé - ce template ne vous appartient pas" },
        { status: 403 }
      );
    }

    // Validate measurements against template fields
    const templateFields = template.fields as any;
    const fields = templateFields.fields || templateFields;

    if (Array.isArray(fields)) {
      // Check required fields
      for (const field of fields) {
        if (field.required && !(field.name in validatedData.measurements)) {
          return NextResponse.json(
            {
              error: `Le champ "${field.label}" est obligatoire`,
              field: field.name,
            },
            { status: 400 }
          );
        }
      }
    }

    // Create measurement with current timestamp
    const measurement = await prisma.clientMeasurement.create({
      data: {
        clientId: validatedData.clientId,
        templateId: validatedData.templateId,
        measurements: validatedData.measurements,
        measuredAt: new Date(),
      },
      include: {
        template: true,
      },
    });

    return NextResponse.json(measurement, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/client-measurements error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement des mesures" },
      { status: 500 }
    );
  }
}
