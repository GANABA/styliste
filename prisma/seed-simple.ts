import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { Client } from 'pg';
import * as bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Début du seeding...');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✓ Connecté à la base de données');

    // Créer les 3 plans de subscription
    console.log('Création des plans de subscription...');

    const plans = [
      {
        name: 'Découverte',
        price: 0,
        features: JSON.stringify({
          clients: 20,
          orders: 5,
          portfolio: false,
          notifications: false,
          support: 'community',
        }),
        limits: JSON.stringify({
          maxClients: 20,
          maxActiveOrders: 5,
          maxPortfolioItems: 0,
          smsCredits: 0,
        }),
      },
      {
        name: 'Standard',
        price: 5000,
        features: JSON.stringify({
          clients: 100,
          orders: 15,
          portfolio: false,
          notifications: 'auto',
          support: 'email',
        }),
        limits: JSON.stringify({
          maxClients: 100,
          maxActiveOrders: 15,
          maxPortfolioItems: 0,
          smsCredits: 50,
        }),
      },
      {
        name: 'Pro',
        price: 10000,
        features: JSON.stringify({
          clients: 'unlimited',
          orders: 20,
          portfolio: true,
          notifications: 'auto',
          support: 'priority',
        }),
        limits: JSON.stringify({
          maxClients: -1,
          maxActiveOrders: 20,
          maxPortfolioItems: 50,
          smsCredits: 200,
        }),
      },
    ];

    for (const plan of plans) {
      await client.query(
        `INSERT INTO subscription_plans (id, name, price, features, limits, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, true, NOW(), NOW())
         ON CONFLICT (name) DO NOTHING`,
        [plan.name, plan.price, plan.features, plan.limits]
      );
      console.log(`✓ Plan ${plan.name} créé`);
    }

    // Créer admin user
    console.log('Création de l\'admin user...');
    const adminPassword = await bcrypt.hash('admin1234', 12);
    await client.query(
      `INSERT INTO users (id, email, password, name, role, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, 'ADMIN', NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET password = $2, role = 'ADMIN'
       RETURNING id`,
      ['admin@styliste.com', adminPassword, 'Admin Styliste']
    );
    console.log('✓ Admin user créé/mis à jour:', 'admin@styliste.com / admin1234');

    // Créer test user + stylist + subscription
    console.log('Création d\'un styliste de test...');
    const testPassword = await bcrypt.hash('test1234', 12);
    const testUserResult = await client.query(
      `INSERT INTO users (id, email, password, name, role, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, 'STYLIST', NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET password = $2
       RETURNING id`,
      ['test@styliste.com', testPassword, 'Test Styliste']
    );

    if (testUserResult.rows.length > 0) {
      const testUserId = testUserResult.rows[0].id;

      const testStylistResult = await client.query(
        `INSERT INTO stylists (id, user_id, business_name, phone, city, address, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
         ON CONFLICT (user_id) DO UPDATE SET business_name = $2
         RETURNING id`,
        [testUserId, 'Atelier Test', '+229 97 00 00 00', 'Cotonou', 'Akpakpa, Cotonou, Bénin']
      );

      const testStylistId = testStylistResult.rows[0].id;

      // Get free plan ID
      const freePlanResult = await client.query(
        `SELECT id FROM subscription_plans WHERE name = 'Découverte' LIMIT 1`
      );
      const freePlanId = freePlanResult.rows[0].id;

      // Check if subscription already exists
      const existingSubResult = await client.query(
        `SELECT id FROM subscriptions WHERE stylist_id = $1`,
        [testStylistId]
      );

      if (existingSubResult.rows.length === 0) {
        await client.query(
          `INSERT INTO subscriptions (id, stylist_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, 'ACTIVE', NOW(), NOW() + INTERVAL '1 year', NOW(), NOW())`,
          [testStylistId, freePlanId]
        );
      }

      console.log('✓ Styliste de test créé: test@styliste.com');
    }

    // Créer styliste Pro de démo (pour l'annuaire public)
    console.log('Création du styliste Pro de démo...');
    const proPassword = await bcrypt.hash('pro1234', 12);
    const proUserResult = await client.query(
      `INSERT INTO users (id, email, password, name, role, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, 'STYLIST', NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET password = $2
       RETURNING id`,
      ['pro@styliste.com', proPassword, 'Aminata Coulibaly']
    );

    const proUserId = proUserResult.rows[0].id;

    const proStylistResult = await client.query(
      `INSERT INTO stylists (id, user_id, business_name, slug, phone, city, address, onboarding_completed, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, true, NOW(), NOW())
       ON CONFLICT (user_id) DO UPDATE SET business_name = $2, slug = $3
       RETURNING id`,
      [proUserId, 'Atelier Aminata Couture', 'aminata-couture', '+229 97 11 22 33', 'Cotonou', 'Haie Vive, Cotonou, Bénin']
    );

    const proStylistId = proStylistResult.rows[0].id;

    // Abonnement Pro actif
    const proPlanResult = await client.query(
      `SELECT id FROM subscription_plans WHERE name = 'Pro' LIMIT 1`
    );
    if (proPlanResult.rows.length > 0) {
      const proPlanId = proPlanResult.rows[0].id;
      const existingProSub = await client.query(
        `SELECT id FROM subscriptions WHERE stylist_id = $1`, [proStylistId]
      );
      if (existingProSub.rows.length === 0) {
        await client.query(
          `INSERT INTO subscriptions (id, stylist_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, 'ACTIVE', NOW(), NOW() + INTERVAL '1 year', NOW(), NOW())`,
          [proStylistId, proPlanId]
        );
      }
    }

    // Portfolio items publiés
    const existingPortfolio = await client.query(
      `SELECT id FROM portfolio_items WHERE stylist_id = $1 LIMIT 1`, [proStylistId]
    );
    if (existingPortfolio.rows.length === 0) {
      const portfolioItems = [
        ['Boubou brodé festif', 'Boubou en bazin riche avec broderies dorées, tenue de cérémonie.', '{"boubou","bazin","ceremonie"}', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
        ['Robe africaine wax', 'Robe longue en pagne wax, coupe moderne et élégante.', '{"robe","wax","moderne"}', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400'],
        ['Ensemble tailleur kente', 'Tailleur pantalon en tissu kente, coupe africaine contemporaine.', '{"tailleur","kente","contemporain"}', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400'],
      ];
      for (const [title, description, tags, imageUrl, thumbnailUrl] of portfolioItems) {
        await client.query(
          `INSERT INTO portfolio_items (id, stylist_id, image_url, thumbnail_url, title, description, tags, client_consent, is_published, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, true, true, NOW(), NOW())`,
          [proStylistId, imageUrl, thumbnailUrl, title, description, tags]
        );
      }
      console.log('✓ 3 portfolio items créés pour Aminata Couture');
    }
    console.log('✓ Styliste Pro créé: pro@styliste.com / pro1234');

    console.log('\n🎉 Seeding complété avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  } finally {
    await client.end();
  }
}

main();
