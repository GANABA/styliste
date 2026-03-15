// Load environment variables FIRST
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Now import everything else
import { PrismaClient } from '@prisma/client';
import { neonConfig, Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import * as bcrypt from 'bcryptjs';
import ws from 'ws';

// Configure Neon with WebSocket
neonConfig.webSocketConstructor = ws;

// Get connection string and create pool
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set in environment variables');
  throw new Error('DATABASE_URL is required');
}

console.log('✓ DATABASE_URL found:', connectionString?.substring(0, 50) + '...');
console.log('Creating Neon pool with connection string...');
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Début du seeding...');

  // Créer les 3 plans de subscription
  console.log('Création des plans de subscription...');

  const freePlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'Découverte' },
    update: {},
    create: {
      name: 'Découverte',
      price: 0, // Gratuit
      features: {
        clients: 20,
        orders: 5,
        portfolio: false,
        notifications: false,
        support: 'community',
      },
      limits: {
        maxClients: 20,
        maxActiveOrders: 5,
        maxPortfolioItems: 0,
        smsCredits: 0,
      },
      isActive: true,
    },
  });

  const standardPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'Standard' },
    update: {},
    create: {
      name: 'Standard',
      price: 500000, // 5000 FCFA (en centimes)
      features: {
        clients: 100,
        orders: 15,
        portfolio: false,
        notifications: 'auto',
        support: 'email',
      },
      limits: {
        maxClients: 100,
        maxActiveOrders: 15,
        maxPortfolioItems: 0,
        smsCredits: 50,
      },
      isActive: true,
    },
  });

  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'Pro' },
    update: {},
    create: {
      name: 'Pro',
      price: 1000000, // 10000 FCFA (en centimes)
      features: {
        clients: 'unlimited',
        orders: 20,
        portfolio: true,
        notifications: 'auto',
        support: 'priority',
      },
      limits: {
        maxClients: -1, // Illimité
        maxActiveOrders: 20,
        maxPortfolioItems: 50,
        smsCredits: 200,
      },
      isActive: true,
    },
  });

  console.log('✅ Plans de subscription créés:', {
    free: freePlan.name,
    standard: standardPlan.name,
    pro: proPlan.name,
  });

  // Créer un admin user de test
  console.log('Création de l\'admin user de test...');

  const hashedPassword = await bcrypt.hash('admin123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@styliste.com' },
    update: { role: 'ADMIN', password: hashedPassword }, // force le rôle ADMIN même si le compte existait déjà
    create: {
      email: 'admin@styliste.com',
      password: hashedPassword,
      name: 'Admin Styliste',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user créé:', adminUser.email);

  // Créer un styliste de test avec subscription gratuite
  console.log('Création d\'un styliste de test...');

  const testHashedPassword = await bcrypt.hash('test123', 12);

  const testUser = await prisma.user.upsert({
    where: { email: 'test@styliste.com' },
    update: {},
    create: {
      email: 'test@styliste.com',
      password: testHashedPassword,
      name: 'Test Styliste',
      role: 'STYLIST',
    },
  });

  const testStylist = await prisma.stylist.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      businessName: 'Atelier Test',
      phone: '+229 97 00 00 00',
      city: 'Cotonou',
      address: 'Akpakpa, Cotonou, Bénin',
    },
  });

  const testSubscription = await prisma.subscription.upsert({
    where: { id: testStylist.id }, // Utiliser le stylist ID comme unique identifier
    update: {},
    create: {
      stylistId: testStylist.id,
      planId: freePlan.id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 an
    },
  });

  console.log('✅ Styliste de test créé:', {
    email: testUser.email,
    businessName: testStylist.businessName,
    plan: 'Découverte (Free)',
  });

  // Créer un styliste Pro de démo (pour l'annuaire public)
  console.log('Création d\'un styliste Pro de démo...');

  const proHashedPassword = await bcrypt.hash('pro123', 12);

  const proUser = await prisma.user.upsert({
    where: { email: 'pro@styliste.com' },
    update: {},
    create: {
      email: 'pro@styliste.com',
      password: proHashedPassword,
      name: 'Aminata Coulibaly',
      role: 'STYLIST',
    },
  });

  const proStylist = await prisma.stylist.upsert({
    where: { userId: proUser.id },
    update: {},
    create: {
      userId: proUser.id,
      businessName: 'Atelier Aminata Couture',
      slug: 'aminata-couture',
      phone: '+229 97 11 22 33',
      city: 'Cotonou',
      address: 'Haie Vive, Cotonou, Bénin',
      onboardingCompleted: true,
    },
  });

  // Abonnement Pro actif
  const existingProSub = await prisma.subscription.findFirst({
    where: { stylistId: proStylist.id },
  });
  if (!existingProSub) {
    await prisma.subscription.create({
      data: {
        stylistId: proStylist.id,
        planId: proPlan.id,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Portfolio items publiés (images placeholder)
  const existingPortfolio = await prisma.portfolioItem.findFirst({
    where: { stylistId: proStylist.id },
  });
  if (!existingPortfolio) {
    await prisma.portfolioItem.createMany({
      data: [
        {
          stylistId: proStylist.id,
          imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
          thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
          title: 'Boubou brodé festif',
          description: 'Boubou en bazin riche avec broderies dorées, tenue de cérémonie.',
          tags: ['boubou', 'bazin', 'ceremonie'],
          isPublished: true,
          clientConsent: true,
        },
        {
          stylistId: proStylist.id,
          imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800',
          thumbnailUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400',
          title: 'Robe africaine wax',
          description: 'Robe longue en pagne wax, coupe moderne et élégante.',
          tags: ['robe', 'wax', 'moderne'],
          isPublished: true,
          clientConsent: true,
        },
        {
          stylistId: proStylist.id,
          imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
          thumbnailUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400',
          title: 'Ensemble tailleur kente',
          description: 'Tailleur pantalon en tissu kente, coupe africaine contemporaine.',
          tags: ['tailleur', 'kente', 'contemporain'],
          isPublished: true,
          clientConsent: true,
        },
      ],
    });
  }

  console.log('✅ Styliste Pro de démo créé:', {
    email: proUser.email,
    businessName: proStylist.businessName,
    slug: 'aminata-couture',
    plan: 'Pro',
  });

  // Migration slugs manquants pour les stylistes existants
  console.log('Migration des slugs manquants...');
  const stylistsWithoutSlug = await prisma.stylist.findMany({
    where: { slug: null },
    include: { user: { select: { name: true } } },
  });

  for (const s of stylistsWithoutSlug) {
    const baseName = s.businessName ?? s.user.name ?? 'styliste';
    const baseSlug = baseName
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    let slug = baseSlug;
    let attempt = 1;
    while (true) {
      const existing = await prisma.stylist.findUnique({ where: { slug } });
      if (!existing) break;
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }
    await prisma.stylist.update({ where: { id: s.id }, data: { slug } });
    console.log(`  ✓ Slug généré pour ${s.businessName ?? s.user.name}: ${slug}`);
  }

  if (stylistsWithoutSlug.length === 0) {
    console.log('  ✓ Tous les stylistes ont déjà un slug.');
  }

  console.log('🎉 Seeding complété avec succès !');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erreur lors du seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
