import React, { useState, useMemo } from 'react';
import { ChordProgression } from '../types';
import { CHORDS } from '../data/chords';
import { Play, Trash2, Edit2, Save, X, Heart, Music, Search, Filter } from 'lucide-react';
import { audioEngine } from '../utils/audio';

interface FavoritesProps {
  favorites: ChordProgression[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ChordProgression>) => void;
  onLoad?: (progression: ChordProgression) => void;
}

export const Favorites: React.FC<FavoritesProps> = ({
  favorites,
  onDelete,
  onUpdate,
  onLoad,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(favorites.map(f => f.category).filter(Boolean))];

  const filteredFavorites = useMemo(() => {
    return favorites.filter(fav => {
      const matchesSearch = fav.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || fav.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [favorites, searchTerm, selectedCategory]);

  const startEdit = (progression: ChordProgression) => {
    setEditingId(progression.id);
    setEditName(progression.name);
    setEditCategory(progression.category);
  };

  const saveEdit = () => {
    if (editingId) {
      onUpdate(editingId, {
        name: editName,
        category: editCategory,
      });
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditCategory('');
  };

  const playProgression = (progression: ChordProgression) => {
    if (playingId === progression.id) return;
    
    setPlayingId(progression.id);
    
    let delay = 0;
    const interval = (60 / progression.bpm) * 1000;
    
    progression.chords.forEach((chordId, index) => {
      setTimeout(() => {
        const chord = CHORDS.find(c => c.id === chordId);
        if (chord) {
          audioEngine.playChord(chord.frets);
        }
        if (index === progression.chords.length - 1) {
          setTimeout(() => setPlayingId(null), 1500);
        }
      }, delay);
      delay += interval;
    });
  };

  if (favorites.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-700 mb-2">还没有收藏</h3>
        <p className="text-gray-500">在和弦进行编辑器中保存你喜欢的和弦进行吧！</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h3 className="text-xl font-bold text-amber-900 mb-6 flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-500" />
        我的收藏
      </h3>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索和弦进行..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
        {categories.length > 0 && (
          <div className="relative">
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white cursor-pointer"
            >
              <option value="">全部分类</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat || '未分类'}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              selectedCategory === null
                ? 'bg-amber-500 text-white'
                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
            }`}
          >
            全部
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              }`}
            >
              {cat || '未分类'}
            </button>
          ))}
        </div>
      )}

      {filteredFavorites.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>没有找到匹配的和弦进行</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFavorites.map(progression => (
          <div
            key={progression.id}
            className={`p-4 rounded-xl border-2 transition-all ${
              playingId === progression.id
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-amber-300'
            }`}
          >
            {editingId === progression.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="名称"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  placeholder="分类"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    className="flex items-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    保存
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800">{progression.name}</h4>
                    <p className="text-xs text-gray-500">
                      {progression.category || '未分类'} · {progression.bpm} BPM
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => playProgression(progression)}
                      className={`p-2 rounded-lg transition-colors ${
                        playingId === progression.id
                          ? 'bg-green-500 text-white'
                          : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
                      }`}
                      title="播放"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    {onLoad && (
                      <button
                        onClick={() => onLoad(progression)}
                        className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                        title="加载到编辑器"
                      >
                        <Music className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(progression)}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(progression.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {progression.chords.map((chordId, index) => {
                    const chord = CHORDS.find(c => c.id === chordId);
                    return (
                      <span
                        key={index}
                        className="px-2 py-1 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium"
                      >
                        {chord?.name || chordId}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
