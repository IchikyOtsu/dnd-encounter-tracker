'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Character, Encounter, EncounterParticipant, rollInitiative } from '@/types/dnd';

interface GameContextType {
  characters: Character[];
  encounters: Encounter[];
  currentEncounter: Encounter | null;
  isLoading: boolean;
  addCharacter: (character: Character) => Promise<void>;
  updateCharacter: (id: string, updates: Partial<Character>) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
  createEncounter: (name: string, characterIds: string[]) => Promise<void>;
  deleteEncounter: (encounterId: string) => Promise<void>;
  startEncounter: (encounterId: string) => void;
  endEncounter: () => Promise<void>;
  endEncounterAndSave: () => Promise<void>;
  nextTurn: () => Promise<void>;
  updateParticipant: (participantId: string, updates: Partial<EncounterParticipant>) => Promise<void>;
  updateInitiativeAndSort: (participantId: string, initiative: number) => void;
  updateDeathSaves: (participantId: string, type: 'success' | 'failure', value: number) => void;
  addParticipantToEncounter: (characterId: string) => void;
  removeParticipantFromEncounter: (participantId: string) => void;
  rollInitiatives: () => void;
  sortInitiatives: () => void;
  refreshData: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [currentEncounter, setCurrentEncounter] = useState<Encounter | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fonction pour normaliser les participants (ajouter les champs manquants)
  const normalizeParticipant = (participant: any): EncounterParticipant => {
    return {
      ...participant,
      deathSaves: participant.deathSaves || { successes: 0, failures: 0 },
      isStable: participant.isStable ?? false,
      isDead: participant.isDead ?? false,
    };
  };

  // Charger les données depuis l'API au démarrage
  const refreshData = async () => {
    try {
      setIsLoading(true);
      const [charsRes, encountersRes] = await Promise.all([
        fetch('/api/characters'),
        fetch('/api/encounters'),
      ]);

      if (charsRes.ok) {
        const charsData = await charsRes.json();
        setCharacters(charsData);
      }

      if (encountersRes.ok) {
        const encountersData = await encountersRes.json();
        const normalizedEncounters = encountersData.map((enc: Encounter) => ({
          ...enc,
          participants: enc.participants.map(normalizeParticipant),
        }));
        setEncounters(normalizedEncounters);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addCharacter = async (character: Character) => {
    try {
      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(character),
      });

      if (res.ok) {
        const newChar = await res.json();
        setCharacters(prev => [...prev, newChar]);
      }
    } catch (error) {
      console.error('Error adding character:', error);
    }
  };

  const updateCharacter = async (id: string, updates: Partial<Character>) => {
    try {
      const res = await fetch(`/api/characters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        setCharacters(prev =>
          prev.map(char => (char.id === id ? { ...char, ...updates } : char))
        );
        
        // Update in current encounter if present
        if (currentEncounter) {
          const updatedParticipants = currentEncounter.participants.map(p =>
            p.id === id ? { ...p, ...updates } : p
          );
          setCurrentEncounter({ ...currentEncounter, participants: updatedParticipants });
        }
      }
    } catch (error) {
      console.error('Error updating character:', error);
    }
  };

  const deleteCharacter = async (id: string) => {
    try {
      const res = await fetch(`/api/characters/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setCharacters(prev => prev.filter(char => char.id !== id));
      }
    } catch (error) {
      console.error('Error deleting character:', error);
    }
  };

  const createEncounter = async (name: string, characterIds: string[]) => {
    try {
      const selectedChars = characters.filter(c => characterIds.includes(c.id));
      const participants: EncounterParticipant[] = selectedChars.map(char => ({
        ...char,
        initiative: 0,
        hasActed: false,
        deathSaves: { successes: 0, failures: 0 },
        isStable: false,
        isDead: false,
      }));

      const encounterData = {
        name,
        participants,
        currentRound: 1,
        currentTurnIndex: 0,
        isActive: false,
      };

      const res = await fetch('/api/encounters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(encounterData),
      });

      if (res.ok) {
        const newEncounter = await res.json();
        setEncounters(prev => [...prev, newEncounter]);
      }
    } catch (error) {
      console.error('Error creating encounter:', error);
    }
  };

  const deleteEncounter = async (encounterId: string) => {
    try {
      const res = await fetch(`/api/encounters/${encounterId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // If we're deleting the current active encounter, end it first
        if (currentEncounter && currentEncounter.id === encounterId) {
          setCurrentEncounter(null);
        }
        setEncounters(prev => prev.filter(e => e.id !== encounterId));
      }
    } catch (error) {
      console.error('Error deleting encounter:', error);
    }
  };

  const startEncounter = (encounterId: string) => {
    const encounter = encounters.find(e => e.id === encounterId);
    if (encounter) {
      // Initialize participants without rolling initiative (set to 0)
      const participantsWithInitiative = encounter.participants.map(p => ({
        ...p,
        initiative: 0,
        hasActed: false,
        deathSaves: { successes: 0, failures: 0 },
        isStable: false,
        isDead: false,
      }));

      const activeEncounter: Encounter = {
        ...encounter,
        participants: participantsWithInitiative,
        currentRound: 1,
        currentTurnIndex: 0,
        isActive: true,
      };

      setCurrentEncounter(activeEncounter);
      setEncounters(prev =>
        prev.map(e => (e.id === encounterId ? activeEncounter : e))
      );
    }
  };

  const endEncounter = async () => {
    if (currentEncounter) {
      try {
        await fetch(`/api/encounters/${currentEncounter.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: false }),
        });

        const updatedEncounter = { ...currentEncounter, isActive: false };
        setEncounters(prev =>
          prev.map(e => (e.id === currentEncounter.id ? updatedEncounter : e))
        );
        setCurrentEncounter(null);
      } catch (error) {
        console.error('Error ending encounter:', error);
      }
    }
  };

  const endEncounterAndSave = async () => {
    if (currentEncounter) {
      try {
        // Mettre à jour les PV de chaque personnage dans la base de données
        await Promise.all(
          currentEncounter.participants.map(participant =>
            fetch(`/api/characters/${participant.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                hitPoints: participant.hitPoints,
              }),
            })
          )
        );

        // Mettre à jour l'état local
        currentEncounter.participants.forEach(participant => {
          setCharacters(prev =>
            prev.map(c =>
              c.id === participant.id
                ? { ...c, hitPoints: participant.hitPoints }
                : c
            )
          );
        });

        // Fermer la rencontre
        await fetch(`/api/encounters/${currentEncounter.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: false }),
        });

        const updatedEncounter = { ...currentEncounter, isActive: false };
        setEncounters(prev =>
          prev.map(e => (e.id === currentEncounter.id ? updatedEncounter : e))
        );
        setCurrentEncounter(null);
      } catch (error) {
        console.error('Error saving encounter:', error);
      }
    }
  };

  const nextTurn = async () => {
    if (!currentEncounter) return;

    let nextIndex = currentEncounter.currentTurnIndex + 1;
    let nextRound = currentEncounter.currentRound;

    if (nextIndex >= currentEncounter.participants.length) {
      nextIndex = 0;
      nextRound += 1;
    }

    try {
      await fetch(`/api/encounters/${currentEncounter.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentTurnIndex: nextIndex,
          currentRound: nextRound,
        }),
      });

      const updatedEncounter = {
        ...currentEncounter,
        currentTurnIndex: nextIndex,
        currentRound: nextRound,
      };

      setCurrentEncounter(updatedEncounter);
      setEncounters(prev =>
        prev.map(e => (e.id === currentEncounter.id ? updatedEncounter : e))
      );
    } catch (error) {
      console.error('Error advancing turn:', error);
    }
  };

  const updateParticipant = async (
    participantId: string,
    updates: Partial<EncounterParticipant>
  ) => {
    if (!currentEncounter) return;

    try {
      await fetch(
        `/api/encounters/${currentEncounter.id}/participants/${participantId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }
      );

      const updatedParticipants = currentEncounter.participants.map(p =>
        p.id === participantId ? { ...p, ...updates } : p
      );

      const updatedEncounter = {
        ...currentEncounter,
        participants: updatedParticipants,
      };

      setCurrentEncounter(updatedEncounter);
      setEncounters(prev =>
        prev.map(e => (e.id === currentEncounter.id ? updatedEncounter : e))
      );
    } catch (error) {
      console.error('Error updating participant:', error);
    }
  };

  const addParticipantToEncounter = (characterId: string) => {
    if (!currentEncounter) return;

    const character = characters.find(c => c.id === characterId);
    if (!character) return;

    const newParticipant: EncounterParticipant = {
      ...character,
      initiative: rollInitiative(character.initiativeBonus),
      hasActed: false,
      deathSaves: { successes: 0, failures: 0 },
      isStable: false,
      isDead: false,
    };

    const updatedParticipants = [...currentEncounter.participants, newParticipant];
    updatedParticipants.sort((a, b) => b.initiative - a.initiative);

    const updatedEncounter = {
      ...currentEncounter,
      participants: updatedParticipants,
    };

    setCurrentEncounter(updatedEncounter);
    setEncounters(prev =>
      prev.map(e => (e.id === currentEncounter.id ? updatedEncounter : e))
    );
  };

  const removeParticipantFromEncounter = (participantId: string) => {
    if (!currentEncounter) return;

    const updatedParticipants = currentEncounter.participants.filter(
      p => p.id !== participantId
    );

    const updatedEncounter = {
      ...currentEncounter,
      participants: updatedParticipants,
    };

    setCurrentEncounter(updatedEncounter);
    setEncounters(prev =>
      prev.map(e => (e.id === currentEncounter.id ? updatedEncounter : e))
    );
  };

  const rollInitiatives = () => {
    if (!currentEncounter) return;

    const participantsWithInitiative = currentEncounter.participants.map(p => ({
      ...p,
      initiative: rollInitiative(p.initiativeBonus),
    }));

    participantsWithInitiative.sort((a, b) => b.initiative - a.initiative);

    const updatedEncounter = {
      ...currentEncounter,
      participants: participantsWithInitiative,
      currentTurnIndex: 0,
    };

    setCurrentEncounter(updatedEncounter);
    setEncounters(prev =>
      prev.map(e => (e.id === currentEncounter.id ? updatedEncounter : e))
    );
  };

  const sortInitiatives = () => {
    if (!currentEncounter) return;

    const sortedParticipants = [...currentEncounter.participants].sort(
      (a, b) => b.initiative - a.initiative
    );

    const updatedEncounter = {
      ...currentEncounter,
      participants: sortedParticipants,
    };

    setCurrentEncounter(updatedEncounter);
    setEncounters(prev =>
      prev.map(e => (e.id === currentEncounter.id ? updatedEncounter : e))
    );
  };

  const updateInitiativeAndSort = (participantId: string, initiative: number) => {
    if (!currentEncounter) return;

    // Mettre à jour l'initiative du participant
    const updatedParticipants = currentEncounter.participants.map(p =>
      p.id === participantId ? { ...p, initiative } : p
    );

    // Trier par initiative décroissante
    updatedParticipants.sort((a, b) => b.initiative - a.initiative);

    const updatedEncounter = {
      ...currentEncounter,
      participants: updatedParticipants,
    };

    setCurrentEncounter(updatedEncounter);
    setEncounters(prev =>
      prev.map(e => (e.id === currentEncounter.id ? updatedEncounter : e))
    );
  };

  const updateDeathSaves = (participantId: string, type: 'success' | 'failure', value: number) => {
    if (!currentEncounter) return;

    const participant = currentEncounter.participants.find(p => p.id === participantId);
    if (!participant) return;

    let newSuccesses = participant.deathSaves.successes;
    let newFailures = participant.deathSaves.failures;
    let newIsStable = participant.isStable;
    let newIsDead = participant.isDead;

    if (type === 'success') {
      newSuccesses = Math.max(0, Math.min(3, value));
      // Si 3 succès, devient stable
      if (newSuccesses >= 3) {
        newIsStable = true;
        newSuccesses = 0;
        newFailures = 0;
      }
    } else {
      newFailures = Math.max(0, Math.min(3, value));
      // Si 3 échecs, meurt
      if (newFailures >= 3) {
        newIsDead = true;
        newSuccesses = 0;
        newFailures = 0;
      }
    }

    updateParticipant(participantId, {
      deathSaves: { successes: newSuccesses, failures: newFailures },
      isStable: newIsStable,
      isDead: newIsDead,
    });
  };

  const value: GameContextType = {
    characters,
    encounters,
    currentEncounter,
    isLoading,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    createEncounter,
    deleteEncounter,
    startEncounter,
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
    refreshData,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
