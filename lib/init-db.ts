import { db } from './db';

export async function initializeDatabase() {
  try {
    // Créer la table users
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
      )
    `);

    // Créer la table characters
    await db.execute(`
      CREATE TABLE IF NOT EXISTS characters (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('PC', 'NPC', 'Monster')),
        class TEXT,
        level INTEGER,
        armor_class INTEGER NOT NULL,
        hp_current INTEGER NOT NULL,
        hp_max INTEGER NOT NULL,
        hp_temporary INTEGER DEFAULT 0,
        strength INTEGER NOT NULL,
        dexterity INTEGER NOT NULL,
        constitution INTEGER NOT NULL,
        intelligence INTEGER NOT NULL,
        wisdom INTEGER NOT NULL,
        charisma INTEGER NOT NULL,
        initiative_bonus INTEGER NOT NULL,
        proficiency_bonus INTEGER,
        speed INTEGER,
        notes TEXT,
        monster_stats TEXT,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Créer la table encounters
    await db.execute(`
      CREATE TABLE IF NOT EXISTS encounters (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        current_round INTEGER NOT NULL DEFAULT 1,
        current_turn_index INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Créer la table encounter_participants
    await db.execute(`
      CREATE TABLE IF NOT EXISTS encounter_participants (
        id TEXT PRIMARY KEY,
        encounter_id TEXT NOT NULL,
        character_id TEXT NOT NULL,
        initiative INTEGER NOT NULL DEFAULT 0,
        has_acted INTEGER NOT NULL DEFAULT 0,
        hp_current INTEGER NOT NULL,
        hp_max INTEGER NOT NULL,
        hp_temporary INTEGER DEFAULT 0,
        death_saves_successes INTEGER NOT NULL DEFAULT 0,
        death_saves_failures INTEGER NOT NULL DEFAULT 0,
        is_stable INTEGER NOT NULL DEFAULT 0,
        is_dead INTEGER NOT NULL DEFAULT 0,
        conditions TEXT,
        is_concentrating INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (encounter_id) REFERENCES encounters(id) ON DELETE CASCADE,
        FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
      )
    `);

    // Créer les index
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_encounters_user_id ON encounters(user_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_encounter_participants_encounter_id ON encounter_participants(encounter_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_encounter_participants_character_id ON encounter_participants(character_id)`);

    // Créer la table roll_history pour le dice roller
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

    // Créer la table dice_macros
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

    // Index pour dice roller
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_roll_history_user_id ON roll_history(user_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_roll_history_created_at ON roll_history(created_at DESC)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_dice_macros_user_id ON dice_macros(user_id)`);

    console.log('✅ Database initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// Exécuter l'initialisation si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Database setup complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database setup failed:', error);
      process.exit(1);
    });
}
