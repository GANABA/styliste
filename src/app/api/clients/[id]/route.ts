import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { clientUpdateSchema } from "@/lib/validations/clients";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const client = await prisma.client.findUnique({
      where: { id: params.id },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client non trouvé" },
        { status: 404 }
      );
    }

    // Check ownership
    if (client.stylistId !== session.user.stylistId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("GET /api/clients/[id] error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du client" },
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
    const validatedData = clientUpdateSchema.parse(body);

    // Check ownership
    const existingClient = await prisma.client.findUnique({
      where: { id: params.id },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: "Client non trouvé" },
        { status: 404 }
      );
    }

    if (existingClient.stylistId !== session.user.stylistId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Update client
    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        email: validatedData.email || null,
      },
    });

    return NextResponse.json(client);
  } catch (error: any) {
    console.error("PUT /api/clients/[id] error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la modification du client" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.stylistId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const existingClient = await prisma.client.findUnique({
      where: { id: params.id },
    });

    if (!existingClient) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
    }

    if (existingClient.stylistId !== session.user.stylistId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const client = await prisma.client.update({
      where: { id: params.id },
      data: { deletedAt: null },
    });

    return NextResponse.json({ message: "Client restauré avec succès", client });
  } catch (error) {
    console.error("PATCH /api/clients/[id] error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la restauration du client" },
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
    const existingClient = await prisma.client.findUnique({
      where: { id: params.id },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: "Client non trouvé" },
        { status: 404 }
      );
    }

    if (existingClient.stylistId !== session.user.stylistId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Soft delete
    const client = await prisma.client.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      message: "Client archivé avec succès",
      client,
    });
  } catch (error) {
    console.error("DELETE /api/clients/[id] error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'archivage du client" },
      { status: 500 }
    );
  }
}
