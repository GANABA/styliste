import postgres from 'postgres';
import { config } from 'dotenv';

config();

const DATABASE_URL = process.env.DATABASE_URL || '';

async function checkTables() {
  const client = postgres(DATABASE_URL);

  try {
    const tables = await client`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    console.log('\n📊 Tables dans la base de données:\n');
    tables.forEach((table) => {
      console.log(`  ✓ ${table.table_name}`);
    });
    console.log('');
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.end();
  }
}

checkTables();
