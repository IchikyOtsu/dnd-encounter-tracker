import { db } from '@/lib/db';
import { auth, currentUser } from '@clerk/nextjs/server';
import { DiceRoll, DiceMacro, rollDice } from '@/types/dice';

// Ensure user exists in database (reuse from db-operations.ts)
async function ensureUserExists(userId: string): Promise<void> {
  try {
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress || 'unknown@example.com';
    await db.execute({
      sql: 'INSERT OR IGNORE INTO users (id, email) VALUES (?, ?)',
      args: [userId, email],
    });
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    throw error;
  }
}

// ============= DICE ROLL OPERATIONS =============

export async function getRollHistory(limit: number = 50): Promise<DiceRoll[]> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await ensureUserExists(userId);

  const result = await db.execute({
    sql: 'SELECT * FROM roll_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
    args: [userId, limit],
  });

  return result.rows.map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    formula: row.formula,
    result: row.result,
    details: row.details,
    label: row.label,
    createdAt: new Date(row.created_at * 1000),
  }));
}

export async function createRoll(
  formula: string,
  label?: string
): Promise<DiceRoll> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await ensureUserExists(userId);

  // Roll the dice
  const { result, details } = rollDice(formula);

  const rollId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await db.execute({
    sql: `
      INSERT INTO roll_history (id, user_id, formula, result, details, label)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    args: [rollId, userId, formula, result, details, label || null],
  });

  return {
    id: rollId,
    userId,
    formula,
    result,
    details,
    label,
    createdAt: new Date(),
  };
}

export async function clearRollHistory(): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await db.execute({
    sql: 'DELETE FROM roll_history WHERE user_id = ?',
    args: [userId],
  });
}

// ============= DICE MACRO OPERATIONS =============

export async function getDiceMacros(): Promise<DiceMacro[]> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await ensureUserExists(userId);

  const result = await db.execute({
    sql: 'SELECT * FROM dice_macros WHERE user_id = ? ORDER BY created_at DESC',
    args: [userId],
  });

  return result.rows.map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    formula: row.formula,
    description: row.description,
    color: row.color || '#3b82f6',
    createdAt: new Date(row.created_at * 1000),
  }));
}

export async function createMacro(macro: Omit<DiceMacro, 'id' | 'userId' | 'createdAt'>): Promise<DiceMacro> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await ensureUserExists(userId);

  const macroId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await db.execute({
    sql: `
      INSERT INTO dice_macros (id, user_id, name, formula, description, color)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    args: [
      macroId,
      userId,
      macro.name,
      macro.formula,
      macro.description || null,
      macro.color || '#3b82f6',
    ],
  });

  return {
    id: macroId,
    userId,
    ...macro,
    createdAt: new Date(),
  };
}

export async function updateMacro(
  id: string,
  updates: Partial<Omit<DiceMacro, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const fields: string[] = [];
  const args: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    args.push(updates.name);
  }
  if (updates.formula !== undefined) {
    fields.push('formula = ?');
    args.push(updates.formula);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    args.push(updates.description);
  }
  if (updates.color !== undefined) {
    fields.push('color = ?');
    args.push(updates.color);
  }

  if (fields.length === 0) return;

  args.push(id, userId);

  await db.execute({
    sql: `UPDATE dice_macros SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
    args,
  });
}

export async function deleteMacro(id: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await db.execute({
    sql: 'DELETE FROM dice_macros WHERE id = ? AND user_id = ?',
    args: [id, userId],
  });
}
