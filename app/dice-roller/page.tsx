'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { DiceRoll, DiceMacro } from '@/types/dice';

export default function DiceRollerPage() {
  const [formula, setFormula] = useState('');
  const [label, setLabel] = useState('');
  const [rolls, setRolls] = useState<DiceRoll[]>([]);
  const [macros, setMacros] = useState<DiceMacro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMacroForm, setShowMacroForm] = useState(false);
  const [newMacro, setNewMacro] = useState({
    name: '',
    formula: '',
    description: '',
    color: '#3b82f6',
  });

  // Charger les données
  const loadData = async () => {
    try {
      const [rollsRes, macrosRes] = await Promise.all([
        fetch('/api/rolls'),
        fetch('/api/macros'),
      ]);

      if (rollsRes.ok) {
        const rollsData = await rollsRes.json();
        setRolls(rollsData);
      }

      if (macrosRes.ok) {
        const macrosData = await macrosRes.json();
        setMacros(macrosData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Lancer un dé
  const handleRoll = async (diceFormula: string, diceLabel?: string) => {
    if (!diceFormula.trim()) return;

    try {
      const res = await fetch('/api/rolls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formula: diceFormula, label: diceLabel }),
      });

      if (res.ok) {
        const newRoll = await res.json();
        setRolls(prev => [newRoll, ...prev]);
        setFormula('');
        setLabel('');
      } else {
        const error = await res.json();
        alert(error.error || 'Erreur lors du lancer de dés');
      }
    } catch (error) {
      console.error('Error rolling dice:', error);
      alert('Erreur lors du lancer de dés');
    }
  };

  // Créer une macro
  const handleCreateMacro = async () => {
    if (!newMacro.name.trim() || !newMacro.formula.trim()) return;

    try {
      const res = await fetch('/api/macros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMacro),
      });

      if (res.ok) {
        const macro = await res.json();
        setMacros(prev => [macro, ...prev]);
        setNewMacro({ name: '', formula: '', description: '', color: '#3b82f6' });
        setShowMacroForm(false);
      }
    } catch (error) {
      console.error('Error creating macro:', error);
    }
  };

  // Supprimer une macro
  const handleDeleteMacro = async (id: string) => {
    if (!confirm('Supprimer cette macro ?')) return;

    try {
      const res = await fetch(`/api/macros/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMacros(prev => prev.filter(m => m.id !== id));
      }
    } catch (error) {
      console.error('Error deleting macro:', error);
    }
  };

  // Effacer l'historique
  const handleClearHistory = async () => {
    if (!confirm('Effacer tout l\'historique ?')) return;

    try {
      const res = await fetch('/api/rolls', {
        method: 'DELETE',
      });

      if (res.ok) {
        setRolls([]);
      }
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  // Boutons rapides
  const quickRolls = [
    { label: 'd4', formula: '1d4' },
    { label: 'd6', formula: '1d6' },
    { label: 'd8', formula: '1d8' },
    { label: 'd10', formula: '1d10' },
    { label: 'd12', formula: '1d12' },
    { label: 'd20', formula: '1d20' },
    { label: 'd100', formula: '1d100' },
  ];

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6',
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Sub-header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-3">
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
              <h2 className="text-xl font-semibold text-gray-900">Dice Roller</h2>
              <p className="text-xs text-gray-600">Lancez vos dés et gérez vos macros</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche - Lanceur de dés */}
          <div className="lg:col-span-2 space-y-6">
            {/* Zone de saisie */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lancer des dés</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formule (ex: 2d6+3, 1d20, 4d8-2)
                  </label>
                  <input
                    type="text"
                    value={formula}
                    onChange={(e) => setFormula(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleRoll(formula, label)}
                    placeholder="1d20+5"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Label (optionnel)
                  </label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleRoll(formula, label)}
                    placeholder="Attaque épée longue"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={() => handleRoll(formula, label)}
                  disabled={!formula.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                  Lancer
                </button>
              </div>

              {/* Dés rapides */}
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Dés rapides :</p>
                <div className="flex flex-wrap gap-2">
                  {quickRolls.map((quick) => (
                    <button
                      key={quick.formula}
                      onClick={() => handleRoll(quick.formula)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors border border-gray-300"
                    >
                      {quick.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Historique */}
            <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Historique</h3>
                {rolls.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Effacer
                  </button>
                )}
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                {rolls.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    Aucun lancer pour le moment
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {rolls.map((roll) => (
                      <div key={roll.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {roll.label && (
                              <div className="text-sm font-medium text-gray-900 mb-1">
                                {roll.label}
                              </div>
                            )}
                            <div className="text-sm text-gray-600 font-mono">
                              {roll.formula}
                            </div>
                            {roll.details && (
                              <div className="text-xs text-gray-500 mt-1">
                                {roll.details}
                              </div>
                            )}
                          </div>
                          <div className="ml-4 flex flex-col items-end">
                            <div className="text-3xl font-bold text-blue-600">
                              {roll.result}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(roll.createdAt).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Colonne droite - Macros */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Macros</h3>
                <button
                  onClick={() => setShowMacroForm(!showMacroForm)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  {showMacroForm ? 'Annuler' : '+ Nouvelle'}
                </button>
              </div>

              {/* Formulaire nouvelle macro */}
              {showMacroForm && (
                <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-3">
                  <input
                    type="text"
                    value={newMacro.name}
                    onChange={(e) => setNewMacro({ ...newMacro, name: e.target.value })}
                    placeholder="Nom de la macro"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={newMacro.formula}
                    onChange={(e) => setNewMacro({ ...newMacro, formula: e.target.value })}
                    placeholder="Formule (1d20+5)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                  <input
                    type="text"
                    value={newMacro.description}
                    onChange={(e) => setNewMacro({ ...newMacro, description: e.target.value })}
                    placeholder="Description (optionnel)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <div className="flex gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewMacro({ ...newMacro, color })}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newMacro.color === color ? 'border-gray-900' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleCreateMacro}
                    disabled={!newMacro.name.trim() || !newMacro.formula.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg text-sm"
                  >
                    Créer la macro
                  </button>
                </div>
              )}

              <div className="p-4 space-y-2 max-h-[700px] overflow-y-auto">
                {macros.length === 0 ? (
                  <div className="text-center text-gray-500 py-8 text-sm">
                    Aucune macro enregistrée
                  </div>
                ) : (
                  macros.map((macro) => (
                    <div
                      key={macro.id}
                      className="p-3 rounded-lg border-2 hover:border-gray-300 transition-colors group"
                      style={{ borderColor: macro.color + '40', backgroundColor: macro.color + '08' }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-sm">
                            {macro.name}
                          </div>
                          <div className="text-xs font-mono text-gray-600 mt-1">
                            {macro.formula}
                          </div>
                          {macro.description && (
                            <div className="text-xs text-gray-500 mt-1">
                              {macro.description}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteMacro(macro.id)}
                          className="text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <button
                        onClick={() => handleRoll(macro.formula, macro.name)}
                        className="w-full py-2 px-3 rounded-lg font-medium text-sm text-white transition-colors"
                        style={{ backgroundColor: macro.color }}
                      >
                        Lancer
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
