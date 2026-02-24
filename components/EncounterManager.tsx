'use client';

import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';

export default function EncounterManager() {
  const { characters, encounters, createEncounter, startEncounter } = useGame();
  const [isCreating, setIsCreating] = useState(false);
  const [encounterName, setEncounterName] = useState('');
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);

  const handleCreate = () => {
    if (encounterName && selectedCharacterIds.length > 0) {
      createEncounter(encounterName, selectedCharacterIds);
      setIsCreating(false);
      setEncounterName('');
      setSelectedCharacterIds([]);
    }
  };

  const toggleCharacterSelection = (id: string) => {
    if (selectedCharacterIds.includes(id)) {
      setSelectedCharacterIds(selectedCharacterIds.filter(cid => cid !== id));
    } else {
      setSelectedCharacterIds([...selectedCharacterIds, id]);
    }
  };

  if (isCreating) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Create New Encounter</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Encounter Name</label>
          <input
            type="text"
            value={encounterName}
            onChange={(e) => setEncounterName(e.target.value)}
            placeholder="Enter encounter name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Select Characters ({selectedCharacterIds.length} selected)
          </label>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {characters.map((character) => (
              <label
                key={character.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedCharacterIds.includes(character.id)}
                  onChange={() => toggleCharacterSelection(character.id)}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">{character.name}</div>
                  <div className="text-sm text-gray-600">
                    {character.type} • AC {character.armorClass} • HP {character.hitPoints.max}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCreate}
            disabled={!encounterName || selectedCharacterIds.length === 0}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Create Encounter
          </button>
          <button
            onClick={() => setIsCreating(false)}
            className="flex-1 bg-gray-300 hover:bg-gray-400 px-6 py-3 rounded-lg font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsCreating(true)}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
      >
        + Create Encounter
      </button>

      {encounters.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No encounters yet. Create your first encounter!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {encounters.map((encounter) => (
            <div
              key={encounter.id}
              className={`bg-white rounded-lg shadow-md p-4 border-2 ${
                encounter.isActive ? 'border-green-500' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold">{encounter.name}</h3>
                  <p className="text-sm text-gray-600">
                    {encounter.participants.length} participants
                  </p>
                </div>
                {encounter.isActive && (
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    ACTIVE
                  </span>
                )}
              </div>

              <div className="mb-3">
                <div className="text-sm text-gray-600 mb-1">Participants:</div>
                <div className="flex flex-wrap gap-1">
                  {encounter.participants.map((p) => (
                    <span
                      key={p.id}
                      className="bg-gray-200 px-2 py-1 rounded text-xs"
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>

              {!encounter.isActive && (
                <button
                  onClick={() => startEncounter(encounter.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Start Encounter
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
