'use client';

import { useState } from 'react';
import { ActionType, DamageType, ResultType, FlavorText } from '@/types/dnd';

export default function FlavorTextGenerator() {
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [damageType, setDamageType] = useState<DamageType | null>(null);
  const [resultType, setResultType] = useState<ResultType | null>(null);
  const [generatedText, setGeneratedText] = useState<string>('');
  const [weaponName, setWeaponName] = useState<string>('');
  const [targetName, setTargetName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const actionTypes: { type: ActionType; icon: string; label: string }[] = [
    { type: 'CàC', icon: '⚔️', label: 'Corps à Corps' },
    { type: 'Distance', icon: '🏹', label: 'Distance' },
    { type: 'Sort', icon: '✨', label: 'Sort' },
    { type: 'Zone', icon: '💥', label: 'Zone' },
  ];

  const damageTypes: { type: DamageType; icon: string; label: string }[] = [
    { type: 'Tranchant', icon: '🗡️', label: 'Tranchant' },
    { type: 'Contondant', icon: '🔨', label: 'Contondant' },
    { type: 'Perforant', icon: '🔱', label: 'Perforant' },
    { type: 'Feu', icon: '🔥', label: 'Feu' },
    { type: 'Froid', icon: '❄️', label: 'Froid' },
    { type: 'Foudre', icon: '⚡', label: 'Foudre' },
    { type: 'Acide', icon: '🧪', label: 'Acide' },
    { type: 'Poison', icon: '☠️', label: 'Poison' },
    { type: 'Nécrotique', icon: '💀', label: 'Nécrotique' },
    { type: 'Radiant', icon: '✨', label: 'Radiant' },
    { type: 'Psychique', icon: '🧠', label: 'Psychique' },
    { type: 'Force', icon: '💫', label: 'Force' },
    { type: 'Tonnerre', icon: '🔊', label: 'Tonnerre' },
  ];

  const resultTypes: { type: ResultType; icon: string; label: string; color: string }[] = [
    { type: 'Échec', icon: '❌', label: 'Raté', color: 'bg-red-500 hover:bg-red-600' },
    { type: 'Réussite', icon: '✅', label: 'Touché', color: 'bg-green-500 hover:bg-green-600' },
    { type: 'Critique', icon: '💀', label: 'Critique', color: 'bg-purple-500 hover:bg-purple-600' },
  ];

  const generateFlavorText = async (result: ResultType) => {
    if (!actionType || !damageType) return;

    setResultType(result);
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/flavor-texts?actionType=${actionType}&damageType=${damageType}&resultType=${result}`
      );

      if (response.ok) {
        const flavorTexts: FlavorText[] = await response.json();
        
        if (flavorTexts.length > 0) {
          // Choisir aléatoirement une description
          const randomIndex = Math.floor(Math.random() * flavorTexts.length);
          let text = flavorTexts[randomIndex].description;

          // Remplacer les variables {arme} et {cible}
          const weapon = weaponName.trim() || 'arme';
          const target = targetName.trim() || 'adversaire';
          
          text = text.replace(/\{arme\}/gi, weapon);
          text = text.replace(/\{cible\}/gi, target);
          text = text.replace(/\{Cible\}/g, target.charAt(0).toUpperCase() + target.slice(1));

          setGeneratedText(text);
        } else {
          setGeneratedText('Aucune description trouvée pour cette combinaison.');
        }
      }
    } catch (error) {
      console.error('Error generating flavor text:', error);
      setGeneratedText('Erreur lors de la génération du texte.');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setActionType(null);
    setDamageType(null);
    setResultType(null);
    setGeneratedText('');
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-purple-900">🎭 Générateur de Narration</h3>
        {(actionType || damageType || resultType || generatedText) && (
          <button
            onClick={reset}
            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Champs de personnalisation */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div>
          <label className="text-xs font-semibold text-purple-700 mb-1 block">Arme (optionnel)</label>
          <input
            type="text"
            value={weaponName}
            onChange={(e) => setWeaponName(e.target.value)}
            placeholder="ex: Épée longue"
            className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-purple-700 mb-1 block">Cible (optionnel)</label>
          <input
            type="text"
            value={targetName}
            onChange={(e) => setTargetName(e.target.value)}
            placeholder="ex: Gobelin"
            className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Étape 1: Type d'action */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-purple-800 mb-3">1. Type d'attaque</h4>
        <div className="grid grid-cols-4 gap-2">
          {actionTypes.map((action) => (
            <button
              key={action.type}
              onClick={() => {
                setActionType(action.type);
                setDamageType(null);
                setResultType(null);
                setGeneratedText('');
              }}
              className={`p-3 rounded-lg border-2 transition-all text-center ${
                actionType === action.type
                  ? 'border-purple-500 bg-purple-100 shadow-md scale-105'
                  : 'border-purple-200 bg-white hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <div className="text-2xl mb-1">{action.icon}</div>
              <div className="text-xs font-semibold text-purple-900">{action.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Étape 2: Type de dégâts */}
      {actionType && (
        <div className="mb-6">
          <h4 className="text-sm font-bold text-purple-800 mb-3">2. Type de dégâts</h4>
          <div className="grid grid-cols-5 gap-2">
            {damageTypes.map((damage) => (
              <button
                key={damage.type}
                onClick={() => {
                  setDamageType(damage.type);
                  setResultType(null);
                  setGeneratedText('');
                }}
                className={`p-2 rounded-lg border-2 transition-all text-center ${
                  damageType === damage.type
                    ? 'border-purple-500 bg-purple-100 shadow-md scale-105'
                    : 'border-purple-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <div className="text-xl mb-1">{damage.icon}</div>
                <div className="text-xs font-semibold text-purple-900">{damage.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Étape 3: Résultat */}
      {actionType && damageType && (
        <div className="mb-6">
          <h4 className="text-sm font-bold text-purple-800 mb-3">3. Résultat</h4>
          <div className="grid grid-cols-3 gap-3">
            {resultTypes.map((result) => (
              <button
                key={result.type}
                onClick={() => generateFlavorText(result.type)}
                disabled={isLoading}
                className={`p-4 rounded-lg text-white font-bold transition-all ${result.color} ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'shadow-md hover:shadow-lg'
                }`}
              >
                <div className="text-3xl mb-2">{result.icon}</div>
                <div>{result.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Texte généré */}
      {generatedText && (
        <div className="mt-6 p-6 bg-white border-2 border-purple-300 rounded-lg shadow-inner">
          <div className="flex items-start gap-3">
            <div className="text-3xl">📜</div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-purple-700 mb-2">Description générée :</div>
              <p className="text-lg text-gray-800 leading-relaxed italic">&ldquo;{generatedText}&rdquo;</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedText);
              }}
              className="text-purple-600 hover:text-purple-800 p-2 hover:bg-purple-50 rounded transition-colors"
              title="Copier"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Aide */}
      {!actionType && !damageType && !resultType && !generatedText && (
        <div className="mt-4 p-4 bg-purple-100 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-800">
            <strong>💡 Comment utiliser :</strong> Sélectionnez le type d'attaque, le type de dégâts, puis le résultat pour générer une description narrative épique !
          </p>
        </div>
      )}
    </div>
  );
}
