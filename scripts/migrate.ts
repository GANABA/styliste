import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { config } from 'dotenv';

// Charger les variables d'environnement depuis .env
config();

const DATABASE_URL = process.env.DATABASE_URL || '';

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  const client = postgres(DATABASE_URL, { max: 1 });
  const db = drizzle(client);

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('\n✅ All migrations applied successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
