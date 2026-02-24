'use client';

import { useState } from 'react';
import { Character, calculateModifier, COMMON_CONDITIONS } from '@/types/dnd';
import { useGame } from '@/contexts/GameContext';
import CharacterForm from './CharacterForm';

export default function CharacterList() {
  const { characters, deleteCharacter, updateCharacter } = useGame();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editHP, setEditHP] = useState({ current: 0, max: 0, temporary: 0 });
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

  const handleHPEdit = (character: Character) => {
    setEditingId(character.id);
    setEditHP(character.hitPoints);
  };

  const saveHP = (characterId: string) => {
    updateCharacter(characterId, { hitPoints: editHP });
    setEditingId(null);
  };

  const addCondition = (character: Character, conditionId: string) => {
    const condition = COMMON_CONDITIONS.find(c => c.id === conditionId);
    if (condition && !character.conditions.find(c => c.id === conditionId)) {
      updateCharacter(character.id, {
        conditions: [...character.conditions, condition],
      });
    }
  };

  const removeCondition = (character: Character, conditionId: string) => {
    updateCharacter(character.id, {
      conditions: character.conditions.filter(c => c.id !== conditionId),
    });
  };

  if (characters.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">Aucun personnage. Ajoutez votre premier personnage pour commencer !</p>
      </div>
    );
  }

  return (
    <>
      {editingCharacter && (
        <CharacterForm 
          editCharacter={editingCharacter} 
          onClose={() => setEditingCharacter(null)}
        />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {characters.map((character) => (
        <div key={character.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xl font-bold">{character.name}</h3>
              <p className="text-sm text-gray-600">
                {character.type}
                {character.class && ` • ${character.class}`}
                {character.level && ` • Niv ${character.level}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingCharacter(character)}
                className="text-blue-500 hover:text-blue-700"
                title="Modifier"
              >
                ✏️
              </button>
              <button
                onClick={() => {
                  if (confirm(`Supprimer ${character.name} ?`)) {
                    deleteCharacter(character.id);
                  }
                }}
                className="text-red-500 hover:text-red-700"
                title="Supprimer"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-gray-100 p-2 rounded">
              <span className="text-xs text-gray-600">AC</span>
              <p className="text-lg font-bold">{character.armorClass}</p>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <span className="text-xs text-gray-600">Initiative</span>
              <p className="text-lg font-bold">
                {character.initiativeBonus >= 0 ? '+' : ''}{character.initiativeBonus}
              </p>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <span className="text-xs text-gray-600">Vitesse</span>
              <p className="text-lg font-bold">{character.speed} m</p>
            </div>
          </div>

          <div className="mb-3">
            {editingId === character.id ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs">Actuels:</label>
                  <input
                    type="number"
                    value={editHP.current}
                    onChange={(e) => setEditHP({ ...editHP, current: parseInt(e.target.value) || 0 })}
                    className="flex-1 px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs">Max:</label>
                  <input
                    type="number"
                    value={editHP.max}
                    onChange={(e) => setEditHP({ ...editHP, max: parseInt(e.target.value) || 0 })}
                    className="flex-1 px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs">Temp:</label>
                  <input
                    type="number"
                    value={editHP.temporary}
                    onChange={(e) => setEditHP({ ...editHP, temporary: parseInt(e.target.value) || 0 })}
                    className="flex-1 px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveHP(character.id)}
                    className="flex-1 bg-green-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 bg-gray-300 px-3 py-1 rounded text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => handleHPEdit(character)}
                className="bg-red-100 p-3 rounded cursor-pointer hover:bg-red-200"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Points de Vie</span>
                  <span className="text-xs text-gray-500">Cliquez pour modifier</span>
                </div>
                <p className="text-2xl font-bold text-red-700">
                  {character.hitPoints.current}
                  {character.hitPoints.temporary > 0 && (
                    <span className="text-blue-600"> +{character.hitPoints.temporary}</span>
                  )}
                  <span className="text-lg text-gray-500"> / {character.hitPoints.max}</span>
                </p>
              </div>
            )}
          </div>

          <div className="mb-3">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Caractéristiques</h4>
            <div className="grid grid-cols-6 gap-1">
              {Object.entries(character.abilities).map(([ability, score]) => (
                <div key={ability} className="bg-gray-100 p-1 rounded text-center">
                  <div className="text-xs text-gray-600">{ability}</div>
                  <div className="text-sm font-bold">{score}</div>
                  <div className="text-xs text-gray-500">
                    {calculateModifier(score) >= 0 ? '+' : ''}{calculateModifier(score)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <h4 className="text-xs font-semibold text-gray-700 mb-1">États</h4>
            <div className="flex flex-wrap gap-1 mb-2">
              {character.conditions.map((condition) => (
                <span
                  key={condition.id}
                  className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs flex items-center gap-1"
                  title={condition.description}
                >
                  {condition.name}
                  <button
                    onClick={() => removeCondition(character, condition.id)}
                    className="text-yellow-900 hover:text-yellow-950"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addCondition(character, e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
            >
              <option value="">+ Ajouter un état</option>
              {COMMON_CONDITIONS.filter(
                c => !character.conditions.find(cc => cc.id === c.id)
              ).map((condition) => (
                <option key={condition.id} value={condition.id}>
                  {condition.name}
                </option>
              ))}
            </select>
          </div>

          {character.notes && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600">{character.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
    </>
  );
}
