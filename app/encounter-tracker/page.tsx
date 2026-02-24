'use client';

import { useState } from 'react';
import Link from 'next/link';
import CharacterForm from '@/components/CharacterForm';
import CharacterList from '@/components/CharacterList';
import EncounterManager from '@/components/EncounterManager';
import InitiativeTracker from '@/components/InitiativeTracker';
import { useGame } from '@/contexts/GameContext';

type Tab = 'characters' | 'encounters' | 'tracker';

export default function EncounterTrackerPage() {
  const [activeTab, setActiveTab] = useState<Tab>('characters');
  const { currentEncounter } = useGame();

  // Auto-switch to tracker when encounter starts
  if (currentEncounter && activeTab !== 'tracker') {
    setActiveTab('tracker');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              title="Retour à l'accueil"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">D&D 5e Encounter Tracker</h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Gestion de personnages et suivi des combats
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <nav className="flex gap-2">
            <button
              onClick={() => setActiveTab('characters')}
              className={`px-5 py-3 font-medium transition-all relative flex items-center gap-2 ${
                activeTab === 'characters'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Personnages
            </button>
            <button
              onClick={() => setActiveTab('encounters')}
              className={`px-5 py-3 font-medium transition-all relative flex items-center gap-2 ${
                activeTab === 'encounters'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Rencontres
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`px-5 py-3 font-medium transition-all relative flex items-center gap-2 ${
                activeTab === 'tracker'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Initiative
              {currentEncounter && (
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        {activeTab === 'characters' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Gestion des Personnages</h2>
              <CharacterForm />
            </div>
            <CharacterList />
          </div>
        )}

        {activeTab === 'encounters' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Gestion des Rencontres</h2>
            <EncounterManager />
          </div>
        )}

        {activeTab === 'tracker' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Suivi d'Initiative</h2>
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
