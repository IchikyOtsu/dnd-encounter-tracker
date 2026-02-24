'use client';

import { useState, useMemo } from 'react';
import { Character, CharacterType, calculateModifier, COMMON_CONDITIONS } from '@/types/dnd';
import { useGame } from '@/contexts/GameContext';
import CharacterForm from './CharacterForm';
import MonsterCard from './MonsterCard';

type SortOption = 'name' | 'level' | 'type';

export default function CharacterList() {
  const { characters, deleteCharacter, updateCharacter } = useGame();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editHP, setEditHP] = useState({ current: 0, max: 0, temporary: 0 });
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [filterType, setFilterType] = useState<CharacterType | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filtrer et trier les personnages
  const filteredAndSortedCharacters = useMemo(() => {
    let filtered = characters;

    // Filtre par type
    if (filterType !== 'all') {
      filtered = filtered.filter(c => c.type === filterType);
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.class?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Tri
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'level':
          return (b.level || 0) - (a.level || 0);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    return sorted;
  }, [characters, filterType, sortBy, searchTerm]);

  const typeCount = {
    PC: characters.filter(c => c.type === 'PC').length,
    NPC: characters.filter(c => c.type === 'NPC').length,
    Monster: characters.filter(c => c.type === 'Monster').length,
  };

  if (characters.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-sm">Aucun personnage. Ajoutez votre premier personnage pour commencer !</p>
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
      
      {/* Barre de filtres et recherche */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Recherche */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher un personnage..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Tri */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="name">Trier par nom</option>
            <option value="level">Trier par niveau</option>
            <option value="type">Trier par type</option>
          </select>
        </div>

        {/* Filtres par type */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tous ({characters.length})
          </button>
          <button
            onClick={() => setFilterType('PC')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'PC'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            PJ ({typeCount.PC})
          </button>
          <button
            onClick={() => setFilterType('NPC')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'NPC'
                ? 'bg-green-600 text-white'
                : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
          >
            PNJ ({typeCount.NPC})
          </button>
          <button
            onClick={() => setFilterType('Monster')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'Monster'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            Monstres ({typeCount.Monster})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredAndSortedCharacters.map((character) => {
        // Use MonsterCard for monsters
        if (character.type === 'Monster') {
          return (
            <MonsterCard
              key={character.id}
              monster={character}
              onEdit={() => setEditingCharacter(character)}
              onDelete={() => {
                if (confirm(`Supprimer ${character.name} ?`)) {
                  deleteCharacter(character.id);
                }
              }}
            />
          );
        }

        // Regular card for PC/NPC
        return (
        <div key={character.id} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">{character.name}</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  character.type === 'PC' ? 'bg-blue-50 text-blue-700' : 
                  character.type === 'NPC' ? 'bg-green-50 text-green-700' : 
                  'bg-red-50 text-red-700'
                }`}>
                  {character.type}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {character.class && `${character.class}`}
                {character.level && ` • Niv ${character.level}`}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setEditingCharacter(character)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Modifier"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => {
                  if (confirm(`Supprimer ${character.name} ?`)) {
                    deleteCharacter(character.id);
                  }
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Supprimer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-xs text-gray-500 block">CA</span>
              <p className="text-base font-semibold text-gray-900">{character.armorClass}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-xs text-gray-500 block">Init</span>
              <p className="text-base font-semibold text-gray-900">
                {character.initiativeBonus >= 0 ? '+' : ''}{character.initiativeBonus}
              </p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-xs text-gray-500 block">Vitesse</span>
              <p className="text-base font-semibold text-gray-900">{character.speed} m</p>
            </div>
          </div>

          <div className="mb-4">
            {editingId === character.id ? (
              <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 w-16">Actuels:</label>
                  <input
                    type="number"
                    value={editHP.current}
                    onChange={(e) => setEditHP({ ...editHP, current: parseInt(e.target.value) || 0 })}
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 w-16">Max:</label>
                  <input
                    type="number"
                    value={editHP.max}
                    onChange={(e) => setEditHP({ ...editHP, max: parseInt(e.target.value) || 0 })}
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 w-16">Temp:</label>
                  <input
                    type="number"
                    value={editHP.temporary}
                    onChange={(e) => setEditHP({ ...editHP, temporary: parseInt(e.target.value) || 0 })}
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => saveHP(character.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                  >
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm font-medium transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => handleHPEdit(character)}
                className="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-lg cursor-pointer hover:from-red-100 hover:to-red-200 transition-all"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-red-900">Points de Vie</span>
                  <span className="text-xs text-red-600">Cliquer pour modifier</span>
                </div>
                <p className="text-2xl font-bold text-red-700">
                  {character.hitPoints.current}
                  {character.hitPoints.temporary > 0 && (
                    <span className="text-blue-600"> +{character.hitPoints.temporary}</span>
                  )}
                  <span className="text-base text-gray-500 font-normal"> / {character.hitPoints.max}</span>
                </p>
              </div>
            )}
          </div>

          <div className="mb-3">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Caractéristiques</h4>
            <div className="grid grid-cols-6 gap-1.5">
              {Object.entries(character.abilities).map(([ability, score]) => (
                <div key={ability} className="bg-gray-50 p-1.5 rounded text-center">
                  <div className="text-xs text-gray-500">{ability}</div>
                  <div className="text-sm font-semibold text-gray-900">{score}</div>
                  <div className="text-xs text-gray-600">
                    {calculateModifier(score) >= 0 ? '+' : ''}{calculateModifier(score)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {character.conditions.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-medium text-gray-700 mb-1.5">États</h4>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {character.conditions.map((condition) => (
                  <span
                    key={condition.id}
                    className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs flex items-center gap-1.5 font-medium"
                    title={condition.description}
                  >
                    {condition.name}
                    <button
                      onClick={() => removeCondition(character, condition.id)}
                      className="text-amber-700 hover:text-amber-900 transition-colors"
                      aria-label="Retirer l'état"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
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
                className="w-full px-3 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
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
          )}

          {character.notes && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 italic">{character.notes}</p>
            </div>
          )}
        </div>
        );
      })}
    </div>
    </>
  );
}
