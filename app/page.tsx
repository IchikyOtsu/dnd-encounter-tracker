'use client';

import { useState } from 'react';
import CharacterForm from '@/components/CharacterForm';
import CharacterList from '@/components/CharacterList';
import EncounterManager from '@/components/EncounterManager';
import InitiativeTracker from '@/components/InitiativeTracker';
import { useGame } from '@/contexts/GameContext';

type Tab = 'characters' | 'encounters' | 'tracker';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('characters');
  const { currentEncounter } = useGame();

  // Auto-switch to tracker when encounter starts
  if (currentEncounter && activeTab !== 'tracker') {
    setActiveTab('tracker');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold mb-2">🎲 D&D 5e Encounter Tracker</h1>
          <p className="text-indigo-100">
            Manage characters, create encounters, and track initiative
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4">
          <nav className="flex gap-1">
            <button
              onClick={() => setActiveTab('characters')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'characters'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📋 Characters
            </button>
            <button
              onClick={() => setActiveTab('encounters')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'encounters'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              ⚔️ Encounters
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`px-6 py-4 font-semibold transition-colors relative ${
                activeTab === 'tracker'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🎯 Initiative Tracker
              {currentEncounter && (
                <span className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'characters' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Character Management</h2>
              <CharacterForm />
            </div>
            <CharacterList />
          </div>
        )}

        {activeTab === 'encounters' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Encounter Management</h2>
            <EncounterManager />
          </div>
        )}

        {activeTab === 'tracker' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Initiative Tracker</h2>
            <InitiativeTracker />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-gray-800 text-gray-300 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            D&D 5e Encounter Tracker • Built with Next.js & TypeScript
          </p>
        </div>
      </footer>
    </div>
  );
}
