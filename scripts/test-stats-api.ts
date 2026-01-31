import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { orders, stylistes, clients } from '../src/lib/db/schema';
import { eq, and, isNull, gte, lte, sql } from 'drizzle-orm';
import { startOfMonth, addDays } from 'date-fns';
import { config } from 'dotenv';

config();

const DATABASE_URL = process.env.DATABASE_URL || '';
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

const client = postgres(DATABASE_URL);
const db = drizzle(client);

async function testStatsQuery() {
  console.log('🧪 Test de la requête des statistiques\n');

  try {
    // D'abord, vérifions combien de stylistes existent
    const allStylistes = await db.select().from(stylistes);
    console.log(`📊 Nombre de stylistes en base: ${allStylistes.length}`);

    if (allStylistes.length === 0) {
      console.log('❌ Aucun styliste trouvé en base de données!');
      console.log('   Créez d\'abord un compte styliste via /signup');
      return;
    }

    // Utilisons le premier styliste pour le test
    const styliste = allStylistes[0];
    console.log(`✅ Styliste trouvé: ID = ${styliste.id}\n`);

    const now = new Date();
    const monthStart = startOfMonth(now);
    const weekEnd = addDays(now, 7);

    // Formatter les dates pour la colonne due_date
    const today = now.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    console.log('1️⃣ Requête: Compteurs par statut...');
    const statusCounts = await db
      .select({
        status: orders.status,
        count: sql<number>`count(*)::int`,
      })
      .from(orders)
      .where(and(eq(orders.stylisteId, styliste.id), isNull(orders.deletedAt)))
      .groupBy(orders.status);

    console.log('   Résultat:', statusCounts);

    const counts = {
      pending: 0,
      ready: 0,
      delivered: 0,
    };

    for (const row of statusCounts) {
      if (row.status === 'pending' || row.status === 'ready' || row.status === 'delivered') {
        counts[row.status] = row.count;
      }
    }

    console.log('   Compteurs:', counts);

    console.log('\n2️⃣ Requête: Commandes livrées ce mois...');
    const [deliveredThisMonth] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.stylisteId, styliste.id),
          eq(orders.status, 'delivered'),
          gte(orders.deliveredAt, monthStart),
          isNull(orders.deletedAt)
        )
      );

    console.log('   Résultat:', deliveredThisMonth);

    console.log('\n3️⃣ Requête: Chiffre d\'affaires du mois...');
    const [revenueResult] = await db
      .select({
        revenue: sql<string>`COALESCE(SUM(CAST(price AS NUMERIC)), 0)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.stylisteId, styliste.id),
          eq(orders.status, 'delivered'),
          gte(orders.deliveredAt, monthStart),
          isNull(orders.deletedAt)
        )
      );

    const monthlyRevenue = parseFloat(revenueResult?.revenue || '0');
    console.log('   Résultat:', monthlyRevenue);

    console.log('\n4️⃣ Requête: Commandes à livrer cette semaine...');
    const dueThisWeek = await db
      .select({
        order: orders,
        client: clients,
      })
      .from(orders)
      .leftJoin(clients, eq(orders.clientId, clients.id))
      .where(
        and(
          eq(orders.stylisteId, styliste.id),
          isNull(orders.deletedAt),
          gte(orders.dueDate, today),
          lte(orders.dueDate, weekEndStr)
        )
      )
      .orderBy(orders.dueDate)
      .limit(50);

    console.log('   Résultat:', dueThisWeek.length, 'commandes');

    console.log('\n✅ Toutes les requêtes ont réussi!');
    console.log('\n📊 Résumé final:');
    console.log(JSON.stringify({
      pending: counts.pending,
      ready: counts.ready,
      delivered: deliveredThisMonth?.count || 0,
      monthlyRevenue,
      dueThisWeek: dueThisWeek.length,
    }, null, 2));

  } catch (error) {
    console.error('\n❌ Erreur:', error);
  } finally {
    await client.end();
  }
}

testStatsQuery();
