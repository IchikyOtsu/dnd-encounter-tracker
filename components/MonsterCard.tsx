'use client';

import { Character, calculateModifier, formatCR, getXPFromCR, getProficiencyFromCR } from '@/types/dnd';

interface MonsterCardProps {
  monster: Character;
  onEdit: () => void;
  onDelete: () => void;
}

export default function MonsterCard({ monster, onEdit, onDelete }: MonsterCardProps) {
  const stats = monster.monsterStats;
  const profBonus = stats?.challengeRating ? getProficiencyFromCR(stats.challengeRating) : monster.proficiencyBonus || 2;
  const xp = stats?.challengeRating ? getXPFromCR(stats.challengeRating) : 0;
  const cr = stats?.challengeRating ? formatCR(stats.challengeRating) : '?';

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border-2 border-red-200 p-5 shadow-sm hover:shadow-md transition-all">
      {/* Header */}
      <div className="border-b-2 border-red-900 pb-3 mb-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-red-900">{monster.name}</h3>
            {stats?.size && stats?.creatureType && (
              <p className="text-xs italic text-red-700 mt-0.5">
                {stats.size} {stats.creatureType}
                {stats.alignment && `, ${stats.alignment}`}
              </p>
            )}
          </div>
          <div className="flex gap-1">
            <button
              onClick={onEdit}
              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
              title="Modifier"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
              title="Supprimer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Core Stats */}
        <div className="space-y-1 text-xs text-red-900">
          <div className="flex items-baseline">
            <span className="font-bold min-w-[120px]">Classe d'Armure</span>
            <span>{monster.armorClass}</span>
          </div>
          <div className="flex items-baseline">
            <span className="font-bold min-w-[120px]">Points de Vie</span>
            <span className="font-semibold text-red-700">
              {monster.hitPoints.current}/{monster.hitPoints.max}
            </span>
          </div>
          <div className="flex items-baseline">
            <span className="font-bold min-w-[120px]">Vitesse</span>
            <span>{monster.speed || 9} m</span>
          </div>
        </div>
      </div>

      {/* Ability Scores */}
      <div className="border-b-2 border-red-900 pb-3 mb-4">
        <div className="grid grid-cols-6 gap-2 text-center">
          {Object.entries(monster.abilities).map(([ability, score]) => (
            <div key={ability} className="bg-white border border-red-200 rounded p-1.5">
              <div className="text-xs font-bold text-red-900">{ability}</div>
              <div className="text-sm font-semibold text-red-700">{score}</div>
              <div className="text-xs text-red-600">
                ({calculateModifier(score) >= 0 ? '+' : ''}{calculateModifier(score)})
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Extra Info */}
      <div className="space-y-1 text-xs text-red-900 border-b-2 border-red-900 pb-3 mb-4">
        {stats?.damageImmunities && (
          <div className="flex items-baseline">
            <span className="font-bold min-w-[140px]">Immunités (dégâts)</span>
            <span>{stats.damageImmunities}</span>
          </div>
        )}
        {stats?.damageResistances && (
          <div className="flex items-baseline">
            <span className="font-bold min-w-[140px]">Résistances</span>
            <span>{stats.damageResistances}</span>
          </div>
        )}
        {stats?.damageVulnerabilities && (
          <div className="flex items-baseline">
            <span className="font-bold min-w-[140px]">Vulnérabilités</span>
            <span>{stats.damageVulnerabilities}</span>
          </div>
        )}
        {stats?.conditionImmunities && (
          <div className="flex items-baseline">
            <span className="font-bold min-w-[140px]">Immunités (états)</span>
            <span>{stats.conditionImmunities}</span>
          </div>
        )}
        {stats?.senses && (
          <div className="flex items-baseline">
            <span className="font-bold min-w-[140px]">Sens</span>
            <span>{stats.senses}</span>
          </div>
        )}
        {stats?.languages && (
          <div className="flex items-baseline">
            <span className="font-bold min-w-[140px]">Langues</span>
            <span>{stats.languages}</span>
          </div>
        )}
        <div className="flex items-baseline">
          <span className="font-bold min-w-[140px]">Challenge</span>
          <span>
            {cr} ({xp.toLocaleString()} XP) 
            <span className="ml-2 text-red-700">• Bonus de maîtrise +{profBonus}</span>
          </span>
        </div>
      </div>

      {/* Special Traits */}
      {stats?.specialTraits && stats.specialTraits.length > 0 && (
        <div className="mb-4">
          {stats.specialTraits.map((trait, index) => (
            <div key={index} className="mb-2">
              <div className="text-xs">
                <span className="font-bold text-red-900 italic">{trait.name}. </span>
                <span className="text-red-800">{trait.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {stats?.actions && stats.actions.length > 0 && (
        <div className="border-t-2 border-red-900 pt-3 mb-4">
          <h4 className="text-sm font-bold text-red-900 mb-2">Actions</h4>
          {stats.actions.map((action, index) => (
            <div key={index} className="mb-2">
              <div className="text-xs">
                <span className="font-bold text-red-900 italic">{action.name}. </span>
                <span className="text-red-800">{action.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legendary Actions */}
      {stats?.legendaryActions && stats.legendaryActions.length > 0 && (
        <div className="border-t-2 border-red-900 pt-3 mb-4">
          <h4 className="text-sm font-bold text-red-900 mb-2">Actions Légendaires</h4>
          {stats.legendaryActions.map((action, index) => (
            <div key={index} className="mb-2">
              <div className="text-xs">
                <span className="font-bold text-red-900 italic">{action.name}. </span>
                <span className="text-red-800">{action.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reactions */}
      {stats?.reactions && stats.reactions.length > 0 && (
        <div className="border-t-2 border-red-900 pt-3">
          <h4 className="text-sm font-bold text-red-900 mb-2">Réactions</h4>
          {stats.reactions.map((reaction, index) => (
            <div key={index} className="mb-2">
              <div className="text-xs">
                <span className="font-bold text-red-900 italic">{reaction.name}. </span>
                <span className="text-red-800">{reaction.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      {monster.notes && (
        <div className="border-t-2 border-red-900 pt-3 mt-4">
          <p className="text-xs text-red-700 italic">{monster.notes}</p>
        </div>
      )}
    </div>
  );
}
