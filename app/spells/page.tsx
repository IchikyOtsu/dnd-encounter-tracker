'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import SpellManager from '@/components/SpellManager';

export default function SpellsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestionnaire de Sorts
          </h1>
          <p className="text-gray-600">
            Parcourez et recherchez tous les sorts D&D 5e avec filtres par niveau, école et classe
          </p>
        </div>

        <SpellManager />
      </div>
    </div>
  );
}
