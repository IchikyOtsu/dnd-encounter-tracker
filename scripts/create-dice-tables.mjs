import { config } from 'dotenv';
import { createClient } from '@libsql/client';

// Load .env.local
config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function createDiceTables() {
  console.log('🎲 Creating dice roller tables...');
  
  try {
    // Create roll_history table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS roll_history (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        formula TEXT NOT NULL,
        result INTEGER NOT NULL,
        details TEXT,
        label TEXT,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table roll_history created');

    // Create dice_macros table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS dice_macros (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        formula TEXT NOT NULL,
        description TEXT,
        color TEXT DEFAULT '#3b82f6',
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table dice_macros created');

    // Create indexes
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_roll_history_user_id ON roll_history(user_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_roll_history_created_at ON roll_history(created_at DESC)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_dice_macros_user_id ON dice_macros(user_id)`);
    console.log('✅ Indexes created');

    console.log('\n🎉 Dice roller tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
}

createDiceTables();
