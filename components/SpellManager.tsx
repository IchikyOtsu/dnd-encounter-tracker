'use client';

import { useState, useEffect } from 'react';
import { Spell, SpellSchool, SpellLevel } from '@/types/dnd';

export default function SpellManager() {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<SpellLevel | 'all'>('all');
  const [selectedSchool, setSelectedSchool] = useState<SpellSchool | 'all'>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedSpell, setEditedSpell] = useState<Spell | null>(null);

  const schools: SpellSchool[] = [
    'Abjuration',
    'Conjuration',
    'Divination',
    'Enchantment',
    'Evocation',
    'Illusion',
    'Necromancy',
    'Transmutation',
  ];

  const classes = [
    'Artificier',
    'Barde',
    'Clerc',
    'Druide',
    'Ensorceleur',
    'Magicien',
    'Occultiste',
    'Paladin',
    'Rôdeur',
  ];

  const levels: SpellLevel[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  useEffect(() => {
    fetchSpells();
  }, [selectedLevel, selectedSchool, selectedClass]);

  const fetchSpells = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedLevel !== 'all') params.append('level', selectedLevel.toString());
      if (selectedSchool !== 'all') params.append('school', selectedSchool);
      if (selectedClass !== 'all') params.append('class', selectedClass);

      const response = await fetch(`/api/spells?${params.toString()}`);
      const data = await response.json();
      setSpells(data);
    } catch (error) {
      console.error('Error fetching spells:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelText = (level: number) => {
    if (level === 0) return 'Cantrip';
    return `${level}`;
  };

  const filteredSpells = spells.filter(spell => {
    if (searchTerm && !spell.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleEdit = () => {
    if (selectedSpell) {
      setEditedSpell({ ...selectedSpell });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedSpell(null);
  };

  const handleSaveEdit = async () => {
    if (!editedSpell) return;

    try {
      const response = await fetch(`/api/spells/${editedSpell.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editedSpell.name,
          level: editedSpell.level,
          school: editedSpell.school,
          spellLists: editedSpell.spellLists,
          castingTime: editedSpell.castingTime,
          range: editedSpell.range,
          components: editedSpell.components,
          duration: editedSpell.duration,
          description: editedSpell.description,
          ritual: editedSpell.ritual,
          concentration: editedSpell.concentration,
        }),
      });

      if (response.ok) {
        setSelectedSpell(editedSpell);
        setIsEditing(false);
        fetchSpells(); // Recharger la liste
      }
    } catch (error) {
      console.error('Error updating spell:', error);
    }
  };

  const handleCloseModal = () => {
    setSelectedSpell(null);
    setIsEditing(false);
    setEditedSpell(null);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Filtres */}
      <div className="border-b border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Recherche
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nom du sort..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Niveau
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value === 'all' ? 'all' : parseInt(e.target.value) as SpellLevel)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">Tous</option>
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level === 0 ? 'Cantrip' : `Niveau ${level}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              École
            </label>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value as SpellSchool | 'all')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">Toutes</option>
              {schools.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Classe
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">Toutes</option>
              {classes.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des sorts */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : filteredSpells.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Aucun sort trouvé
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Niveau
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  École
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Temps
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Portée
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Composantes
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Durée
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSpells.map((spell) => (
                <tr
                  key={spell.id}
                  onClick={() => setSelectedSpell(spell)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{spell.name}</span>
                      {spell.concentration && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                          C
                        </span>
                      )}
                      {spell.ritual && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                          R
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {getLevelText(spell.level)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {spell.school}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {spell.castingTime}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {spell.range}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {spell.components}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {spell.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Stats */}
      <div className="border-t border-gray-200 px-4 py-3 text-sm text-gray-600">
        {filteredSpells.length} sort{filteredSpells.length > 1 ? 's' : ''}
      </div>

      {/* Modal de détails du sort */}
      {selectedSpell && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {isEditing && editedSpell ? (
                    <input
                      type="text"
                      value={editedSpell.name}
                      onChange={(e) => setEditedSpell({ ...editedSpell, name: e.target.value })}
                      className="text-2xl font-bold text-gray-900 mb-1 w-full border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedSpell.name}</h3>
                  )}
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    {isEditing && editedSpell ? (
                      <>
                        <select
                          value={editedSpell.level}
                          onChange={(e) => setEditedSpell({ ...editedSpell, level: parseInt(e.target.value) as SpellLevel })}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          {levels.map((level) => (
                            <option key={level} value={level}>
                              {level === 0 ? 'Cantrip' : `Niveau ${level}`}
                            </option>
                          ))}
                        </select>
                        <span>•</span>
                        <select
                          value={editedSpell.school}
                          onChange={(e) => setEditedSpell({ ...editedSpell, school: e.target.value as SpellSchool })}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          {schools.map((school) => (
                            <option key={school} value={school}>
                              {school}
                            </option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <>
                        {selectedSpell.level === 0 ? 'Cantrip' : `Niveau ${selectedSpell.level}`} • {selectedSpell.school}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="text-purple-600 hover:text-purple-700 px-3 py-1 text-sm font-medium"
                    >
                      ✏️ Modifier
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium"
                      >
                        💾 Sauvegarder
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-600 hover:text-gray-700 px-3 py-1 text-sm font-medium"
                      >
                        Annuler
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Informations de base */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                    Temps d'incantation
                  </div>
                  {isEditing && editedSpell ? (
                    <input
                      type="text"
                      value={editedSpell.castingTime}
                      onChange={(e) => setEditedSpell({ ...editedSpell, castingTime: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  ) : (
                    <div className="text-gray-900">{selectedSpell.castingTime}</div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                    Portée
                  </div>
                  {isEditing && editedSpell ? (
                    <input
                      type="text"
                      value={editedSpell.range}
                      onChange={(e) => setEditedSpell({ ...editedSpell, range: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  ) : (
                    <div className="text-gray-900">{selectedSpell.range}</div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                    Composantes
                  </div>
                  {isEditing && editedSpell ? (
                    <input
                      type="text"
                      value={editedSpell.components}
                      onChange={(e) => setEditedSpell({ ...editedSpell, components: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      placeholder="V, S, M"
                    />
                  ) : (
                    <div className="text-gray-900">{selectedSpell.components}</div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                    Durée
                  </div>
                  <div className="flex flex-col gap-1">
                    {isEditing && editedSpell ? (
                      <input
                        type="text"
                        value={editedSpell.duration}
                        onChange={(e) => setEditedSpell({ ...editedSpell, duration: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    ) : (
                      <div className="text-gray-900">{selectedSpell.duration}</div>
                    )}
                    {isEditing && editedSpell ? (
                      <div className="flex gap-2">
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={editedSpell.concentration}
                            onChange={(e) => setEditedSpell({ ...editedSpell, concentration: e.target.checked })}
                            className="rounded"
                          />
                          Concentration
                        </label>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={editedSpell.ritual}
                            onChange={(e) => setEditedSpell({ ...editedSpell, ritual: e.target.checked })}
                            className="rounded"
                          />
                          Rituel
                        </label>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {selectedSpell.concentration && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                            Concentration
                          </span>
                        )}
                        {selectedSpell.ritual && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                            Rituel
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Classes */}
              <div className="text-sm">
                <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                  Classes
                </div>
                {isEditing && editedSpell ? (
                  <input
                    type="text"
                    value={editedSpell.spellLists}
                    onChange={(e) => setEditedSpell({ ...editedSpell, spellLists: e.target.value })}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    placeholder="Séparées par des virgules"
                  />
                ) : (
                  <div className="text-gray-900">{selectedSpell.spellLists}</div>
                )}
              </div>

              {/* Description */}
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase mb-2">
                  Description
                </div>
                {isEditing && editedSpell ? (
                  <textarea
                    value={editedSpell.description}
                    onChange={(e) => setEditedSpell({ ...editedSpell, description: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm min-h-[200px]"
                  />
                ) : (
                  <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {selectedSpell.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
