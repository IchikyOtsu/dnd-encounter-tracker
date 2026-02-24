-- Tables pour le Dice Roller

-- Table pour l'historique des lancés de dés
CREATE TABLE IF NOT EXISTS roll_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  formula TEXT NOT NULL,
  result INTEGER NOT NULL,
  details TEXT,
  label TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_roll_history_user_id ON roll_history(user_id);
CREATE INDEX IF NOT EXISTS idx_roll_history_created_at ON roll_history(created_at DESC);

-- Table pour les macros de dés
CREATE TABLE IF NOT EXISTS dice_macros (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  formula TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_dice_macros_user_id ON dice_macros(user_id);
