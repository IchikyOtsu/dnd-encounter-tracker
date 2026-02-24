'use client';

import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { calculateModifier, COMMON_CONDITIONS } from '@/types/dnd';

export default function InitiativeTracker() {
  const {
    currentEncounter,
    endEncounter,
    nextTurn,
    updateParticipant,
    addParticipantToEncounter,
    removeParticipantFromEncounter,
    rollInitiatives,
    characters,
  } = useGame();

  const [editingHPId, setEditingHPId] = useState<string | null>(null);
  const [hpChange, setHpChange] = useState<number>(0);
  const [showAddCharacter, setShowAddCharacter] = useState(false);

  if (!currentEncounter) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No active encounter. Start an encounter to use the initiative tracker!</p>
      </div>
    );
  }

  const currentParticipant = currentEncounter.participants[currentEncounter.currentTurnIndex];

  const applyHPChange = (participantId: string) => {
    const participant = currentEncounter.participants.find(p => p.id === participantId);
    if (!participant) return;

    let newCurrent = participant.hitPoints.current + hpChange;
    newCurrent = Math.max(0, Math.min(newCurrent, participant.hitPoints.max));

    updateParticipant(participantId, {
      hitPoints: {
        ...participant.hitPoints,
        current: newCurrent,
      },
    });

    setEditingHPId(null);
    setHpChange(0);
  };

  const addConditionToParticipant = (participantId: string, conditionId: string) => {
    const participant = currentEncounter.participants.find(p => p.id === participantId);
    if (!participant) return;

    const condition = COMMON_CONDITIONS.find(c => c.id === conditionId);
    if (condition && !participant.conditions.find(c => c.id === conditionId)) {
      updateParticipant(participantId, {
        conditions: [...participant.conditions, condition],
      });
    }
  };

  const removeConditionFromParticipant = (participantId: string, conditionId: string) => {
    const participant = currentEncounter.participants.find(p => p.id === participantId);
    if (!participant) return;

    updateParticipant(participantId, {
      conditions: participant.conditions.filter(c => c.id !== conditionId),
    });
  };

  const availableCharacters = characters.filter(
    c => !currentEncounter.participants.find(p => p.id === c.id)
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold">{currentEncounter.name}</h2>
          <button
            onClick={endEncounter}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold"
          >
            End Encounter
          </button>
        </div>
        <div className="flex gap-6 text-lg">
          <div>
            <span className="opacity-75">Round:</span>{' '}
            <span className="font-bold">{currentEncounter.currentRound}</span>
          </div>
          <div>
            <span className="opacity-75">Turn:</span>{' '}
            <span className="font-bold">
              {currentParticipant?.name || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex gap-3 mb-6">
          <button
            onClick={nextTurn}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold text-lg"
          >
            Next Turn →
          </button>
          <button
            onClick={rollInitiatives}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            🎲 Re-roll Initiatives
          </button>
          <button
            onClick={() => setShowAddCharacter(!showAddCharacter)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            + Add
          </button>
        </div>

        {showAddCharacter && availableCharacters.length > 0 && (
          <div className="mb-6 p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold mb-2">Add Character to Encounter</h3>
            <div className="space-y-2">
              {availableCharacters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => {
                    addParticipantToEncounter(char.id);
                    setShowAddCharacter(false);
                  }}
                  className="w-full text-left p-3 bg-white hover:bg-gray-50 rounded border border-gray-300"
                >
                  <div className="font-medium">{char.name}</div>
                  <div className="text-sm text-gray-600">
                    {char.type} • AC {char.armorClass} • HP {char.hitPoints.max}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {currentEncounter.participants.map((participant, index) => {
            const isCurrentTurn = index === currentEncounter.currentTurnIndex;
            const hpPercent = (participant.hitPoints.current / participant.hitPoints.max) * 100;

            return (
              <div
                key={participant.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isCurrentTurn
                    ? 'border-green-500 bg-green-50 shadow-lg'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-gray-400 w-8">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{participant.name}</h3>
                      <div className="text-sm text-gray-600">
                        Initiative: <span className="font-bold">{participant.initiative}</span>
                        {' • '}AC: {participant.armorClass}
                        {participant.speed && ` • Speed: ${participant.speed} ft`}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeParticipantFromEncounter(participant.id)}
                    className="text-red-500 hover:text-red-700 text-xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Hit Points</span>
                      {editingHPId !== participant.id && (
                        <button
                          onClick={() => setEditingHPId(participant.id)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Adjust HP
                        </button>
                      )}
                    </div>
                    
                    {editingHPId === participant.id ? (
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => setHpChange(hpChange - 5)}
                          className="bg-red-500 text-white px-3 py-1 rounded"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => setHpChange(hpChange - 1)}
                          className="bg-red-400 text-white px-3 py-1 rounded"
                        >
                          -1
                        </button>
                        <input
                          type="number"
                          value={hpChange}
                          onChange={(e) => setHpChange(parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border rounded text-center"
                        />
                        <button
                          onClick={() => setHpChange(hpChange + 1)}
                          className="bg-green-400 text-white px-3 py-1 rounded"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => setHpChange(hpChange + 5)}
                          className="bg-green-500 text-white px-3 py-1 rounded"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => applyHPChange(participant.id)}
                          className="bg-blue-600 text-white px-4 py-1 rounded"
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => {
                            setEditingHPId(null);
                            setHpChange(0);
                          }}
                          className="text-gray-600"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              hpPercent > 50
                                ? 'bg-green-500'
                                : hpPercent > 25
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.max(0, hpPercent)}%` }}
                          />
                        </div>
                        <div className="mt-1 text-center font-bold">
                          {participant.hitPoints.current}
                          {participant.hitPoints.temporary > 0 && (
                            <span className="text-blue-600"> +{participant.hitPoints.temporary}</span>
                          )}
                          <span className="text-gray-500"> / {participant.hitPoints.max}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">Ability Modifiers</div>
                    <div className="grid grid-cols-6 gap-1">
                      {Object.entries(participant.abilities).map(([ability, score]) => (
                        <div
                          key={ability}
                          className="bg-gray-100 p-1 rounded text-center"
                          title={`${ability}: ${score}`}
                        >
                          <div className="text-xs text-gray-600">{ability}</div>
                          <div className="text-sm font-bold">
                            {calculateModifier(score) >= 0 ? '+' : ''}
                            {calculateModifier(score)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {participant.conditions.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-medium mb-1">Conditions</div>
                    <div className="flex flex-wrap gap-1">
                      {participant.conditions.map((condition) => (
                        <span
                          key={condition.id}
                          className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs flex items-center gap-1"
                          title={condition.description}
                        >
                          {condition.name}
                          <button
                            onClick={() => removeConditionFromParticipant(participant.id, condition.id)}
                            className="text-yellow-900 hover:text-yellow-950"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addConditionToParticipant(participant.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="">+ Add condition</option>
                    {COMMON_CONDITIONS.filter(
                      c => !participant.conditions.find(pc => pc.id === c.id)
                    ).map((condition) => (
                      <option key={condition.id} value={condition.id}>
                        {condition.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
