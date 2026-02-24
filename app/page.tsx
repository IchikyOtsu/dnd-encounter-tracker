'use client';

import Link from 'next/link';
import Header from '@/components/Header';

export default function Home() {
  const tools = [
    {
      id: 'encounter-tracker',
      title: 'Encounter Tracker',
      description: 'Gérez vos personnages, créez des rencontres et suivez l\'initiative en combat',
      href: '/encounter-tracker',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      available: true,
    },
    {
      id: 'spell-manager',
      title: 'Spell Manager',
      description: 'Gérez et recherchez des sorts D&D 5e avec filtres avancés',
      href: '#',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600',
      available: false,
    },
    {
      id: 'loot-generator',
      title: 'Loot Generator',
      description: 'Générez du butin aléatoire basé sur le CR et le type de créature',
      href: '#',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'from-yellow-500 to-yellow-600',
      available: false,
    },
    {
      id: 'dice-roller',
      title: 'Dice Roller',
      description: 'Lanceur de dés avancé avec historique et macro enregistrables',
      href: '#',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
        </svg>
      ),
      color: 'from-green-500 to-green-600',
      available: false,
    },
    {
      id: 'npc-generator',
      title: 'NPC Generator',
      description: 'Créez rapidement des PNJ avec personnalité, motivations et background',
      href: '#',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'from-red-500 to-red-600',
      available: false,
    },
    {
      id: 'session-notes',
      title: 'Session Notes',
      description: 'Prenez des notes de session avec organisation par campagne',
      href: '#',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: 'from-indigo-500 to-indigo-600',
      available: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Multi-Outils D&D 5e
            </h1>
            <p className="text-lg text-gray-600">
              Tous vos outils de jeu de rôle en un seul endroit
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.available ? tool.href : '#'}
              className={`group relative bg-white rounded-xl border-2 border-gray-200 overflow-hidden transition-all duration-300 ${
                tool.available
                  ? 'hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                  : 'opacity-60 cursor-not-allowed'
              }`}
              onClick={(e) => {
                if (!tool.available) {
                  e.preventDefault();
                }
              }}
            >
              {/* Icon Background */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${tool.color} opacity-5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110`}></div>
              
              {/* Content */}
              <div className="relative p-6">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${tool.color} text-white mb-4 transition-transform group-hover:scale-110`}>
                  {tool.icon}
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {tool.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  {tool.description}
                </p>
                
                {tool.available ? (
                  <div className="flex items-center text-blue-600 font-medium text-sm">
                    <span>Accéder</span>
                    <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                    Bientôt disponible
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-gray-800 text-gray-300 py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm mb-2">
            Multi-Outils D&D 5e • Built with Next.js & TypeScript
          </p>
          <p className="text-xs text-gray-400">
            Un ensemble d'outils pour améliorer vos sessions de jeu de rôle
          </p>
        </div>
      </footer>
    </div>
  );
}
