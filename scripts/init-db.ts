// Charger les variables d'environnement AVANT tout autre import
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Maintenant on peut importer les modules qui utilisent les variables d'environnement
import { initializeDatabase } from '../lib/init-db';

console.log('🔧 Initialisation de la base de données Turso...');
console.log(`📍 URL: ${process.env.TURSO_DATABASE_URL?.substring(0, 30)}...`);

initializeDatabase()
  .then(() => {
    console.log('✅ Base de données initialisée avec succès !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur lors de l\'initialisation :', error);
    process.exit(1);
  });
