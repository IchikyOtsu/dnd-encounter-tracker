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

export type Skill = 
  | 'Acrobaties' | 'Arcanes' | 'Athlétisme' | 'Discrétion'
  | 'Dressage' | 'Escamotage' | 'Histoire' | 'Intimidation'
  | 'Investigation' | 'Médecine' | 'Nature' | 'Perception'
  | 'Perspicacité' | 'Persuasion' | 'Religion' | 'Représentation'
  | 'Survie' | 'Tromperie';

export const SKILL_ABILITY_MAP: Record<Skill, Ability> = {
  'Acrobaties': 'DEX',
  'Arcanes': 'INT',
  'Athlétisme': 'STR',
  'Discrétion': 'DEX',
  'Dressage': 'WIS',
  'Escamotage': 'DEX',
  'Histoire': 'INT',
  'Intimidation': 'CHA',
  'Investigation': 'INT',
  'Médecine': 'WIS',
  'Nature': 'INT',
  'Perception': 'WIS',
  'Perspicacité': 'WIS',
  'Persuasion': 'CHA',
  'Religion': 'INT',
  'Représentation': 'CHA',
  'Survie': 'WIS',
  'Tromperie': 'CHA',
};

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
  savingThrows?: Partial<Record<Ability, boolean>>; // { STR: true, DEX: true } = proficient
  skills?: Partial<Record<Skill, 0 | 1 | 2 | boolean>>; // 0=none, 1=proficient, 2=expert (double prof), boolean pour rétrocompatibilité
  skillBonuses?: Partial<Record<Skill, number>>; // Bonus manuels pour les compétences { 'Athlétisme': 5 }
  specialTraits?: Array<{ name: string; description: string }>; // Pack Tactics, etc.
  actions?: Array<{ name: string; description: string }>; // Multiattack, Bite, etc.
  bonusActions?: Array<{ name: string; description: string }>; // Dash, Disengage, etc.
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
  duration?: number; // Durée en rounds, undefined = permanent
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
  isConcentrating?: boolean;
}

export interface Encounter {
  id: string;
  name: string;
  participants: EncounterParticipant[];
  currentRound: number;
  currentTurnIndex: number;
  isActive: boolean;
  dmNotes?: string;
  createdAt: Date;
}

export const COMMON_CONDITIONS: Condition[] = [
  { id: 'blinded', name: 'Aveuglé', description: 'Ne peut pas voir, échoue les tests nécessitant la vue' },
  { id: 'charmed', name: 'Charmé', description: 'Ne peut pas attaquer le charmeur' },
  { id: 'deafened', name: 'Assourdi', description: 'Ne peut pas entendre, échoue les tests nécessitant l\'ouïe' },
  { id: 'frightened', name: 'Effrayé', description: 'Désavantage aux tests de caractéristique et attaques' },
  { id: 'grappled', name: 'Agrippé', description: 'Vitesse devient 0' },
  { id: 'incapacitated', name: 'Neutralisé', description: 'Ne peut pas effectuer d\'actions ou de réactions' },
  { id: 'invisible', name: 'Invisible', description: 'Impossible à voir sans moyen spécial' },
  { id: 'paralyzed', name: 'Paralysé', description: 'Neutralisé et ne peut ni bouger ni parler' },
  { id: 'petrified', name: 'Pétrifié', description: 'Transformé en substance solide' },
  { id: 'poisoned', name: 'Empoisonné', description: 'Désavantage aux attaques et tests de caractéristique' },
  { id: 'prone', name: 'À terre', description: 'Désavantage aux attaques, avantage pour être touché au corps à corps' },
  { id: 'restrained', name: 'Entravé', description: 'Vitesse devient 0, désavantage aux attaques' },
  { id: 'stunned', name: 'Étourdi', description: 'Neutralisé, ne peut pas bouger, ne peut parler que difficilement' },
  { id: 'unconscious', name: 'Inconscient', description: 'Neutralisé, inconscient de ce qui l\'entoure' },
  { id: 'exhaustion', name: 'Épuisement', description: 'Niveaux d\'épuisement cumulatifs avec effets multiples' },
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
