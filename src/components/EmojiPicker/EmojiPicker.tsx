import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { emojiCategories } from '../../data/emojis';
import { useCanvasStore } from '../../store/useStore';

export const EmojiPicker = () => {
  const { currentEmoji, setCurrentEmoji } = useCanvasStore();
  const [activeCategory, setActiveCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmojis = useMemo(() => {
    if (!searchQuery) {
      return emojiCategories[activeCategory]?.emojis || [];
    }
    const allEmojis = emojiCategories.flatMap(cat => cat.emojis);
    return allEmojis.filter(emoji => emoji.includes(searchQuery));
  }, [activeCategory, searchQuery]);

  return (
    <div className="w-72 bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-100 flex flex-col h-full max-h-[600px]">
      <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-500">
        <h2 className="text-white font-bold text-lg mb-3">🎨 选择 Emoji</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索 emoji..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white/90 backdrop-blur text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </div>

      {!searchQuery && (
        <div className="flex gap-1 p-2 bg-purple-50 overflow-x-auto">
          {emojiCategories.map((cat, idx) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(idx)}
              className={`
                flex-shrink-0 px-3 py-2 rounded-xl text-lg transition-all
                ${activeCategory === idx 
                  ? 'bg-white shadow-md scale-105' 
                  : 'hover:bg-white/50'
                }
              `}
              title={cat.name}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3">
        {searchQuery && (
          <p className="text-xs text-gray-500 mb-2 px-1">
            搜索结果: {filteredEmojis.length} 个
          </p>
        )}
        <div className="grid grid-cols-6 gap-1">
          {filteredEmojis.map((emoji, idx) => (
            <button
              key={`${emoji}-${idx}`}
              onClick={() => setCurrentEmoji(emoji)}
              className={`
                aspect-square flex items-center justify-center
                text-xl rounded-lg transition-all duration-150
                hover:scale-110 hover:bg-purple-100
                ${currentEmoji === emoji 
                  ? 'bg-purple-200 scale-110 ring-2 ring-purple-400 animate-bounce' 
                  : ''
                }
              `}
            >
              {emoji}
            </button>
          ))}
        </div>
        {filteredEmojis.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-4xl mb-2">🔍</p>
            <p>没有找到匹配的 emoji</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-purple-50 border-t border-purple-100">
        <div className="flex items-center gap-3">
          <span className="text-gray-600 text-sm">当前画笔:</span>
          <span className="text-4xl">{currentEmoji}</span>
        </div>
      </div>
    </div>
  );
};
