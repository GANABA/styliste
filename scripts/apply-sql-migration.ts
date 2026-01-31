import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Charger les variables d'environnement depuis .env
config();

const DATABASE_URL = process.env.DATABASE_URL || '';

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sqlFilePath = process.argv[2];
if (!sqlFilePath) {
  console.error('❌ Usage: tsx scripts/apply-sql-migration.ts <path-to-sql-file>');
  process.exit(1);
}

async function applySqlMigration() {
  const client = postgres(DATABASE_URL);
  const db = drizzle(client);

  try {
    const sqlContent = readFileSync(sqlFilePath, 'utf-8');
    console.log(`📄 Applying migration: ${sqlFilePath}`);

    await client.unsafe(sqlContent);

    console.log('✅ Migration applied successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applySqlMigration();
