import React, { useState } from 'react';
import { Story } from '../types';

interface Props {
  stories: Story[];
  categories: string[];
  onSelectStory: (story: Story) => void;
  onDeleteStory: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onAddCategory: (category: string) => void;
  onUpdateStoryCategory: (storyId: string, category: string) => void;
  selectedStoryId?: string;
}

export const StoryLibrary: React.FC<Props> = ({
  stories,
  categories,
  onSelectStory,
  onDeleteStory,
  onToggleFavorite,
  onAddCategory,
  onUpdateStoryCategory,
  selectedStoryId
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const filteredStories = stories.filter(story => {
    if (activeCategory === '全部') return true;
    if (activeCategory === '收藏') return story.isFavorite;
    return story.category === activeCategory;
  });

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 h-full">
      <h3 className="text-xl font-bold text-gray-800 mb-4">📚 我的故事库</h3>

      <div className="flex flex-wrap gap-2 mb-4">
        {['全部', '收藏', ...categories.filter(c => c !== '收藏')].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat === '收藏' ? '⭐ 收藏' : cat}
          </button>
        ))}
        {showAddCategory ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <button
              onClick={handleAddCategory}
              className="px-2 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
            >
              ✓
            </button>
            <button
              onClick={() => setShowAddCategory(false)}
              className="px-2 py-1 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddCategory(true)}
            className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-all"
          >
            + 新建分类
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {filteredStories.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">📖</p>
            <p>还没有故事，快去创作一个吧！</p>
          </div>
        ) : (
          filteredStories.map(story => (
            <div
              key={story.id}
              className={`p-4 rounded-xl cursor-pointer transition-all ${
                selectedStoryId === story.id
                  ? 'bg-indigo-50 border-2 border-indigo-300'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              }`}
              onClick={() => onSelectStory(story)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 truncate">{story.title}</h4>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded">
                      {story.type}
                    </span>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                      {new Date(story.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {story.paragraphs[0]?.content.substring(0, 80)}...
                  </p>
                </div>
                <div className="flex flex-col gap-1 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(story.id);
                    }}
                    className={`text-xl transition-transform hover:scale-110 ${
                      story.isFavorite ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    {story.isFavorite ? '⭐' : '☆'}
                  </button>
                  <select
                    value={story.category}
                    onChange={(e) => {
                      e.stopPropagation();
                      onUpdateStoryCategory(story.id, e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs px-2 py-1 border border-gray-300 rounded cursor-pointer"
                  >
                    {categories.filter(c => c !== '收藏').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('确定要删除这个故事吗？')) {
                        onDeleteStory(story.id);
                      }
                    }}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
