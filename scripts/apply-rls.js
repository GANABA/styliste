import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connexion à la base de données
const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require'
});

async function applyRLS() {
  try {
    console.log('🔐 Application des politiques RLS...\n');

    // Liste des scripts SQL à exécuter dans l'ordre
    const scripts = [
      '001_enable_rls.sql',
      '002_rls_policies_stylistes.sql',
      '003_rls_policies_clients.sql',
      '004_indexes.sql'
    ];

    for (const scriptName of scripts) {
      console.log(`⚙️  Exécution de ${scriptName}...`);
      const scriptPath = join(__dirname, '..', 'drizzle', 'sql', scriptName);
      const scriptContent = readFileSync(scriptPath, 'utf-8');

      // Exécuter le script
      await sql.unsafe(scriptContent);
      console.log(`✅ ${scriptName} appliqué avec succès\n`);
    }

    console.log('✨ Toutes les politiques RLS ont été appliquées avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'application des politiques RLS:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

applyRLS();
