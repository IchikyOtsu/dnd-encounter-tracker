'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Character, Encounter, EncounterParticipant, rollInitiative } from '@/types/dnd';

interface GameContextType {
  characters: Character[];
  encounters: Encounter[];
  currentEncounter: Encounter | null;
  addCharacter: (character: Character) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  createEncounter: (name: string, characterIds: string[]) => void;
  deleteEncounter: (encounterId: string) => void;
  startEncounter: (encounterId: string) => void;
  endEncounter: () => void;
  endEncounterAndSave: () => void;
  nextTurn: () => void;
  updateParticipant: (participantId: string, updates: Partial<EncounterParticipant>) => void;
  updateInitiativeAndSort: (participantId: string, initiative: number) => void;
  updateDeathSaves: (participantId: string, type: 'success' | 'failure', value: number) => void;
  addParticipantToEncounter: (characterId: string) => void;
  removeParticipantFromEncounter: (participantId: string) => void;
  rollInitiatives: () => void;
  sortInitiatives: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [currentEncounter, setCurrentEncounter] = useState<Encounter | null>(null);

  // Fonction pour normaliser les participants (ajouter les champs manquants)
  const normalizeParticipant = (participant: any): EncounterParticipant => {
    return {
      ...participant,
      deathSaves: participant.deathSaves || { successes: 0, failures: 0 },
      isStable: participant.isStable ?? false,
      isDead: participant.isDead ?? false,
    };
  };

  // Load data from localStorage on mount
  useEffect(() => {
    const savedCharacters = localStorage.getItem('dnd-characters');
    const savedEncounters = localStorage.getItem('dnd-encounters');
    const savedCurrentEncounter = localStorage.getItem('dnd-current-encounter');

    if (savedCharacters) {
      setCharacters(JSON.parse(savedCharacters));
    }
    if (savedEncounters) {
      const loadedEncounters = JSON.parse(savedEncounters);
      // Normaliser les participants dans chaque encounter
      const normalizedEncounters = loadedEncounters.map((enc: Encounter) => ({
        ...enc,
        participants: enc.participants.map(normalizeParticipant),
      }));
      setEncounters(normalizedEncounters);
    }
    if (savedCurrentEncounter) {
      const loadedEncounter = JSON.parse(savedCurrentEncounter);
      // Normaliser les participants
      setCurrentEncounter({
        ...loadedEncounter,
        participants: loadedEncounter.participants.map(normalizeParticipant),
      });
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('dnd-characters', JSON.stringify(characters));
  }, [characters]);

  useEffect(() => {
    localStorage.setItem('dnd-encounters', JSON.stringify(encounters));
  }, [encounters]);

  useEffect(() => {
    if (currentEncounter) {
      localStorage.setItem('dnd-current-encounter', JSON.stringify(currentEncounter));
    } else {
      localStorage.removeItem('dnd-current-encounter');
    }
  }, [currentEncounter]);

  const addCharacter = (character: Character) => {
    setCharacters(prev => [...prev, character]);
  };

  const updateCharacter = (id: string, updates: Partial<Character>) => {
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
  };

  const deleteCharacter = (id: string) => {
    setCharacters(prev => prev.filter(char => char.id !== id));
  };

  const createEncounter = (name: string, characterIds: string[]) => {
    const selectedChars = characters.filter(c => characterIds.includes(c.id));
    const participants: EncounterParticipant[] = selectedChars.map(char => ({
      ...char,
      initiative: 0,
      hasActed: false,
      deathSaves: { successes: 0, failures: 0 },
      isStable: false,
      isDead: false,
    }));

    const newEncounter: Encounter = {
      id: Date.now().toString(),
      name,
      participants,
      currentRound: 1,
      currentTurnIndex: 0,
      isActive: false,
      createdAt: new Date(),
    };

    setEncounters(prev => [...prev, newEncounter]);
  };

  const deleteEncounter = (encounterId: string) => {
    // If we're deleting the current active encounter, end it first
    if (currentEncounter && currentEncounter.id === encounterId) {
      setCurrentEncounter(null);
    }
    setEncounters(prev => prev.filter(e => e.id !== encounterId));
  };

  const startEncounter = (encounterId: string) => {
    const encounter = encounters.find(e => e.id === encounterId);
    if (encounter) {
      // Initialize participants without rolling initiative (set to 0)
      const participantsWithInitiative = encounter.participants.map(p => ({
        ...p,
        initiative: 0, // Start with no initiative
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

  const endEncounter = () => {
    if (currentEncounter) {
      const updatedEncounter = { ...currentEncounter, isActive: false };
      setEncounters(prev =>
        prev.map(e => (e.id === currentEncounter.id ? updatedEncounter : e))
      );
      setCurrentEncounter(null);
    }
  };

  const endEncounterAndSave = () => {
    if (currentEncounter) {
      // Mettre à jour les PV de chaque personnage dans la liste principale
      currentEncounter.participants.forEach(participant => {
        const characterIndex = characters.findIndex(c => c.id === participant.id);
        if (characterIndex !== -1) {
          setCharacters(prev => {
            const updated = [...prev];
            updated[characterIndex] = {
              ...updated[characterIndex],
              hitPoints: {
                ...participant.hitPoints,
              },
            };
            return updated;
          });
        }
      });

      // Fermer la rencontre
      const updatedEncounter = { ...currentEncounter, isActive: false };
      setEncounters(prev =>
        prev.map(e => (e.id === currentEncounter.id ? updatedEncounter : e))
      );
      setCurrentEncounter(null);
    }
  };

  const nextTurn = () => {
    if (!currentEncounter) return;

    let nextIndex = currentEncounter.currentTurnIndex + 1;
    let nextRound = currentEncounter.currentRound;

    if (nextIndex >= currentEncounter.participants.length) {
      nextIndex = 0;
      nextRound += 1;
    }

    const updatedEncounter = {
      ...currentEncounter,
      currentTurnIndex: nextIndex,
      currentRound: nextRound,
    };

    setCurrentEncounter(updatedEncounter);
    setEncounters(prev =>
      prev.map(e => (e.id === currentEncounter.id ? updatedEncounter : e))
    );
  };

  const updateParticipant = (participantId: string, updates: Partial<EncounterParticipant>) => {
    if (!currentEncounter) return;

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
