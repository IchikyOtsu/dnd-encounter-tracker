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
      <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
        <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
        <p className="text-gray-500">Aucune rencontre active. Sélectionnez une rencontre pour commencer le suivi !</p>
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-semibold">{currentEncounter.name}</h2>
          <button
            onClick={endEncounter}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Terminer
          </button>
        </div>
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="opacity-80">Tour:</span>
            <span className="font-semibold">{currentEncounter.currentRound}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="opacity-80">Participant actif:</span>
            <span className="font-semibold">
              {currentParticipant?.name || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex gap-2 mb-5">
          <button
            onClick={nextTurn}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium text-base transition-colors inline-flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Tour Suivant
          </button>
          <button
            onClick={rollInitiatives}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Relancer
          </button>
          <button
            onClick={() => setShowAddCharacter(!showAddCharacter)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter
          </button>
        </div>

        {showAddCharacter && availableCharacters.length > 0 && (
          <div className="mb-5 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="font-medium text-gray-900 mb-2.5">Ajouter un personnage</h3>
            <div className="space-y-1.5">
              {availableCharacters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => {
                    addParticipantToEncounter(char.id);
                    setShowAddCharacter(false);
                  }}
                  className="w-full text-left p-2.5 bg-white hover:bg-blue-50 rounded border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="font-medium text-gray-900">{char.name}</div>
                  <div className="text-xs text-gray-600">
                    {char.type} • CA {char.armorClass} • PV {char.hitPoints.max}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2.5">
          {currentEncounter.participants.map((participant, index) => {
            const isCurrentTurn = index === currentEncounter.currentTurnIndex;
            const hpPercent = (participant.hitPoints.current / participant.hitPoints.max) * 100;

            return (
              <div
                key={participant.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isCurrentTurn
                    ? 'border-green-500 bg-green-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-xl font-semibold text-gray-400 w-7">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{participant.name}</h3>
                      <div className="text-xs text-gray-600 flex items-center gap-1.5 mt-0.5">
                        <span>{participant.type}</span>
                        {participant.class && <><span>•</span><span>{participant.class}</span></>}
                        {participant.level && <><span>•</span><span>Niv {participant.level}</span></>}
                      </div>
                      <div className="text-xs text-gray-600 flex items-center gap-1.5 mt-0.5">
                        <span className="font-medium">Initiative: {participant.initiative}</span>
                        <span>•</span><span>CA: {participant.armorClass}</span>
                        {participant.speed && <><span>•</span><span>Vitesse: {participant.speed} m</span></>}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeParticipantFromEncounter(participant.id)}
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"
                    aria-label="Retirer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-700">Points de Vie</span>
                      {editingHPId !== participant.id && (
                        <button
                          onClick={() => setEditingHPId(participant.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Modifier
                        </button>
                      )}
                    </div>
                    
                    {editingHPId === participant.id ? (
                      <div className="space-y-2">
                        <div className="flex gap-1.5 items-center">
                          <button
                            onClick={() => setHpChange(hpChange - 5)}
                            className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded text-xs font-medium"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => setHpChange(hpChange - 1)}
                            className="bg-red-400 hover:bg-red-500 text-white px-2.5 py-1 rounded text-xs font-medium"
                          >
                            -1
                          </button>
                          <input
                            type="number"
                            value={hpChange}
                            onChange={(e) => setHpChange(parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 border border-gray-200 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => setHpChange(hpChange + 1)}
                            className="bg-green-400 hover:bg-green-500 text-white px-2.5 py-1 rounded text-xs font-medium"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => setHpChange(hpChange + 5)}
                            className="bg-green-500 hover:bg-green-600 text-white px-2.5 py-1 rounded text-xs font-medium"
                          >
                            +5
                          </button>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => applyHPChange(participant.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium"
                          >
                            Appliquer
                          </button>
                          <button
                            onClick={() => {
                              setEditingHPId(null);
                              setHpChange(0);
                            }}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-medium"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="bg-gray-200 rounded-full h-5 overflow-hidden">
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
                        <div className="mt-1.5 text-center font-semibold text-sm">
                          {participant.hitPoints.current}
                          {participant.hitPoints.temporary > 0 && (
                            <span className="text-blue-600"> +{participant.hitPoints.temporary}</span>
                          )}
                          <span className="text-gray-500 font-normal"> / {participant.hitPoints.max}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-2">Modificateurs</div>
                    <div className="grid grid-cols-6 gap-1">
                      {Object.entries(participant.abilities).map(([ability, score]) => (
                        <div
                          key={ability}
                          className="bg-gray-50 p-1 rounded text-center"
                          title={`${ability}: ${score}`}
                        >
                          <div className="text-xs text-gray-600">{ability}</div>
                          <div className="text-sm font-semibold text-gray-900">
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
                    <div className="text-xs font-medium text-gray-700 mb-1.5">États</div>
                    <div className="flex flex-wrap gap-1.5">
                      {participant.conditions.map((condition) => (
                        <span
                          key={condition.id}
                          className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs flex items-center gap-1.5 font-medium"
                          title={condition.description}
                        >
                          {condition.name}
                          <button
                            onClick={() => removeConditionFromParticipant(participant.id, condition.id)}
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
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">+ Ajouter un état</option>
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
