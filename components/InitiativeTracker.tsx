'use client';

import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { calculateModifier, COMMON_CONDITIONS } from '@/types/dnd';
import ReactMarkdown from 'react-markdown';

export default function InitiativeTracker() {
  const {
    currentEncounter,
    endEncounter,
    endEncounterAndSave,
    nextTurn,
    updateParticipant,
    updateInitiativeAndSort,
    updateDeathSaves,
    addParticipantToEncounter,
    removeParticipantFromEncounter,
    rollInitiatives,
    sortInitiatives,
    characters,
  } = useGame();

  const [hpChange, setHpChange] = useState<number>(1);
  const [showAddCharacter, setShowAddCharacter] = useState(false);
  const [editingInitiativeId, setEditingInitiativeId] = useState<string | null>(null);
  const [tempInitiative, setTempInitiative] = useState<number>(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [selectedParticipantForCondition, setSelectedParticipantForCondition] = useState<string | null>(null);
  const [selectedConditionId, setSelectedConditionId] = useState<string>('');
  const [conditionDuration, setConditionDuration] = useState<string>('');
  const [concentrationReminder, setConcentrationReminder] = useState<string | null>(null);
  const [dmNotesExpanded, setDmNotesExpanded] = useState(true);

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

  const applyHPChange = (participantId: string, amount: number) => {
    const participant = currentEncounter.participants.find(p => p.id === participantId);
    if (!participant) return;

    const rawNewCurrent = participant.hitPoints.current + amount;
    
    // Rappel de concentration si le personnage prend des dégâts
    if (amount < 0 && participant.isConcentrating) {
      const damage = Math.abs(amount);
      const dc = Math.max(10, Math.floor(damage / 2));
      setConcentrationReminder(`${participant.name} doit faire un jet de sauvegarde de Constitution DD ${dc} pour maintenir sa concentration !`);
      setTimeout(() => setConcentrationReminder(null), 8000);
    }
    
    // Vérifier les dégâts massifs (mort instantanée)
    // Si les dégâts font tomber à un négatif >= au maximum de HP, mort instantanée
    const isMassiveDamage = amount < 0 && rawNewCurrent < 0 && Math.abs(rawNewCurrent) >= participant.hitPoints.max;
    
    let newCurrent = Math.max(0, Math.min(rawNewCurrent, participant.hitPoints.max));

    const updates: any = {
      hitPoints: {
        ...participant.hitPoints,
        current: newCurrent,
      },
    };

    // Dégâts massifs : mort instantanée
    if (isMassiveDamage) {
      updates.isDead = true;
      updates.deathSaves = { successes: 0, failures: 0 };
      updates.isStable = false;
    }
    // Guérison : réinitialiser les death saves et les états
    else if ((participant.hitPoints.current === 0 && newCurrent > 0) || (participant.isDead && newCurrent > 0)) {
      updates.deathSaves = { successes: 0, failures: 0 };
      updates.isStable = false;
      updates.isDead = false;
    }

    updateParticipant(participantId, updates);
  };

  const updateInitiative = (participantId: string, newInitiative: number) => {
    updateInitiativeAndSort(participantId, newInitiative);
    setEditingInitiativeId(null);
  };

  const rollSingleInitiative = (participantId: string) => {
    const participant = currentEncounter.participants.find(p => p.id === participantId);
    if (!participant || !currentEncounter) return;
    
    const roll = Math.floor(Math.random() * 20) + 1 + participant.initiativeBonus;
    updateInitiativeAndSort(participantId, roll);
  };

  const openConditionModal = (participantId: string) => {
    setSelectedParticipantForCondition(participantId);
    setSelectedConditionId('');
    setConditionDuration('');
    setShowConditionModal(true);
  };

  const addConditionToParticipant = (participantId: string, conditionId: string, duration?: number) => {
    const participant = currentEncounter.participants.find(p => p.id === participantId);
    if (!participant) return;

    const condition = COMMON_CONDITIONS.find(c => c.id === conditionId);
    if (condition && !participant.conditions.find(c => c.id === conditionId)) {
      const newCondition = {
        ...condition,
        duration: duration && duration > 0 ? duration : undefined,
      };
      updateParticipant(participantId, {
        conditions: [...participant.conditions, newCondition],
      });
    }
    
    setShowConditionModal(false);
    setSelectedParticipantForCondition(null);
    setSelectedConditionId('');
    setConditionDuration('');
  };

  const removeConditionFromParticipant = (participantId: string, conditionId: string) => {
    const participant = currentEncounter.participants.find(p => p.id === participantId);
    if (!participant) return;

    updateParticipant(participantId, {
      conditions: participant.conditions.filter(c => c.id !== conditionId),
    });
  };

  const toggleConcentration = (participantId: string) => {
    const participant = currentEncounter.participants.find(p => p.id === participantId);
    if (!participant) return;

    updateParticipant(participantId, {
      isConcentrating: !participant.isConcentrating,
    });
  };

  const availableCharacters = characters.filter(
    c => !currentEncounter.participants.find(p => p.id === c.id)
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Notes de MJ */}
      {currentEncounter.dmNotes && (
        <div className={`fixed left-4 top-20 z-40 transition-all duration-300 ${dmNotesExpanded ? 'w-80' : 'w-12'}`}>
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={() => setDmNotesExpanded(!dmNotesExpanded)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {dmNotesExpanded && <span className="font-semibold">Notes de MJ</span>}
              </div>
              {dmNotesExpanded ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
            {dmNotesExpanded && (
              <div className="p-4 max-h-96 overflow-y-auto">
                <div className="text-sm text-gray-700 prose prose-sm prose-amber max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-lg font-bold text-amber-900 mb-2" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-base font-bold text-amber-900 mb-2" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-sm font-bold text-amber-800 mb-1" {...props} />,
                      p: ({node, ...props}) => <p className="mb-2" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-amber-900" {...props} />,
                      em: ({node, ...props}) => <em className="italic" {...props} />,
                      code: ({node, ...props}) => <code className="bg-amber-100 px-1 rounded text-xs" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-amber-500 pl-3 italic my-2" {...props} />,
                    }}
                  >
                    {currentEncounter.dmNotes}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rappel de concentration */}
      {concentrationReminder && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce">
          <div className="bg-purple-600 text-white rounded-lg shadow-2xl p-4 border-2 border-purple-800">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <div className="font-bold mb-1">⚠️ Test de Concentration</div>
                <div className="text-sm">{concentrationReminder}</div>
              </div>
              <button
                onClick={() => setConcentrationReminder(null)}
                className="text-white hover:text-purple-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout de condition */}
      {showConditionModal && selectedParticipantForCondition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-6">
              <h3 className="text-xl font-bold">Ajouter un état</h3>
              <p className="text-sm opacity-90 mt-1">Sélectionnez un état et sa durée optionnelle</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  État
                </label>
                <select
                  value={selectedConditionId}
                  onChange={(e) => setSelectedConditionId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un état</option>
                  {COMMON_CONDITIONS.filter(
                    c => !currentEncounter.participants.find(p => p.id === selectedParticipantForCondition)?.conditions.find(pc => pc.id === c.id)
                  ).map((condition) => (
                    <option key={condition.id} value={condition.id}>
                      {condition.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée (en rounds) - Optionnel
                </label>
                <input
                  type="number"
                  value={conditionDuration}
                  onChange={(e) => setConditionDuration(e.target.value)}
                  placeholder="Laisser vide pour permanent"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Si aucune durée n'est spécifiée, l'état sera permanent jusqu'à suppression manuelle
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (selectedConditionId) {
                      const duration = conditionDuration ? parseInt(conditionDuration) : undefined;
                      addConditionToParticipant(selectedParticipantForCondition, selectedConditionId, duration);
                    }
                  }}
                  disabled={!selectedConditionId}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Ajouter
                </button>
                <button
                  onClick={() => {
                    setShowConditionModal(false);
                    setSelectedParticipantForCondition(null);
                    setSelectedConditionId('');
                    setConditionDuration('');
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de fin de rencontre */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <h3 className="text-xl font-bold">Terminer la rencontre</h3>
              <p className="text-sm opacity-90 mt-1">Choisissez comment clôturer cette rencontre</p>
            </div>
            <div className="p-6 space-y-4">
              <button
                onClick={() => {
                  endEncounterAndSave();
                  setShowEndModal(false);
                }}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-lg font-medium transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-semibold text-base">Valider et sauvegarder</div>
                    <div className="text-sm opacity-90 mt-1">
                      Met à jour les PV de tous les personnages dans leurs fiches
                    </div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  endEncounter();
                  setShowEndModal(false);
                }}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-4 rounded-lg font-medium transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                    <div className="font-semibold text-base">Fermer sans sauvegarder</div>
                    <div className="text-sm opacity-90 mt-1">
                      Les PV des personnages ne seront pas modifiés
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowEndModal(false)}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors border-2 border-gray-200"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-semibold">{currentEncounter.name}</h2>
          <button
            onClick={() => setShowEndModal(true)}
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
            onClick={sortInitiatives}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            Trier
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
                        <span>CA: {participant.armorClass}</span>
                        {participant.speed && <><span>•</span><span>Vitesse: {participant.speed} m</span></>}
                      </div>
                      <div className="text-xs flex items-center gap-2 mt-1">
                        {editingInitiativeId === participant.id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-600">Initiative:</span>
                            <input
                              type="number"
                              value={tempInitiative}
                              onChange={(e) => setTempInitiative(parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-0.5 border border-gray-200 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                            />
                            <button
                              onClick={() => updateInitiative(participant.id, tempInitiative)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded text-xs font-medium"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingInitiativeId(null)}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-0.5 rounded text-xs font-medium"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              Initiative: {participant.initiative > 0 ? participant.initiative : '—'}
                            </span>
                            <button
                              onClick={() => {
                                setTempInitiative(participant.initiative);
                                setEditingInitiativeId(participant.id);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="Éditer manuellement"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => rollSingleInitiative(participant.id)}
                              className="text-green-600 hover:text-green-800"
                              title="Lancer l'initiative"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                          </div>
                        )}
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
                      {participant.isDead && (
                        <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                          ☠ MORT
                        </span>
                      )}
                      {!participant.isDead && participant.isStable && participant.hitPoints.current === 0 && (
                        <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">
                          STABLE
                        </span>
                      )}
                      {!participant.isDead && !participant.isStable && participant.hitPoints.current === 0 && (
                        <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
                          KO
                        </span>
                      )}
                    </div>
                    
                    <div>
                      <div className="bg-gray-200 rounded-full h-5 overflow-hidden mb-2">
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
                      <div className="text-center font-semibold text-sm mb-2">
                        {participant.hitPoints.current}
                        {participant.hitPoints.temporary > 0 && (
                          <span className="text-blue-600"> +{participant.hitPoints.temporary}</span>
                        )}
                        <span className="text-gray-500 font-normal"> / {participant.hitPoints.max}</span>
                      </div>

                      {/* Death Saving Throws - Affiché quand HP = 0 */}
                      {participant.hitPoints.current === 0 && !participant.isDead && (
                        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 mb-2">
                          <div className="text-xs font-bold text-red-900 mb-2 text-center">
                            JETS DE SAUVEGARDE CONTRE LA MORT
                          </div>
                          <div className="space-y-2">
                            {/* Succès */}
                            <div>
                              <div className="text-xs font-medium text-green-700 mb-1">Succès:</div>
                              <div className="flex gap-2">
                                {[1, 2, 3].map(i => (
                                  <button
                                    key={`success-${i}`}
                                    onClick={() => {
                                      const newValue = participant.deathSaves.successes === i ? i - 1 : i;
                                      updateDeathSaves(participant.id, 'success', newValue);
                                    }}
                                    className={`w-8 h-8 rounded border-2 flex items-center justify-center transition-all ${
                                      participant.deathSaves.successes >= i
                                        ? 'bg-green-500 border-green-700 text-white'
                                        : 'bg-white border-green-500 hover:bg-green-100'
                                    }`}
                                    title={`Succès ${i}`}
                                  >
                                    {participant.deathSaves.successes >= i && '✓'}
                                  </button>
                                ))}
                                <span className="text-xs text-gray-600 ml-2 self-center">
                                  {participant.deathSaves.successes}/3
                                </span>
                              </div>
                            </div>
                            {/* Échecs */}
                            <div>
                              <div className="text-xs font-medium text-red-700 mb-1">Échecs:</div>
                              <div className="flex gap-2">
                                {[1, 2, 3].map(i => (
                                  <button
                                    key={`failure-${i}`}
                                    onClick={() => {
                                      const newValue = participant.deathSaves.failures === i ? i - 1 : i;
                                      updateDeathSaves(participant.id, 'failure', newValue);
                                    }}
                                    className={`w-8 h-8 rounded border-2 flex items-center justify-center transition-all ${
                                      participant.deathSaves.failures >= i
                                        ? 'bg-red-600 border-red-800 text-white'
                                        : 'bg-white border-red-500 hover:bg-red-100'
                                    }`}
                                    title={`Échec ${i}`}
                                  >
                                    {participant.deathSaves.failures >= i && '✗'}
                                  </button>
                                ))}
                                <span className="text-xs text-gray-600 ml-2 self-center">
                                  {participant.deathSaves.failures}/3
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-1.5 items-center">
                        <button
                          onClick={() => applyHPChange(participant.id, -hpChange)}
                          className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded font-bold text-lg flex items-center justify-center"
                          title="Retirer des PV"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={hpChange}
                          onChange={(e) => setHpChange(Math.max(1, parseInt(e.target.value) || 1))}
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="1"
                        />
                        <button
                          onClick={() => applyHPChange(participant.id, hpChange)}
                          className="bg-green-500 hover:bg-green-600 text-white w-8 h-8 rounded font-bold text-lg flex items-center justify-center"
                          title="Ajouter des PV"
                        >
                          +
                        </button>
                      </div>
                    </div>
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
                          {condition.duration !== undefined && (
                            <span className="bg-amber-200 px-1.5 py-0.5 rounded font-bold">
                              {condition.duration}r
                            </span>
                          )}
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

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => openConditionModal(participant.id)}
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors font-medium text-gray-700"
                  >
                    + Ajouter un état
                  </button>
                  <button
                    onClick={() => toggleConcentration(participant.id)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      participant.isConcentrating
                        ? 'bg-purple-600 text-white hover:bg-purple-700 ring-2 ring-purple-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={participant.isConcentrating ? 'Concentration active - Cliquer pour désactiver' : 'Pas de concentration - Cliquer pour activer'}
                  >
                    {participant.isConcentrating ? '🔮 Concentration' : '○ Concentration'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
