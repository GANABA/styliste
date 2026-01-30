import postgres from 'postgres';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Charger les variables d'environnement
const envLocalPath = join(process.cwd(), '.env.local');
const envPath = join(process.cwd(), '.env');

if (existsSync(envLocalPath)) {
  const envContent = readFileSync(envLocalPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
} else if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL non définie');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

async function applyRLS() {
  try {
    console.log('📋 Application des configurations RLS et indexes...\n');

    // 1. Activer RLS sur measurements
    console.log('1️⃣ Activation RLS sur measurements...');
    const rlsMeasurements = readFileSync(join(process.cwd(), 'drizzle/rls-measurements.sql'), 'utf-8');
    await sql.unsafe(rlsMeasurements);
    console.log('✓ RLS activé sur measurements\n');

    // 2. Créer les policies RLS pour measurements
    console.log('2️⃣ Création policies RLS pour measurements...');
    const policiesMeasurements = readFileSync(join(process.cwd(), 'drizzle/rls-policies-measurements.sql'), 'utf-8');
    await sql.unsafe(policiesMeasurements);
    console.log('✓ Policies RLS créées pour measurements\n');

    // 3. Créer les index de performance
    console.log('3️⃣ Création index de performance...');
    const indexes = readFileSync(join(process.cwd(), 'drizzle/indexes-measurements.sql'), 'utf-8');
    await sql.unsafe(indexes);
    console.log('✓ Index de performance créés\n');

    console.log('✅ Configuration RLS et indexes appliquée avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'application RLS:', error);
    process.exit(1);
  }
}

applyRLS();
