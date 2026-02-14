import prisma from "@/lib/prisma";

export const DEFAULT_TEMPLATES = {
  homme: {
    name: "Homme",
    fields: [
      { name: "tour_poitrine", label: "Tour de poitrine", unit: "cm", required: true },
      { name: "tour_taille", label: "Tour de taille", unit: "cm", required: true },
      { name: "longueur_pantalon", label: "Longueur pantalon", unit: "cm", required: true },
      { name: "tour_cou", label: "Tour de cou", unit: "cm", required: true },
      { name: "longueur_manche", label: "Longueur manche", unit: "cm", required: true },
      { name: "tour_hanche", label: "Tour de hanche", unit: "cm", required: true },
    ],
  },
  femme: {
    name: "Femme",
    fields: [
      { name: "tour_poitrine", label: "Tour de poitrine", unit: "cm", required: true },
      { name: "tour_taille", label: "Tour de taille", unit: "cm", required: true },
      { name: "tour_hanche", label: "Tour de hanche", unit: "cm", required: true },
      { name: "longueur_robe", label: "Longueur robe", unit: "cm", required: true },
      { name: "longueur_jupe", label: "Longueur jupe", unit: "cm", required: true },
      { name: "tour_bras", label: "Tour de bras", unit: "cm", required: true },
    ],
  },
  enfant: {
    name: "Enfant",
    fields: [
      { name: "tour_poitrine", label: "Tour de poitrine", unit: "cm", required: true },
      { name: "tour_taille", label: "Tour de taille", unit: "cm", required: true },
      { name: "hauteur", label: "Hauteur", unit: "cm", required: true },
      { name: "longueur_pantalon", label: "Longueur pantalon", unit: "cm", required: true },
    ],
  },
};

export async function seedDefaultTemplates(stylistId: string) {
  // Check if stylist already has templates
  const existingCount = await prisma.measurementTemplate.count({
    where: { stylistId },
  });

  if (existingCount > 0) {
    // Skip seeding if templates already exist
    return { seeded: false, count: existingCount };
  }

  // Create default templates
  const templates = await Promise.all([
    prisma.measurementTemplate.create({
      data: {
        stylistId,
        name: DEFAULT_TEMPLATES.homme.name,
        fields: DEFAULT_TEMPLATES.homme.fields,
      },
    }),
    prisma.measurementTemplate.create({
      data: {
        stylistId,
        name: DEFAULT_TEMPLATES.femme.name,
        fields: DEFAULT_TEMPLATES.femme.fields,
      },
    }),
    prisma.measurementTemplate.create({
      data: {
        stylistId,
        name: DEFAULT_TEMPLATES.enfant.name,
        fields: DEFAULT_TEMPLATES.enfant.fields,
      },
    }),
  ]);

  return { seeded: true, count: templates.length, templates };
}
