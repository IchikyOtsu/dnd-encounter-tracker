// Types pour le Dice Roller
export interface DiceRoll {
  id: string;
  userId: string;
  formula: string;
  result: number;
  details?: string;
  label?: string;
  createdAt: Date;
}

export interface DiceMacro {
  id: string;
  userId: string;
  name: string;
  formula: string;
  description?: string;
  color?: string;
  createdAt: Date;
}

// Fonction pour parser et lancer une formule de dés
export function rollDice(formula: string): { result: number; details: string } {
  // Remove spaces
  formula = formula.trim().toUpperCase();

  // Parse dice notation like 2d6+3, 1d20, 4d8-2, etc.
  const regex = /(\d+)?d(\d+)([+-]\d+)?/gi;
  let total = 0;
  const rolls: string[] = [];

  let match;
  while ((match = regex.exec(formula)) !== null) {
    const count = parseInt(match[1] || '1', 10);
    const sides = parseInt(match[2], 10);
    const modifier = match[3] ? parseInt(match[3], 10) : 0;

    const diceRolls: number[] = [];
    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      diceRolls.push(roll);
    }

    const sum = diceRolls.reduce((a, b) => a + b, 0);
    total += sum + modifier;

    const rollStr = `${count}d${sides}${match[3] || ''}: [${diceRolls.join(', ')}]${modifier !== 0 ? ` ${modifier > 0 ? '+' : ''}${modifier}` : ''} = ${sum + modifier}`;
    rolls.push(rollStr);
  }

  // Handle simple numbers (no dice)
  if (rolls.length === 0) {
    const simpleNum = parseInt(formula, 10);
    if (!isNaN(simpleNum)) {
      return { result: simpleNum, details: `${simpleNum}` };
    }
    throw new Error('Invalid dice formula');
  }

  return {
    result: total,
    details: rolls.join(' | '),
  };
}
