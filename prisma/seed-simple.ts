import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { Client } from 'pg';
import * as bcrypt from 'bcrypt';

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
        price: 500000,
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
        price: 1000000,
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
    const adminResult = await client.query(
      `INSERT INTO users (id, email, password, name, role, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, 'ADMIN', NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET password = $2
       RETURNING id`,
      ['admin@styliste.com', adminPassword, 'Admin Styliste']
    );
    console.log('✓ Admin user créé:', 'admin@styliste.com');

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

    console.log('\n🎉 Seeding complété avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  } finally {
    await client.end();
  }
}

main();
