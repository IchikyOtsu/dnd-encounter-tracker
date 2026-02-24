import { db } from '@/lib/db';
import { auth, currentUser } from '@clerk/nextjs/server';
import { Character } from '@/types/dnd';

// Ensure user exists in database (auto-create on first use)
async function ensureUserExists(userId: string): Promise<void> {
  try {
    // Get user details from Clerk
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress || 'unknown@example.com';

    // Use INSERT OR IGNORE to handle race conditions safely
    // If the user already exists, this will do nothing (no error)
    await db.execute({
      sql: 'INSERT OR IGNORE INTO users (id, email) VALUES (?, ?)',
      args: [userId, email],
    });
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    throw error;
  }
}

export async function getCharacters(): Promise<Character[]> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await ensureUserExists(userId);

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

  await ensureUserExists(userId);

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

  await ensureUserExists(userId);

  const fields: string[] = [];
  const args: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    args.push(updates.name);
  }
  if (updates.type !== undefined) {
    fields.push('type = ?');
    args.push(updates.type);
  }
  if (updates.class !== undefined) {
    fields.push('class = ?');
    args.push(updates.class || null);
  }
  if (updates.level !== undefined) {
    fields.push('level = ?');
    args.push(updates.level || null);
  }
  if (updates.hitPoints !== undefined) {
    fields.push('hp_current = ?', 'hp_max = ?', 'hp_temporary = ?');
    args.push(updates.hitPoints.current, updates.hitPoints.max, updates.hitPoints.temporary || 0);
  }
  if (updates.armorClass !== undefined) {
    fields.push('armor_class = ?');
    args.push(updates.armorClass);
  }
  if (updates.abilities !== undefined) {
    fields.push('strength = ?', 'dexterity = ?', 'constitution = ?', 'intelligence = ?', 'wisdom = ?', 'charisma = ?');
    args.push(
      updates.abilities.STR,
      updates.abilities.DEX,
      updates.abilities.CON,
      updates.abilities.INT,
      updates.abilities.WIS,
      updates.abilities.CHA
    );
  }
  if (updates.speed !== undefined) {
    fields.push('speed = ?');
    args.push(updates.speed);
  }
  if (updates.proficiencyBonus !== undefined) {
    fields.push('proficiency_bonus = ?');
    args.push(updates.proficiencyBonus);
  }
  if (updates.initiativeBonus !== undefined) {
    fields.push('initiative_bonus = ?');
    args.push(updates.initiativeBonus);
  }
  if (updates.monsterStats !== undefined) {
    fields.push('monster_stats = ?');
    args.push(JSON.stringify(updates.monsterStats));
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    args.push(updates.notes);
  }

  fields.push('updated_at = strftime(\'%s\', \'now\')');
  args.push(id, userId);

  await db.execute({
    sql: `UPDATE characters SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
    args,
  });
}

export async function deleteCharacter(id: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await ensureUserExists(userId);

  await db.execute({
    sql: 'DELETE FROM characters WHERE id = ? AND user_id = ?',
    args: [id, userId],
  });
}

// ============= ENCOUNTER OPERATIONS =============

import { Encounter, EncounterParticipant } from '@/types/dnd';

export async function getEncounters(): Promise<Encounter[]> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await ensureUserExists(userId);

  const result = await db.execute({
    sql: 'SELECT * FROM encounters WHERE user_id = ? ORDER BY created_at DESC',
    args: [userId],
  });

  const encounters: Encounter[] = [];

  for (const row of result.rows as any[]) {
    const participants = await getEncounterParticipants(row.id);
    encounters.push({
      id: row.id,
      name: row.name,
      participants,
      currentRound: row.current_round,
      currentTurnIndex: row.current_turn_index,
      isActive: row.is_active === 1,
      dmNotes: row.dm_notes || undefined,
      createdAt: new Date(row.created_at * 1000),
    });
  }

  return encounters;
}

export async function getEncounter(encounterId: string): Promise<Encounter | null> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await ensureUserExists(userId);

  const result = await db.execute({
    sql: 'SELECT * FROM encounters WHERE id = ? AND user_id = ?',
    args: [encounterId, userId],
  });

  if (result.rows.length === 0) return null;

  const row = result.rows[0] as any;
  const participants = await getEncounterParticipants(row.id);

  return {
    id: row.id,
    name: row.name,
    participants,
    currentRound: row.current_round,
    currentTurnIndex: row.current_turn_index,
    isActive: row.is_active === 1,
    createdAt: new Date(row.created_at * 1000),
  };
}

export async function createEncounter(encounter: Encounter): Promise<Encounter> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await ensureUserExists(userId);

  await db.execute({
    sql: `
      INSERT INTO encounters (
        id, user_id, name, current_round, current_turn_index, is_active, dm_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      encounter.id,
      userId,
      encounter.name,
      encounter.currentRound,
      encounter.currentTurnIndex,
      encounter.isActive ? 1 : 0,
      encounter.dmNotes || null,
    ],
  });

  // Add participants
  for (const participant of encounter.participants) {
    await addEncounterParticipant(encounter.id, participant);
  }

  return encounter;
}

export async function updateEncounter(
  encounterId: string,
  updates: Partial<Omit<Encounter, 'id' | 'participants' | 'createdAt'>>
): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await ensureUserExists(userId);

  const fields: string[] = [];
  const args: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    args.push(updates.name);
  }
  if (updates.currentRound !== undefined) {
    fields.push('current_round = ?');
    args.push(updates.currentRound);
  }
  if (updates.currentTurnIndex !== undefined) {
    fields.push('current_turn_index = ?');
    args.push(updates.currentTurnIndex);
  }
  if (updates.isActive !== undefined) {
    fields.push('is_active = ?');
    args.push(updates.isActive ? 1 : 0);
  }
  if (updates.dmNotes !== undefined) {
    fields.push('dm_notes = ?');
    args.push(updates.dmNotes || null);
  }

  fields.push('updated_at = strftime(\'%s\', \'now\')');
  args.push(encounterId, userId);

  await db.execute({
    sql: `UPDATE encounters SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
    args,
  });
}

export async function deleteEncounter(encounterId: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await ensureUserExists(userId);

  await db.execute({
    sql: 'DELETE FROM encounters WHERE id = ? AND user_id = ?',
    args: [encounterId, userId],
  });
}

// ============= ENCOUNTER PARTICIPANT OPERATIONS =============

async function getEncounterParticipants(encounterId: string): Promise<EncounterParticipant[]> {
  const result = await db.execute({
    sql: `
      SELECT ep.*, c.*,
        ep.id as participant_id,
        ep.hp_current as participant_hp_current,
        ep.hp_max as participant_hp_max,
        ep.hp_temporary as participant_hp_temporary
      FROM encounter_participants ep
      JOIN characters c ON ep.character_id = c.id
      WHERE ep.encounter_id = ?
      ORDER BY ep.initiative DESC
    `,
    args: [encounterId],
  });

  return result.rows.map((row: any) => ({
    id: row.character_id,
    name: row.name,
    type: row.type,
    class: row.class,
    level: row.level,
    armorClass: row.armor_class,
    hitPoints: {
      current: row.participant_hp_current,
      max: row.participant_hp_max,
      temporary: row.participant_hp_temporary || 0,
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
    conditions: row.conditions ? JSON.parse(row.conditions) : [],
    notes: row.notes,
    monsterStats: row.monster_stats ? JSON.parse(row.monster_stats) : undefined,
    initiative: row.initiative,
    hasActed: row.has_acted === 1,
    deathSaves: {
      successes: row.death_saves_successes,
      failures: row.death_saves_failures,
    },
    isStable: row.is_stable === 1,
    isDead: row.is_dead === 1,
    isConcentrating: row.is_concentrating === 1,
  }));
}

async function addEncounterParticipant(
  encounterId: string,
  participant: EncounterParticipant
): Promise<void> {
  await db.execute({
    sql: `
      INSERT INTO encounter_participants (
        id, encounter_id, character_id, initiative, has_acted,
        hp_current, hp_max, hp_temporary,
        death_saves_successes, death_saves_failures,
        is_stable, is_dead, conditions, is_concentrating
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      `${encounterId}_${participant.id}`,
      encounterId,
      participant.id,
      participant.initiative,
      participant.hasActed ? 1 : 0,
      participant.hitPoints.current,
      participant.hitPoints.max,
      participant.hitPoints.temporary || 0,
      participant.deathSaves.successes,
      participant.deathSaves.failures,
      participant.isStable ? 1 : 0,
      participant.isDead ? 1 : 0,
      JSON.stringify(participant.conditions),
      participant.isConcentrating ? 1 : 0,
    ],
  });
}

export async function updateEncounterParticipant(
  encounterId: string,
  characterId: string,
  updates: Partial<EncounterParticipant>
): Promise<void> {
  const fields: string[] = [];
  const args: any[] = [];

  if (updates.initiative !== undefined) {
    fields.push('initiative = ?');
    args.push(updates.initiative);
  }
  if (updates.hasActed !== undefined) {
    fields.push('has_acted = ?');
    args.push(updates.hasActed ? 1 : 0);
  }
  if (updates.hitPoints !== undefined) {
    fields.push('hp_current = ?', 'hp_max = ?', 'hp_temporary = ?');
    args.push(
      updates.hitPoints.current,
      updates.hitPoints.max,
      updates.hitPoints.temporary || 0
    );
  }
  if (updates.deathSaves !== undefined) {
    fields.push('death_saves_successes = ?', 'death_saves_failures = ?');
    args.push(updates.deathSaves.successes, updates.deathSaves.failures);
  }
  if (updates.isStable !== undefined) {
    fields.push('is_stable = ?');
    args.push(updates.isStable ? 1 : 0);
  }
  if (updates.isDead !== undefined) {
    fields.push('is_dead = ?');
    args.push(updates.isDead ? 1 : 0);
  }
  if (updates.conditions !== undefined) {
    fields.push('conditions = ?');
    args.push(JSON.stringify(updates.conditions));
  }
  if (updates.isConcentrating !== undefined) {
    fields.push('is_concentrating = ?');
    args.push(updates.isConcentrating ? 1 : 0);
  }

  args.push(encounterId, characterId);

  await db.execute({
    sql: `UPDATE encounter_participants SET ${fields.join(', ')} WHERE encounter_id = ? AND character_id = ?`,
    args,
  });
}
