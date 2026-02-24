export type CharacterType = 'PC' | 'NPC' | 'Monster';

export type CharacterClass = 
  | 'Artificier' | 'Barbare' | 'Barde' | 'Chasseur de Sang'
  | 'Clerc' | 'Druide' | 'Ensorceleur' | 'Guerrier'
  | 'Magicien' | 'Moine' | 'Occultiste' | 'Paladin'
  | 'Rôdeur' | 'Roublard' | 'Aucune';

export type Ability = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

export interface AbilityScores {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

export interface MonsterStats {
  size?: string; // Tiny, Small, Medium, Large, Huge, Gargantuan
  creatureType?: string; // Beast, Humanoid, Dragon, etc.
  alignment?: string; // Lawful good, Chaotic evil, etc.
  challengeRating?: number; // 0, 0.125, 0.25, 0.5, 1, 2, etc.
  experiencePoints?: number; // Auto-calculated from CR
  senses?: string; // darkvision 60 ft., passive Perception 16
  languages?: string; // Common, Draconic, etc.
  conditionImmunities?: string; // poisoned, charmed, etc.
  damageImmunities?: string; // fire, cold, etc.
  damageResistances?: string; // bludgeoning, piercing, etc.
  damageVulnerabilities?: string; // fire, radiant, etc.
  specialTraits?: Array<{ name: string; description: string }>; // Pack Tactics, etc.
  actions?: Array<{ name: string; description: string }>; // Multiattack, Bite, etc.
  legendaryActions?: Array<{ name: string; description: string }>;
  reactions?: Array<{ name: string; description: string }>;
}

export interface Character {
  id: string;
  name: string;
  type: CharacterType;
  class?: CharacterClass;
  level?: number;
  armorClass: number;
  hitPoints: {
    current: number;
    max: number;
    temporary: number;
  };
  abilities: AbilityScores;
  initiativeBonus: number;
  proficiencyBonus?: number;
  speed?: number;
  conditions: Condition[];
  notes?: string;
  monsterStats?: MonsterStats; // Only for Monster type
}

export interface Condition {
  id: string;
  name: string;
  description?: string;
}

export interface EncounterParticipant extends Character {
  initiative: number;
  hasActed?: boolean;
  deathSaves: {
    successes: number;
    failures: number;
  };
  isStable: boolean;
  isDead: boolean;
}

export interface Encounter {
  id: string;
  name: string;
  participants: EncounterParticipant[];
  currentRound: number;
  currentTurnIndex: number;
  isActive: boolean;
  createdAt: Date;
}

export const COMMON_CONDITIONS: Condition[] = [
  { id: 'blinded', name: 'Blinded', description: 'Cannot see, fails checks that require sight' },
  { id: 'charmed', name: 'Charmed', description: "Can't attack the charmer" },
  { id: 'deafened', name: 'Deafened', description: 'Cannot hear, fails checks that require hearing' },
  { id: 'frightened', name: 'Frightened', description: 'Disadvantage on ability checks and attacks' },
  { id: 'grappled', name: 'Grappled', description: 'Speed becomes 0' },
  { id: 'incapacitated', name: 'Incapacitated', description: "Can't take actions or reactions" },
  { id: 'invisible', name: 'Invisible', description: 'Impossible to see without special means' },
  { id: 'paralyzed', name: 'Paralyzed', description: 'Incapacitated and cannot move or speak' },
  { id: 'petrified', name: 'Petrified', description: 'Transformed into solid substance' },
  { id: 'poisoned', name: 'Poisoned', description: 'Disadvantage on attacks and ability checks' },
  { id: 'prone', name: 'Prone', description: 'Disadvantage on attacks, advantage to be hit in melee' },
  { id: 'restrained', name: 'Restrained', description: 'Speed becomes 0, disadvantage on attacks' },
  { id: 'stunned', name: 'Stunned', description: 'Incapacitated, cannot move, can only speak falteringly' },
  { id: 'unconscious', name: 'Unconscious', description: 'Incapacitated, unaware of surroundings' },
  { id: 'exhaustion', name: 'Exhaustion', description: 'Multiple levels of exhaustion with cumulative effects' },
];

// D&D 5e Challenge Rating to XP conversion table
export const CR_TO_XP: Record<number, number> = {
  0: 10,
  0.125: 25,
  0.25: 50,
  0.5: 100,
  1: 200,
  2: 450,
  3: 700,
  4: 1100,
  5: 1800,
  6: 2300,
  7: 2900,
  8: 3900,
  9: 5000,
  10: 5900,
  11: 7200,
  12: 8400,
  13: 10000,
  14: 11500,
  15: 13000,
  16: 15000,
  17: 18000,
  18: 20000,
  19: 22000,
  20: 25000,
  21: 33000,
  22: 41000,
  23: 50000,
  24: 62000,
  25: 75000,
  26: 90000,
  27: 105000,
  28: 120000,
  29: 135000,
  30: 155000,
};

// Proficiency bonus by CR
export const CR_TO_PROFICIENCY: Record<number, number> = {
  0: 2, 0.125: 2, 0.25: 2, 0.5: 2,
  1: 2, 2: 2, 3: 2, 4: 2,
  5: 3, 6: 3, 7: 3, 8: 3,
  9: 4, 10: 4, 11: 4, 12: 4,
  13: 5, 14: 5, 15: 5, 16: 5,
  17: 6, 18: 6, 19: 6, 20: 6,
  21: 7, 22: 7, 23: 7, 24: 7,
  25: 8, 26: 8, 27: 8, 28: 8,
  29: 9, 30: 9,
};

export function getXPFromCR(cr: number): number {
  return CR_TO_XP[cr] || 0;
}

export function getProficiencyFromCR(cr: number): number {
  return CR_TO_PROFICIENCY[cr] || 2;
}

export function formatCR(cr: number): string {
  if (cr === 0.125) return '1/8';
  if (cr === 0.25) return '1/4';
  if (cr === 0.5) return '1/2';
  return cr.toString();
}

export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function rollInitiative(initiativeBonus: number): number {
  return Math.floor(Math.random() * 20) + 1 + initiativeBonus;
}
