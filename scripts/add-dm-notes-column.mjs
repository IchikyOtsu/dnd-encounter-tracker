import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function addDmNotesColumn() {
  try {
    console.log('Adding dm_notes column to encounters table...');
    
    await db.execute(`
      ALTER TABLE encounters ADD COLUMN dm_notes TEXT
    `);

    console.log('✅ Column dm_notes added successfully to encounters table');
  } catch (error) {
    if (error.message && error.message.includes('duplicate column name')) {
      console.log('ℹ️  Column dm_notes already exists');
    } else {
      console.error('❌ Error adding dm_notes column:', error);
      throw error;
    }
  }
}

addDmNotesColumn()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
