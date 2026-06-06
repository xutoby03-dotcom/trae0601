import React, { useState, useMemo } from 'react';
import { Chord } from '../types';
import { CHORDS, CHORD_CATEGORIES, ROOT_NOTES } from '../data/chords';
import { Search, Music } from 'lucide-react';

interface ChordLibraryProps {
  selectedChord: Chord | null;
  onSelectChord: (chord: Chord) => void;
  onAddToProgression?: (chord: Chord) => void;
}

export const ChordLibrary: React.FC<ChordLibraryProps> = ({
  selectedChord,
  onSelectChord,
  onAddToProgression,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoot, setSelectedRoot] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filteredChords = useMemo(() => {
    return CHORDS.filter(chord => {
      const matchesSearch = chord.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRoot = !selectedRoot || chord.rootNote === selectedRoot;
      const matchesType = !selectedType || chord.type === selectedType;
      return matchesSearch && matchesRoot && matchesType;
    });
  }, [searchTerm, selectedRoot, selectedType]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 h-full flex flex-col">
      <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
        <Music className="w-5 h-5" />
        和弦库
      </h3>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="搜索和弦..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">根音:</p>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedRoot(null)}
            className={`px-2 py-1 text-xs rounded-lg transition-all ${
              !selectedRoot
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {ROOT_NOTES.map(note => (
            <button
              key={note}
              onClick={() => setSelectedRoot(note === selectedRoot ? null : note)}
              className={`px-2 py-1 text-xs rounded-lg transition-all ${
                selectedRoot === note
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {note}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">类型:</p>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedType(null)}
            className={`px-2 py-1 text-xs rounded-lg transition-all ${
              !selectedType
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {CHORD_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedType(cat.id === selectedType ? null : cat.id)}
              className={`px-2 py-1 text-xs rounded-lg transition-all ${
                selectedType === cat.id
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-3 gap-2">
          {filteredChords.map(chord => (
            <div
              key={chord.id}
              onClick={() => onSelectChord(chord)}
              className={`relative p-3 rounded-xl cursor-pointer transition-all hover:scale-105 ${
                selectedChord?.id === chord.id
                  ? 'bg-amber-100 border-2 border-amber-500 shadow-lg'
                  : 'bg-amber-50 border-2 border-transparent hover:border-amber-300'
              }`}
            >
              <div className="text-center">
                <span className="text-lg font-bold text-amber-900">{chord.name}</span>
                <div className="text-xs text-amber-700 mt-1">
                  {chord.type === 'major' ? '大三' :
                   chord.type === 'minor' ? '小三' :
                   chord.type === '7' ? '七' :
                   chord.type === 'maj7' ? '大七' :
                   chord.type === 'm7' ? '小七' :
                   chord.type === 'dim' ? '减' :
                   chord.type === 'aug' ? '增' :
                   chord.type === 'sus2' ? '挂二' :
                   chord.type === 'sus4' ? '挂四' :
                   chord.type === '6' ? '六' : chord.type}
                </div>
              </div>
              {onAddToProgression && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToProgression(chord);
                  }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-green-600 transition-colors"
                  title="添加到进行"
                >
                  +
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-amber-100">
        <p className="text-xs text-gray-500 text-center">
          共 {filteredChords.length} 个和弦
        </p>
      </div>
    </div>
  );
};
