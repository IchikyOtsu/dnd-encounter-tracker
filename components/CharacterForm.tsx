'use client';

import { useState } from 'react';
import { Character, CharacterType, AbilityScores, calculateModifier } from '@/types/dnd';
import { useGame } from '@/contexts/GameContext';

export default function CharacterForm() {
  const { addCharacter } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'PC' as CharacterType,
    level: 1,
    armorClass: 10,
    maxHP: 10,
    currentHP: 10,
    temporaryHP: 0,
    STR: 10,
    DEX: 10,
    CON: 10,
    INT: 10,
    WIS: 10,
    CHA: 10,
    speed: 30,
    proficiencyBonus: 2,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const abilities: AbilityScores = {
      STR: formData.STR,
      DEX: formData.DEX,
      CON: formData.CON,
      INT: formData.INT,
      WIS: formData.WIS,
      CHA: formData.CHA,
    };

    const initiativeBonus = calculateModifier(formData.DEX);

    const character: Character = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      level: formData.level,
      armorClass: formData.armorClass,
      hitPoints: {
        current: formData.currentHP,
        max: formData.maxHP,
        temporary: formData.temporaryHP,
      },
      abilities,
      initiativeBonus,
      proficiencyBonus: formData.proficiencyBonus,
      speed: formData.speed,
      conditions: [],
      notes: formData.notes,
    };

    addCharacter(character);
    setIsOpen(false);
    
    // Reset form
    setFormData({
      name: '',
      type: 'PC',
      level: 1,
      armorClass: 10,
      maxHP: 10,
      currentHP: 10,
      temporaryHP: 0,
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10,
      speed: 30,
      proficiencyBonus: 2,
      notes: '',
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
      >
        + Add Character
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Add New Character</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as CharacterType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="PC">Player Character (PC)</option>
                <option value="NPC">Non-Player Character (NPC)</option>
                <option value="Monster">Monster</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Level</label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Armor Class (AC)</label>
              <input
                type="number"
                min="1"
                value={formData.armorClass}
                onChange={(e) => setFormData({ ...formData, armorClass: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Max HP</label>
              <input
                type="number"
                min="1"
                value={formData.maxHP}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  maxHP: parseInt(e.target.value),
                  currentHP: parseInt(e.target.value)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Speed (ft)</label>
              <input
                type="number"
                min="0"
                value={formData.speed}
                onChange={(e) => setFormData({ ...formData, speed: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Ability Scores</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const).map((ability) => (
                <div key={ability}>
                  <label className="block text-sm font-medium mb-1">
                    {ability}
                    <span className="text-xs text-gray-500 ml-1">
                      ({calculateModifier(formData[ability]) >= 0 ? '+' : ''}
                      {calculateModifier(formData[ability])})
                    </span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData[ability]}
                    onChange={(e) => setFormData({ ...formData, [ability]: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Add Character
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
