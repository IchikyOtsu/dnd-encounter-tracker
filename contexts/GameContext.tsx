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
  nextTurn: () => void;
  updateParticipant: (participantId: string, updates: Partial<EncounterParticipant>) => void;
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

  // Load data from localStorage on mount
  useEffect(() => {
    const savedCharacters = localStorage.getItem('dnd-characters');
    const savedEncounters = localStorage.getItem('dnd-encounters');
    const savedCurrentEncounter = localStorage.getItem('dnd-current-encounter');

    if (savedCharacters) {
      setCharacters(JSON.parse(savedCharacters));
    }
    if (savedEncounters) {
      setEncounters(JSON.parse(savedEncounters));
    }
    if (savedCurrentEncounter) {
      setCurrentEncounter(JSON.parse(savedCurrentEncounter));
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
    nextTurn,
    updateParticipant,
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
