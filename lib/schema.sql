-- Schema pour la base de données D&D Tracker

-- Table des utilisateurs (synchronisée avec Clerk)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Clerk User ID
  email TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Table des personnages
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
  monster_stats TEXT, -- JSON stringifié pour les stats de monstres
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des rencontres
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
);

-- Table des participants aux rencontres
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
  conditions TEXT, -- JSON stringifié pour la liste des conditions
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (encounter_id) REFERENCES encounters(id) ON DELETE CASCADE,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_encounters_user_id ON encounters(user_id);
CREATE INDEX IF NOT EXISTS idx_encounter_participants_encounter_id ON encounter_participants(encounter_id);
CREATE INDEX IF NOT EXISTS idx_encounter_participants_character_id ON encounter_participants(character_id);
