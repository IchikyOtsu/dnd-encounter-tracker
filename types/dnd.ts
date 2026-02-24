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
}

export interface Condition {
  id: string;
  name: string;
  description?: string;
}

export interface EncounterParticipant extends Character {
  initiative: number;
  hasActed?: boolean;
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

export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function rollInitiative(initiativeBonus: number): number {
  return Math.floor(Math.random() * 20) + 1 + initiativeBonus;
}
