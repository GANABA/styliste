import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { templateCreateSchema } from "@/lib/validations/measurements";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const template = await prisma.measurementTemplate.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { measurements: true },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template non trouvé" },
        { status: 404 }
      );
    }

    // Check ownership
    if (template.stylistId !== session.user.stylistId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    return NextResponse.json({
      ...template,
      usageCount: template._count.measurements,
      _count: undefined,
    });
  } catch (error) {
    console.error("GET /api/measurement-templates/[id] error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du template" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = templateCreateSchema.parse(body);

    // Check ownership
    const existingTemplate = await prisma.measurementTemplate.findUnique({
      where: { id: params.id },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Template non trouvé" },
        { status: 404 }
      );
    }

    if (existingTemplate.stylistId !== session.user.stylistId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Update template
    const template = await prisma.measurementTemplate.update({
      where: { id: params.id },
      data: {
        name: validatedData.name,
        fields: validatedData.fields,
      },
    });

    return NextResponse.json(template);
  } catch (error: any) {
    console.error("PUT /api/measurement-templates/[id] error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la modification du template" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Check ownership
    const existingTemplate = await prisma.measurementTemplate.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { measurements: true },
        },
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Template non trouvé" },
        { status: 404 }
      );
    }

    if (existingTemplate.stylistId !== session.user.stylistId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Check if template is used
    const isUsed = existingTemplate._count.measurements > 0;

    if (isUsed) {
      // Soft delete if used
      const template = await prisma.measurementTemplate.update({
        where: { id: params.id },
        data: { deletedAt: new Date() },
      });

      return NextResponse.json({
        message: "Template archivé (utilisé par des mesures existantes)",
        template,
      });
    } else {
      // Hard delete if not used
      await prisma.measurementTemplate.delete({
        where: { id: params.id },
      });

      return NextResponse.json({
        message: "Template supprimé avec succès",
      });
    }
  } catch (error) {
    console.error("DELETE /api/measurement-templates/[id] error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du template" },
      { status: 500 }
    );
  }
}
