import React from 'react';
import { Favorites } from '../components/Favorites';
import { useAppStore } from '../store/appStore';
import { Heart, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChordProgression } from '../types';

export const FavoritesPage: React.FC = () => {
  const favorites = useAppStore(state => state.favorites);
  const removeFromFavorites = useAppStore(state => state.removeFromFavorites);
  const updateFavorite = useAppStore(state => state.updateFavorite);
  const setCurrentProgression = useAppStore(state => state.setCurrentProgression);
  
  const navigate = useNavigate();

  const handleLoadProgression = (progression: ChordProgression) => {
    setCurrentProgression({
      ...progression,
      id: 'current',
    });
    navigate('/progression');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl mb-4">
          <Heart className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          我的收藏
        </h1>
        <p className="text-gray-600">
          保存你喜欢的和弦进行，随时调用
        </p>
      </div>

      {favorites.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <p className="text-3xl font-bold text-amber-900">{favorites.length}</p>
            <p className="text-sm text-gray-500 mt-1">收藏数量</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <p className="text-3xl font-bold text-amber-900">
              {favorites.reduce((sum, f) => sum + f.chords.length, 0)}
            </p>
            <p className="text-sm text-gray-500 mt-1">和弦总数</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <p className="text-3xl font-bold text-amber-900">
              {[...new Set(favorites.map(f => f.category))].filter(Boolean).length || 1}
            </p>
            <p className="text-sm text-gray-500 mt-1">分类数量</p>
          </div>
        </div>
      )}

      <Favorites
        favorites={favorites}
        onDelete={removeFromFavorites}
        onUpdate={updateFavorite}
        onLoad={handleLoadProgression}
      />

      {favorites.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            💡 提示：点击 <Music className="w-4 h-4 inline" /> 图标可以将和弦进行加载到编辑器中
          </p>
        </div>
      )}
    </div>
  );
};
