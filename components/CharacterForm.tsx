'use client';

import { useState, useEffect } from 'react';
import { Character, CharacterType, CharacterClass, AbilityScores, calculateModifier, MonsterStats, Ability, Skill, SKILL_ABILITY_MAP } from '@/types/dnd';
import { useGame } from '@/contexts/GameContext';

interface CharacterFormProps {
  editCharacter?: Character;
  onClose?: () => void;
}

export default function CharacterForm({ editCharacter, onClose }: CharacterFormProps = {}) {
  const { addCharacter, updateCharacter } = useGame();
  const [isOpen, setIsOpen] = useState(!!editCharacter);
  const [editingTraitIndex, setEditingTraitIndex] = useState<number | null>(null);
  const [editingActionIndex, setEditingActionIndex] = useState<number | null>(null);
  const [editingBonusActionIndex, setEditingBonusActionIndex] = useState<number | null>(null);
  const [editingLegendaryIndex, setEditingLegendaryIndex] = useState<number | null>(null);
  const [editingReactionIndex, setEditingReactionIndex] = useState<number | null>(null);
  
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
    // Monster-specific fields
    monsterSize: '',
    monsterCreatureType: '',
    monsterAlignment: '',
    monsterCR: 1,
    monsterSenses: '',
    monsterLanguages: '',
    monsterConditionImmunities: '',
    monsterDamageImmunities: '',
    monsterDamageResistances: '',
    monsterDamageVulnerabilities: '',
    monsterSavingThrows: {} as Partial<Record<Ability, boolean>>,
    monsterSkills: {} as Partial<Record<Skill, 0 | 1 | 2>>,
    monsterSkillBonuses: {} as Partial<Record<Skill, number>>,
    monsterTraits: [] as Array<{ name: string; description: string }>,
    monsterActions: [] as Array<{ name: string; description: string }>,
    monsterBonusActions: [] as Array<{ name: string; description: string }>,
    monsterLegendaryActions: [] as Array<{ name: string; description: string }>,
    monsterReactions: [] as Array<{ name: string; description: string }>,
  });

  // Load character data if editing
  useEffect(() => {
    if (editCharacter) {
      const ms = editCharacter.monsterStats;
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
        // Load monster stats if they exist
        monsterSize: ms?.size || '',
        monsterCreatureType: ms?.creatureType || '',
        monsterAlignment: ms?.alignment || '',
        monsterCR: ms?.challengeRating || 1,
        monsterSenses: ms?.senses || '',
        monsterLanguages: ms?.languages || '',
        monsterConditionImmunities: ms?.conditionImmunities || '',
        monsterDamageImmunities: ms?.damageImmunities || '',
        monsterDamageResistances: ms?.damageResistances || '',
        monsterDamageVulnerabilities: ms?.damageVulnerabilities || '',
        monsterSavingThrows: ms?.savingThrows || {},
        monsterSkills: (() => {
          // Convertir les anciennes valeurs boolean en valeurs numériques (0, 1, 2)
          const skills: Partial<Record<Skill, 0 | 1 | 2>> = {};
          if (ms?.skills) {
            for (const [skill, value] of Object.entries(ms.skills)) {
              // Si c'est un boolean (ancien format), convertir true -> 1, false -> 0
              // Si c'est déjà un nombre, le garder tel quel
              if (typeof value === 'boolean') {
                skills[skill as Skill] = value ? 1 : 0;
              } else {
                skills[skill as Skill] = value as 0 | 1 | 2;
              }
            }
          }
          return skills;
        })(),
        monsterSkillBonuses: ms?.skillBonuses || {},
        monsterTraits: ms?.specialTraits || [],
        monsterActions: ms?.actions || [],
        monsterBonusActions: ms?.bonusActions || [],
        monsterLegendaryActions: ms?.legendaryActions || [],
        monsterReactions: ms?.reactions || [],
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

    // Build monster stats if character is a monster
    const monsterStats: MonsterStats | undefined = formData.type === 'Monster' ? {
      size: formData.monsterSize || undefined,
      creatureType: formData.monsterCreatureType || undefined,
      alignment: formData.monsterAlignment || undefined,
      challengeRating: formData.monsterCR,
      senses: formData.monsterSenses || undefined,
      languages: formData.monsterLanguages || undefined,
      conditionImmunities: formData.monsterConditionImmunities || undefined,
      damageImmunities: formData.monsterDamageImmunities || undefined,
      damageResistances: formData.monsterDamageResistances || undefined,
      damageVulnerabilities: formData.monsterDamageVulnerabilities || undefined,
      savingThrows: Object.keys(formData.monsterSavingThrows).length > 0 ? formData.monsterSavingThrows : undefined,
      skills: (() => {
        // Filtrer pour ne garder que les compétences avec maîtrise (> 0)
        const filteredSkills: Partial<Record<Skill, number>> = {};
        for (const [skill, level] of Object.entries(formData.monsterSkills)) {
          if (typeof level === 'number' && level > 0) {
            filteredSkills[skill as Skill] = level;
          }
        }
        return Object.keys(filteredSkills).length > 0 ? filteredSkills : undefined;
      })(),
      skillBonuses: Object.keys(formData.monsterSkillBonuses).length > 0 ? formData.monsterSkillBonuses : undefined,
      specialTraits: formData.monsterTraits.length > 0 ? formData.monsterTraits : undefined,
      actions: formData.monsterActions.length > 0 ? formData.monsterActions : undefined,
      bonusActions: formData.monsterBonusActions.length > 0 ? formData.monsterBonusActions : undefined,
      legendaryActions: formData.monsterLegendaryActions.length > 0 ? formData.monsterLegendaryActions : undefined,
      reactions: formData.monsterReactions.length > 0 ? formData.monsterReactions : undefined,
    } : undefined;

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
      monsterStats,
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
      monsterSize: '',
      monsterCreatureType: '',
      monsterAlignment: '',
      monsterCR: 1,
      monsterSenses: '',
      monsterLanguages: '',
      monsterConditionImmunities: '',
      monsterDamageImmunities: '',
      monsterDamageResistances: '',
      monsterDamageVulnerabilities: '',
      monsterTraits: [],
      monsterActions: [],
      monsterBonusActions: [],
      monsterLegendaryActions: [],
      monsterReactions: [],
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

          {/* Monster-specific fields */}
          {formData.type === 'Monster' && (
            <div className="border-t border-gray-200 pt-5 space-y-4">
              <h3 className="text-base font-medium text-gray-900 mb-3">Informations du Monstre</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Taille</label>
                  <select
                    value={formData.monsterSize}
                    onChange={(e) => setFormData({ ...formData, monsterSize: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Très petit">Très petit (Tiny)</option>
                    <option value="Petit">Petit (Small)</option>
                    <option value="Moyen">Moyen (Medium)</option>
                    <option value="Grand">Grand (Large)</option>
                    <option value="Très grand">Très grand (Huge)</option>
                    <option value="Gigantesque">Gigantesque (Gargantuan)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Type de créature</label>
                  <input
                    type="text"
                    value={formData.monsterCreatureType}
                    onChange={(e) => setFormData({ ...formData, monsterCreatureType: e.target.value })}
                    placeholder="Dragon, Bête, Humanoïde..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Alignement</label>
                  <input
                    type="text"
                    value={formData.monsterAlignment}
                    onChange={(e) => setFormData({ ...formData, monsterAlignment: e.target.value })}
                    placeholder="Loyal bon, Chaotique mauvais..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Challenge Rating (CR)</label>
                  <select
                    value={formData.monsterCR}
                    onChange={(e) => setFormData({ ...formData, monsterCR: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="0">0 (10 XP)</option>
                    <option value="0.125">1/8 (25 XP)</option>
                    <option value="0.25">1/4 (50 XP)</option>
                    <option value="0.5">1/2 (100 XP)</option>
                    {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30].map(cr => {
                      const xp = [200,450,700,1100,1800,2300,2900,3900,5000,5900,7200,8400,10000,11500,13000,15000,18000,20000,22000,25000,33000,41000,50000,62000,75000,90000,105000,120000,135000,155000][cr-1];
                      return <option key={cr} value={cr}>CR {cr} ({xp.toLocaleString()} XP)</option>;
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Sens</label>
                  <input
                    type="text"
                    value={formData.monsterSenses}
                    onChange={(e) => setFormData({ ...formData, monsterSenses: e.target.value })}
                    placeholder="vision dans le noir 18 m, Perception passive 16"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Langues</label>
                  <input
                    type="text"
                    value={formData.monsterLanguages}
                    onChange={(e) => setFormData({ ...formData, monsterLanguages: e.target.value })}
                    placeholder="Commun, Draconique..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Immunités (états)</label>
                  <input
                    type="text"
                    value={formData.monsterConditionImmunities}
                    onChange={(e) => setFormData({ ...formData, monsterConditionImmunities: e.target.value })}
                    placeholder="empoisonné, charmé..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Immunités (dégâts)</label>
                  <input
                    type="text"
                    value={formData.monsterDamageImmunities}
                    onChange={(e) => setFormData({ ...formData, monsterDamageImmunities: e.target.value })}
                    placeholder="feu, poison..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Résistances</label>
                  <input
                    type="text"
                    value={formData.monsterDamageResistances}
                    onChange={(e) => setFormData({ ...formData, monsterDamageResistances: e.target.value })}
                    placeholder="contondant, perforant..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Vulnérabilités</label>
                  <input
                    type="text"
                    value={formData.monsterDamageVulnerabilities}
                    onChange={(e) => setFormData({ ...formData, monsterDamageVulnerabilities: e.target.value })}
                    placeholder="feu, radiant..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Saving Throws Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jets de Sauvegarde</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as Ability[]).map((ability) => (
                    <label key={ability} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.monsterSavingThrows[ability] || false}
                        onChange={(e) => setFormData({
                          ...formData,
                          monsterSavingThrows: {
                            ...formData.monsterSavingThrows,
                            [ability]: e.target.checked
                          }
                        })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{ability}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Skills Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compétences
                  <span className="text-xs text-gray-500 ml-2">(Cliquez 1× pour maîtrise, 2× pour expertise)</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(['Acrobaties', 'Arcanes', 'Athlétisme', 'Discrétion', 'Dressage', 'Escamotage', 
                    'Histoire', 'Intimidation', 'Investigation', 'Médecine', 'Nature', 'Perception', 
                    'Perspicacité', 'Persuasion', 'Religion', 'Représentation', 'Survie', 'Tromperie'] as Skill[]).map((skill) => {
                    const profLevel = formData.monsterSkills[skill] || 0;
                    return (
                      <div key={skill} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const currentLevel = formData.monsterSkills[skill] || 0;
                            const nextLevel = (currentLevel + 1) % 3 as 0 | 1 | 2;
                            const newSkills = { ...formData.monsterSkills };
                            if (nextLevel === 0) {
                              delete newSkills[skill];
                            } else {
                              newSkills[skill] = nextLevel;
                            }
                            setFormData({
                              ...formData,
                              monsterSkills: newSkills
                            });
                          }}
                          className="flex items-center space-x-2 cursor-pointer flex-1 text-left hover:bg-gray-50 p-1 rounded transition-colors"
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            profLevel === 0 ? 'border-gray-300 bg-white' :
                            profLevel === 1 ? 'border-blue-500 bg-blue-500' :
                            'border-purple-600 bg-purple-600'
                          }`}>
                            {profLevel === 1 && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                            {profLevel === 2 && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm text-gray-700">
                            {skill} <span className="text-xs text-gray-500">({SKILL_ABILITY_MAP[skill]})</span>
                          </span>
                        </button>
                        <input
                          type="number"
                          value={formData.monsterSkillBonuses[skill] ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newBonuses = { ...formData.monsterSkillBonuses };
                            if (val === '' || val === '-') {
                              delete newBonuses[skill];
                            } else {
                              newBonuses[skill] = parseInt(val);
                            }
                            setFormData({
                              ...formData,
                              monsterSkillBonuses: newBonuses
                            });
                          }}
                          placeholder="Auto"
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Traits/Caractéristiques Section */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caractéristiques Spéciales
                  <span className="text-xs text-gray-500 ml-2">(Régénération, Vision dans le noir, etc.)</span>
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nom (ex: Régénération)"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.currentTarget;
                          const descInput = input.nextElementSibling as HTMLTextAreaElement;
                          if (input.value && descInput?.value) {
                            setFormData({
                              ...formData,
                              monsterTraits: [...formData.monsterTraits, { name: input.value, description: descInput.value }]
                            });
                            input.value = '';
                            descInput.value = '';
                          }
                        }
                      }}
                    />
                    <textarea
                      placeholder="Description complète..."
                      rows={1}
                      className="flex-[2] px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          e.preventDefault();
                          const descInput = e.currentTarget;
                          const nameInput = descInput.previousElementSibling as HTMLInputElement;
                          if (nameInput?.value && descInput.value) {
                            setFormData({
                              ...formData,
                              monsterTraits: [...formData.monsterTraits, { name: nameInput.value, description: descInput.value }]
                            });
                            nameInput.value = '';
                            descInput.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const btn = e.currentTarget;
                        const container = btn.parentElement!;
                        const nameInput = container.querySelector('input') as HTMLInputElement;
                        const descInput = container.querySelector('textarea') as HTMLTextAreaElement;
                        if (nameInput.value && descInput.value) {
                          setFormData({
                            ...formData,
                            monsterTraits: [...formData.monsterTraits, { name: nameInput.value, description: descInput.value }]
                          });
                          nameInput.value = '';
                          descInput.value = '';
                        }
                      }}
                      className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>
                  {formData.monsterTraits.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {formData.monsterTraits.map((trait, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                          {editingTraitIndex === idx ? (
                            <>
                              <input
                                type="text"
                                defaultValue={trait.name}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const newName = e.currentTarget.value;
                                    const descInput = e.currentTarget.nextElementSibling as HTMLTextAreaElement;
                                    const newDesc = descInput.value;
                                    if (newName && newDesc) {
                                      const updatedTraits = [...formData.monsterTraits];
                                      updatedTraits[idx] = { name: newName, description: newDesc };
                                      setFormData({ ...formData, monsterTraits: updatedTraits });
                                      setEditingTraitIndex(null);
                                    }
                                  }
                                }}
                              />
                              <textarea
                                defaultValue={trait.description}
                                rows={2}
                                className="flex-[2] px-2 py-1 text-sm border border-gray-300 rounded resize-none"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  const container = e.currentTarget.parentElement!;
                                  const nameInput = container.querySelector('input') as HTMLInputElement;
                                  const descInput = container.querySelector('textarea') as HTMLTextAreaElement;
                                  if (nameInput.value && descInput.value) {
                                    const updatedTraits = [...formData.monsterTraits];
                                    updatedTraits[idx] = { name: nameInput.value, description: descInput.value };
                                    setFormData({ ...formData, monsterTraits: updatedTraits });
                                    setEditingTraitIndex(null);
                                  }
                                }}
                                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                              >
                                ✓
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="flex-1">
                                <span className="font-semibold text-sm">{trait.name}:</span>
                                <span className="text-sm text-gray-700 ml-1">{trait.description}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditingTraitIndex(idx)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                ✎
                              </button>
                              <button
                                type="button"
                                onClick={() => setFormData({
                                  ...formData,
                                  monsterTraits: formData.monsterTraits.filter((_, i) => i !== idx)
                                })}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                ✕
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Section */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actions
                  <span className="text-xs text-gray-500 ml-2">(Morsure, Attaque multiple, etc.)</span>
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nom (ex: Morsure)"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      placeholder="Description complète..."
                      rows={1}
                      className="flex-[2] px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const btn = e.currentTarget;
                        const container = btn.parentElement!;
                        const nameInput = container.querySelector('input') as HTMLInputElement;
                        const descInput = container.querySelector('textarea') as HTMLTextAreaElement;
                        if (nameInput.value && descInput.value) {
                          setFormData({
                            ...formData,
                            monsterActions: [...formData.monsterActions, { name: nameInput.value, description: descInput.value }]
                          });
                          nameInput.value = '';
                          descInput.value = '';
                        }
                      }}
                      className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>
                  {formData.monsterActions.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {formData.monsterActions.map((action, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                          {editingActionIndex === idx ? (
                            <>
                              <input
                                type="text"
                                defaultValue={action.name}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                              />
                              <textarea
                                defaultValue={action.description}
                                rows={2}
                                className="flex-[2] px-2 py-1 text-sm border border-gray-300 rounded resize-none"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  const container = e.currentTarget.parentElement!;
                                  const nameInput = container.querySelector('input') as HTMLInputElement;
                                  const descInput = container.querySelector('textarea') as HTMLTextAreaElement;
                                  if (nameInput.value && descInput.value) {
                                    const updatedActions = [...formData.monsterActions];
                                    updatedActions[idx] = { name: nameInput.value, description: descInput.value };
                                    setFormData({ ...formData, monsterActions: updatedActions });
                                    setEditingActionIndex(null);
                                  }
                                }}
                                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                              >
                                ✓
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="flex-1">
                                <span className="font-semibold text-sm">{action.name}:</span>
                                <span className="text-sm text-gray-700 ml-1">{action.description}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditingActionIndex(idx)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                ✎
                              </button>
                              <button
                                type="button"
                                onClick={() => setFormData({
                                  ...formData,
                                  monsterActions: formData.monsterActions.filter((_, i) => i !== idx)
                                })}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                ✕
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bonus Actions Section */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actions Bonus
                  <span className="text-xs text-gray-500 ml-2">(Désengagement, Dash, Se cacher, etc.)</span>
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nom (ex: Attaque secondaire)"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      placeholder="Description complète..."
                      rows={1}
                      className="flex-[2] px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const btn = e.currentTarget;
                        const container = btn.parentElement!;
                        const nameInput = container.querySelector('input') as HTMLInputElement;
                        const descInput = container.querySelector('textarea') as HTMLTextAreaElement;
                        if (nameInput.value && descInput.value) {
                          setFormData({
                            ...formData,
                            monsterBonusActions: [...formData.monsterBonusActions, { name: nameInput.value, description: descInput.value }]
                          });
                          nameInput.value = '';
                          descInput.value = '';
                        }
                      }}
                      className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>
                  {formData.monsterBonusActions.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {formData.monsterBonusActions.map((action, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                          {editingBonusActionIndex === idx ? (
                            <>
                              <input
                                type="text"
                                defaultValue={action.name}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                              />
                              <textarea
                                defaultValue={action.description}
                                rows={2}
                                className="flex-[2] px-2 py-1 text-sm border border-gray-300 rounded resize-none"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  const container = e.currentTarget.parentElement!;
                                  const nameInput = container.querySelector('input') as HTMLInputElement;
                                  const descInput = container.querySelector('textarea') as HTMLTextAreaElement;
                                  if (nameInput.value && descInput.value) {
                                    const updatedActions = [...formData.monsterBonusActions];
                                    updatedActions[idx] = { name: nameInput.value, description: descInput.value };
                                    setFormData({ ...formData, monsterBonusActions: updatedActions });
                                    setEditingBonusActionIndex(null);
                                  }
                                }}
                                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                              >
                                ✓
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="flex-1">
                                <span className="font-semibold text-sm">{action.name}:</span>
                                <span className="text-sm text-gray-700 ml-1">{action.description}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditingBonusActionIndex(idx)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                ✎
                              </button>
                              <button
                                type="button"
                                onClick={() => setFormData({
                                  ...formData,
                                  monsterBonusActions: formData.monsterBonusActions.filter((_, i) => i !== idx)
                                })}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                ✕
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Legendary Actions Section */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actions Légendaires
                  <span className="text-xs text-gray-500 ml-2">(Optionnel)</span>
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nom"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      placeholder="Description complète..."
                      rows={1}
                      className="flex-[2] px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const btn = e.currentTarget;
                        const container = btn.parentElement!;
                        const nameInput = container.querySelector('input') as HTMLInputElement;
                        const descInput = container.querySelector('textarea') as HTMLTextAreaElement;
                        if (nameInput.value && descInput.value) {
                          setFormData({
                            ...formData,
                            monsterLegendaryActions: [...formData.monsterLegendaryActions, { name: nameInput.value, description: descInput.value }]
                          });
                          nameInput.value = '';
                          descInput.value = '';
                        }
                      }}
                      className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>
                  {formData.monsterLegendaryActions.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {formData.monsterLegendaryActions.map((action, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                          {editingLegendaryIndex === idx ? (
                            <>
                              <input
                                type="text"
                                defaultValue={action.name}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                              />
                              <textarea
                                defaultValue={action.description}
                                rows={2}
                                className="flex-[2] px-2 py-1 text-sm border border-gray-300 rounded resize-none"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  const container = e.currentTarget.parentElement!;
                                  const nameInput = container.querySelector('input') as HTMLInputElement;
                                  const descInput = container.querySelector('textarea') as HTMLTextAreaElement;
                                  if (nameInput.value && descInput.value) {
                                    const updatedActions = [...formData.monsterLegendaryActions];
                                    updatedActions[idx] = { name: nameInput.value, description: descInput.value };
                                    setFormData({ ...formData, monsterLegendaryActions: updatedActions });
                                    setEditingLegendaryIndex(null);
                                  }
                                }}
                                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                              >
                                ✓
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="flex-1">
                                <span className="font-semibold text-sm">{action.name}:</span>
                                <span className="text-sm text-gray-700 ml-1">{action.description}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditingLegendaryIndex(idx)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                ✎
                              </button>
                              <button
                                type="button"
                                onClick={() => setFormData({
                                  ...formData,
                                  monsterLegendaryActions: formData.monsterLegendaryActions.filter((_, i) => i !== idx)
                                })}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                ✕
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Reactions Section */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Réactions
                  <span className="text-xs text-gray-500 ml-2">(Optionnel)</span>
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nom (ex: Parade)"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      placeholder="Description complète..."
                      rows={1}
                      className="flex-[2] px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const btn = e.currentTarget;
                        const container = btn.parentElement!;
                        const nameInput = container.querySelector('input') as HTMLInputElement;
                        const descInput = container.querySelector('textarea') as HTMLTextAreaElement;
                        if (nameInput.value && descInput.value) {
                          setFormData({
                            ...formData,
                            monsterReactions: [...formData.monsterReactions, { name: nameInput.value, description: descInput.value }]
                          });
                          nameInput.value = '';
                          descInput.value = '';
                        }
                      }}
                      className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>
                  {formData.monsterReactions.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {formData.monsterReactions.map((reaction, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                          {editingReactionIndex === idx ? (
                            <>
                              <input
                                type="text"
                                defaultValue={reaction.name}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                              />
                              <textarea
                                defaultValue={reaction.description}
                                rows={2}
                                className="flex-[2] px-2 py-1 text-sm border border-gray-300 rounded resize-none"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  const container = e.currentTarget.parentElement!;
                                  const nameInput = container.querySelector('input') as HTMLInputElement;
                                  const descInput = container.querySelector('textarea') as HTMLTextAreaElement;
                                  if (nameInput.value && descInput.value) {
                                    const updatedReactions = [...formData.monsterReactions];
                                    updatedReactions[idx] = { name: nameInput.value, description: descInput.value };
                                    setFormData({ ...formData, monsterReactions: updatedReactions });
                                    setEditingReactionIndex(null);
                                  }
                                }}
                                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                              >
                                ✓
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="flex-1">
                                <span className="font-semibold text-sm">{reaction.name}:</span>
                                <span className="text-sm text-gray-700 ml-1">{reaction.description}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditingReactionIndex(idx)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                ✎
                              </button>
                              <button
                                type="button"
                                onClick={() => setFormData({
                                  ...formData,
                                  monsterReactions: formData.monsterReactions.filter((_, i) => i !== idx)
                                })}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                ✕
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

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
