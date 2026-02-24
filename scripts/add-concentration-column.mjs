import { config } from 'dotenv';
import { createClient } from '@libsql/client';

// Load .env.local
config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function addConcentrationColumn() {
  console.log('📊 Adding is_concentrating column to encounter_participants...');
  
  try {
    // Add is_concentrating column
    await db.execute(`
      ALTER TABLE encounter_participants 
      ADD COLUMN is_concentrating INTEGER DEFAULT 0
    `);
    
    console.log('✅ Column is_concentrating added successfully');
    console.log('\n🎉 Database schema updated!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating schema:', error);
    process.exit(1);
  }
}

addConcentrationColumn();
