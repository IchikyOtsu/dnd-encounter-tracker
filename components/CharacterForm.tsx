'use client';

import { useState, useEffect } from 'react';
import { Character, CharacterType, CharacterClass, AbilityScores, calculateModifier } from '@/types/dnd';
import { useGame } from '@/contexts/GameContext';

interface CharacterFormProps {
  editCharacter?: Character;
  onClose?: () => void;
}

export default function CharacterForm({ editCharacter, onClose }: CharacterFormProps = {}) {
  const { addCharacter, updateCharacter } = useGame();
  const [isOpen, setIsOpen] = useState(!!editCharacter);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'PC' as CharacterType,
    class: 'Aucune' as CharacterClass,
    level: 1,
    armorClass: 10,
    maxHP: 10,
    currentHP: 10,
    temporaryHP: 0,
    STR: 10,
    DEX: 10,
    CON: 10,
    INT: 10,
    WIS: 10,
    CHA: 10,
    speed: 9,
    proficiencyBonus: 2,
    initiativeBonus: null as number | null,
    notes: '',
  });

  // Load character data if editing
  useEffect(() => {
    if (editCharacter) {
      setFormData({
        name: editCharacter.name,
        type: editCharacter.type,
        class: editCharacter.class || 'Aucune',
        level: editCharacter.level || 1,
        armorClass: editCharacter.armorClass,
        maxHP: editCharacter.hitPoints.max,
        currentHP: editCharacter.hitPoints.current,
        temporaryHP: editCharacter.hitPoints.temporary,
        STR: editCharacter.abilities.STR,
        DEX: editCharacter.abilities.DEX,
        CON: editCharacter.abilities.CON,
        INT: editCharacter.abilities.INT,
        WIS: editCharacter.abilities.WIS,
        CHA: editCharacter.abilities.CHA,
        speed: editCharacter.speed || 9,
        proficiencyBonus: editCharacter.proficiencyBonus || 2,
        initiativeBonus: editCharacter.initiativeBonus === calculateModifier(editCharacter.abilities.DEX) ? null : editCharacter.initiativeBonus,
        notes: editCharacter.notes || '',
      });
      setIsOpen(true);
    }
  }, [editCharacter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const abilities: AbilityScores = {
      STR: formData.STR,
      DEX: formData.DEX,
      CON: formData.CON,
      INT: formData.INT,
      WIS: formData.WIS,
      CHA: formData.CHA,
    };

    const characterData = {
      name: formData.name,
      type: formData.type,
      class: formData.class !== 'Aucune' ? formData.class : undefined,
      level: formData.level,
      armorClass: formData.armorClass,
      hitPoints: {
        current: formData.currentHP,
        max: formData.maxHP,
        temporary: formData.temporaryHP,
      },
      abilities,
      initiativeBonus: formData.initiativeBonus !== null ? formData.initiativeBonus : calculateModifier(formData.DEX),
      proficiencyBonus: formData.proficiencyBonus,
      speed: formData.speed,
      notes: formData.notes,
    };

    if (editCharacter) {
      // Update existing character
      updateCharacter(editCharacter.id, characterData);
      if (onClose) onClose();
    } else {
      // Add new character
      const character: Character = {
        id: Date.now().toString(),
        ...characterData,
        conditions: [],
      };
      addCharacter(character);
    }
    
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
    
    // Reset form
    setFormData({
      name: '',
      type: 'PC',
      class: 'Aucune',
      level: 1,
      armorClass: 10,
      maxHP: 10,
      currentHP: 10,
      temporaryHP: 0,
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10,
      speed: 9,
      proficiencyBonus: 2,
      initiativeBonus: null,
      notes: '',
    });
  };

  if (!isOpen && !editCharacter) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Nouveau Personnage
      </button>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-5">
          {editCharacter ? 'Modifier le Personnage' : 'Nouveau Personnage'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as CharacterType })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="PC">Personnage Joueur (PJ)</option>
                <option value="NPC">Personnage Non-Joueur (PNJ)</option>
                <option value="Monster">Monstre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Classe</label>
              <select
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value as CharacterClass })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Aucune">Aucune classe</option>
                <option value="Artificier">Artificier</option>
                <option value="Barbare">Barbare</option>
                <option value="Barde">Barde</option>
                <option value="Chasseur de Sang">Chasseur de Sang</option>
                <option value="Clerc">Clerc</option>
                <option value="Druide">Druide</option>
                <option value="Ensorceleur">Ensorceleur</option>
                <option value="Guerrier">Guerrier</option>
                <option value="Magicien">Magicien</option>
                <option value="Moine">Moine</option>
                <option value="Occultiste">Occultiste</option>
                <option value="Paladin">Paladin</option>
                <option value="Rôdeur">Rôdeur</option>
                <option value="Roublard">Roublard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Niveau</label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Classe d'Armure (CA)</label>
              <input
                type="number"
                min="1"
                value={formData.armorClass}
                onChange={(e) => setFormData({ ...formData, armorClass: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">PV Max</label>
              <input
                type="number"
                min="1"
                value={formData.maxHP}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  maxHP: parseInt(e.target.value),
                  currentHP: parseInt(e.target.value)
                })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Vitesse (m)</label>
              <input
                type="number"
                min="0"
                step="1.5"
                value={formData.speed}
                onChange={(e) => setFormData({ ...formData, speed: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Bonus d'Initiative
                <span className="text-xs text-gray-500 ml-1.5">
                  (Auto: {calculateModifier(formData.DEX) >= 0 ? '+' : ''}{calculateModifier(formData.DEX)})
                </span>
              </label>
              <input
                type="number"
                value={formData.initiativeBonus === null ? '' : formData.initiativeBonus}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, initiativeBonus: val === '' ? null : parseInt(val) });
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Auto: ${calculateModifier(formData.DEX) >= 0 ? '+' : ''}${calculateModifier(formData.DEX)}`}
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-5">
            <h3 className="text-base font-medium text-gray-900 mb-3">Caractéristiques</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const).map((ability) => (
                <div key={ability}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {ability}
                    <span className="text-xs text-gray-500 ml-1">
                      ({calculateModifier(formData[ability]) >= 0 ? '+' : ''}
                      {calculateModifier(formData[ability])})
                    </span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData[ability]}
                    onChange={(e) => setFormData({ ...formData, [ability]: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
            >
              {editCharacter ? 'Sauvegarder' : 'Créer'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
