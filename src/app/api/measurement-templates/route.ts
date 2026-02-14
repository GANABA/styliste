import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { templateCreateSchema } from "@/lib/validations/measurements";
import { seedDefaultTemplates } from "@/lib/seeds/defaultTemplates";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Lazy seeding: seed default templates on first access if empty
    await seedDefaultTemplates(session.user.stylistId);

    // Fetch templates with usage count
    const templates = await prisma.measurementTemplate.findMany({
      where: {
        stylistId: session.user.stylistId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: { measurements: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform to include usage count
    const templatesWithUsage = templates.map((template) => ({
      ...template,
      usageCount: template._count.measurements,
      _count: undefined,
    }));

    return NextResponse.json(templatesWithUsage);
  } catch (error) {
    console.error("GET /api/measurement-templates error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des templates" },
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
    const validatedData = templateCreateSchema.parse(body);

    // Create template
    const template = await prisma.measurementTemplate.create({
      data: {
        stylistId: session.user.stylistId,
        name: validatedData.name,
        fields: validatedData.fields,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/measurement-templates error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la création du template" },
      { status: 500 }
    );
  }
}
