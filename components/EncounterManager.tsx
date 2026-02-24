'use client';

import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { CharacterType } from '@/types/dnd';

export default function EncounterManager() {
  const { characters, encounters, createEncounter, startEncounter, deleteEncounter, updateEncounter } = useGame();
  const [isCreating, setIsCreating] = useState(false);
  const [editingEncounterId, setEditingEncounterId] = useState<string | null>(null);
  const [encounterName, setEncounterName] = useState('');
  const [dmNotes, setDmNotes] = useState('');
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = () => {
    if (encounterName && selectedCharacterIds.length > 0) {
      createEncounter(encounterName, selectedCharacterIds, dmNotes);
      setIsCreating(false);
      setEncounterName('');
      setDmNotes('');
      setSelectedCharacterIds([]);
    }
  };

  const handleEdit = (encounterId: string) => {
    const encounter = encounters.find(e => e.id === encounterId);
    if (encounter) {
      setEditingEncounterId(encounterId);
      setEncounterName(encounter.name);
      setDmNotes(encounter.dmNotes || '');
      setSelectedCharacterIds(encounter.participants.map(p => p.id));
    }
  };

  const handleUpdate = async () => {
    if (editingEncounterId && encounterName && selectedCharacterIds.length > 0) {
      const encounter = encounters.find(e => e.id === editingEncounterId);
      if (encounter) {
        // Update encounter name and notes
        await updateEncounter(editingEncounterId, { name: encounterName, dmNotes });
        
        // TODO: Update participants (remove old, add new)
        // For now, we'll need to add API endpoints to manage participants
        
        setEditingEncounterId(null);
        setEncounterName('');
        setDmNotes('');
        setSelectedCharacterIds([]);
      }
    }
  };

  const toggleCharacterSelection = (id: string) => {
    if (selectedCharacterIds.includes(id)) {
      setSelectedCharacterIds(selectedCharacterIds.filter(cid => cid !== id));
    } else {
      setSelectedCharacterIds([...selectedCharacterIds, id]);
    }
  };

  const handleDelete = (encounterId: string) => {
    deleteEncounter(encounterId);
    setDeletingId(null);
  };

  const getTypeColor = (type: CharacterType) => {
    switch (type) {
      case 'PC': return 'text-blue-600';
      case 'NPC': return 'text-green-600';
      case 'Monster': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isCreating || editingEncounterId) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {editingEncounterId ? 'Modifier la Rencontre' : 'Nouvelle Rencontre'}
        </h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la rencontre</label>
          <input
            type="text"
            value={encounterName}
            onChange={(e) => setEncounterName(e.target.value)}
            placeholder="Entrez le nom..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes de MJ</label>
          <textarea
            value={dmNotes}
            onChange={(e) => setDmNotes(e.target.value)}
            placeholder="Notes privées pour le MJ (stratégies, éléments à ne pas oublier, etc.)..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner les personnages ({selectedCharacterIds.length} sélectionné{selectedCharacterIds.length > 1 ? 's' : ''})
          </label>
          <div className="space-y-1.5 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
            {characters.map((character) => (
              <label
                key={character.id}
                className="flex items-center gap-3 p-2.5 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCharacterIds.includes(character.id)}
                  onChange={() => toggleCharacterSelection(character.id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{character.name}</div>
                  <div className="text-xs text-gray-600 flex items-center gap-1.5">
                    <span className={`font-medium ${getTypeColor(character.type)}`}>{character.type}</span>
                    {character.class && <><span>•</span><span>{character.class}</span></>}
                    {character.level && <><span>•</span><span>Niv {character.level}</span></>}
                    <span>•</span><span>CA {character.armorClass}</span>
                    <span>•</span><span>PV {character.hitPoints.max}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={editingEncounterId ? handleUpdate : handleCreate}
            disabled={!encounterName || selectedCharacterIds.length === 0}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            {editingEncounterId ? 'Mettre à jour' : 'Créer la rencontre'}
          </button>
          <button
            onClick={() => {
              setIsCreating(false);
              setEditingEncounterId(null);
              setEncounterName('');
              setDmNotes('');
              setSelectedCharacterIds([]);
            }}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsCreating(true)}
        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Nouvelle Rencontre
      </button>

      {encounters.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-gray-500">Aucune rencontre. Créez votre première rencontre !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {encounters.map((encounter) => (
            <div
              key={encounter.id}
              className={`bg-white rounded-lg border-2 p-4 transition-all ${
                encounter.isActive ? 'border-green-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{encounter.name}</h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {encounter.participants.length} participant{encounter.participants.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {encounter.isActive && (
                    <span className="bg-green-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                      ACTIVE
                    </span>
                  )}
                  {!encounter.isActive && (
                    <>
                      <button
                        onClick={() => handleEdit(encounter.id)}
                        className="p-1.5 rounded transition-colors text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        title="Modifier"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          if (deletingId === encounter.id) {
                            handleDelete(encounter.id);
                          } else {
                            setDeletingId(encounter.id);
                            setTimeout(() => setDeletingId(null), 3000);
                          }
                        }}
                        className={`p-1.5 rounded transition-colors ${
                          deletingId === encounter.id
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title={deletingId === encounter.id ? 'Cliquer à nouveau pour confirmer' : 'Supprimer'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <div className="text-xs font-medium text-gray-700 mb-1.5">Participants</div>
                <div className="flex flex-wrap gap-1">
                  {encounter.participants.map((p) => (
                    <span
                      key={p.id}
                      className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium"
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>

              {!encounter.isActive && (
                <button
                  onClick={() => startEncounter(encounter.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Démarrer
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
