import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { Character } from '@/types/dnd';

export async function getCharacters(): Promise<Character[]> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const result = await db.execute({
    sql: 'SELECT * FROM characters WHERE user_id = ? ORDER BY name',
    args: [userId],
  });

  return result.rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    class: row.class,
    level: row.level,
    armorClass: row.armor_class,
    hitPoints: {
      current: row.hp_current,
      max: row.hp_max,
      temporary: row.hp_temporary || 0,
    },
    abilities: {
      STR: row.strength,
      DEX: row.dexterity,
      CON: row.constitution,
      INT: row.intelligence,
      WIS: row.wisdom,
      CHA: row.charisma,
    },
    initiativeBonus: row.initiative_bonus,
    proficiencyBonus: row.proficiency_bonus,
    speed: row.speed,
    conditions: [],
    notes: row.notes,
    monsterStats: row.monster_stats ? JSON.parse(row.monster_stats) : undefined,
  }));
}

export async function createCharacter(character: Character): Promise<Character> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await db.execute({
    sql: `
      INSERT INTO characters (
        id, user_id, name, type, class, level, armor_class,
        hp_current, hp_max, hp_temporary,
        strength, dexterity, constitution, intelligence, wisdom, charisma,
        initiative_bonus, proficiency_bonus, speed, notes, monster_stats
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      character.id,
      userId,
      character.name,
      character.type,
      character.class || null,
      character.level || null,
      character.armorClass,
      character.hitPoints.current,
      character.hitPoints.max,
      character.hitPoints.temporary || 0,
      character.abilities.STR,
      character.abilities.DEX,
      character.abilities.CON,
      character.abilities.INT,
      character.abilities.WIS,
      character.abilities.CHA,
      character.initiativeBonus,
      character.proficiencyBonus || null,
      character.speed || null,
      character.notes || null,
      character.monsterStats ? JSON.stringify(character.monsterStats) : null,
    ],
  });

  return character;
}

export async function updateCharacter(id: string, updates: Partial<Character>): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const fields: string[] = [];
  const args: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    args.push(updates.name);
  }
  if (updates.hitPoints !== undefined) {
    fields.push('hp_current = ?', 'hp_max = ?', 'hp_temporary = ?');
    args.push(updates.hitPoints.current, updates.hitPoints.max, updates.hitPoints.temporary || 0);
  }
  if (updates.armorClass !== undefined) {
    fields.push('armor_class = ?');
    args.push(updates.armorClass);
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    args.push(updates.notes);
  }

  fields.push('updated_at = strftime("%s", "now")');
  args.push(id, userId);

  await db.execute({
    sql: `UPDATE characters SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
    args,
  });
}

export async function deleteCharacter(id: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await db.execute({
    sql: 'DELETE FROM characters WHERE id = ? AND user_id = ?',
    args: [id, userId],
  });
}
