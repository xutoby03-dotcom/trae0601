import { useState, useMemo } from 'react';
import { Plus, Search, X, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePetStore } from '@/store/usePetStore';
import { PetCard } from '@/components/PetCard';
import { GroupBadge } from '@/components/StatusBadge';
import type { GroupType, PetSpecies, PetSize } from '@/types';
import { cn } from '@/lib/utils';

const groups: GroupType[] = ['recent', 'seen', 'found', 'urgent'];

const emptyStateText: Record<GroupType, { title: string; description: string }> = {
  recent: { title: '最近没有走失的宠物', description: '太好了！社区里的宠物都很安全。' },
  seen: { title: '暂无最新线索', description: '如果您看到走失的宠物，请及时提供线索。' },
  found: { title: '还没有找回记录', description: '希望所有走失的宠物都能早日回家。' },
  urgent: { title: '没有需要重点扩散的协寻', description: '请持续关注，帮助更多宠物回家。' },
};

const speciesOptions: { value: PetSpecies | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'dog', label: '🐕 狗' },
  { value: 'cat', label: '🐱 猫' },
];

const sizeOptions: { value: PetSize | 'all'; label: string }[] = [
  { value: 'all', label: '全部体型' },
  { value: 'small', label: '小型' },
  { value: 'medium', label: '中型' },
  { value: 'large', label: '大型' },
];

export function Home() {
  const currentGroup = usePetStore((state) => state.currentGroup);
  const setCurrentGroup = usePetStore((state) => state.setCurrentGroup);
  const getGroupedPets = usePetStore((state) => state.getGroupedPets);
  const petMissing = usePetStore((state) => state.petMissing);
  const clues = usePetStore((state) => state.clues);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecies, setFilterSpecies] = useState<PetSpecies | 'all'>('all');
  const [filterSize, setFilterSize] = useState<PetSize | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const groupedPets = useMemo(() => getGroupedPets(), [getGroupedPets, petMissing, clues]);

  const hasActiveFilters = searchQuery.trim() !== '' || filterSpecies !== 'all' || filterSize !== 'all';

  const applyFilters = (pets: typeof groupedPets.recent) => {
    const query = searchQuery.trim().toLowerCase();
    return pets.filter((pet) => {
      if (filterSpecies !== 'all' && pet.species !== filterSpecies) return false;
      if (filterSize !== 'all' && pet.size !== filterSize) return false;
      if (query) {
        const matchName = pet.petName.toLowerCase().includes(query);
        const matchBreed = pet.breed.toLowerCase().includes(query);
        const matchColor = pet.color.toLowerCase().includes(query);
        const matchLocation = pet.lastLocation.toLowerCase().includes(query);
        if (!matchName && !matchBreed && !matchColor && !matchLocation) return false;
      }
      return true;
    });
  };

  const filteredPets = useMemo(() => applyFilters(groupedPets[currentGroup]), [groupedPets, currentGroup, searchQuery, filterSpecies, filterSize]);

  const filteredGroupCounts = useMemo(() => ({
    recent: applyFilters(groupedPets.recent).length,
    seen: applyFilters(groupedPets.seen).length,
    found: applyFilters(groupedPets.found).length,
    urgent: applyFilters(groupedPets.urgent).length,
  }), [groupedPets, searchQuery, filterSpecies, filterSize]);

  const displayCounts = hasActiveFilters ? filteredGroupCounts : {
    recent: groupedPets.recent.length,
    seen: groupedPets.seen.length,
    found: groupedPets.found.length,
    urgent: groupedPets.urgent.length,
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterSpecies('all');
    setFilterSize('all');
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-6 md:py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          🐾 社区宠物协寻平台
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          帮助走失的宠物早日回家。发布协寻、提供线索，让我们一起守护毛孩子。
        </p>
        <div className="flex justify-center gap-8 mt-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-500">{petMissing.length}</p>
            <p className="text-sm text-gray-500">协寻总数</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-500">{groupedPets.found.length}</p>
            <p className="text-sm text-gray-500">已找回</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-500">{groupedPets.urgent.length}</p>
            <p className="text-sm text-gray-500">紧急协寻</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索宠物名、品种、颜色、出现位置..."
            className="w-full pl-12 pr-12 py-3 bg-white rounded-2xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all text-sm font-medium",
              showFilters || filterSpecies !== 'all' || filterSize !== 'all'
                ? "border-orange-400 bg-orange-50 text-orange-600"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            )}
          >
            <Filter className="w-4 h-4" />
            筛选
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              清除筛选
            </button>
          )}

          {hasActiveFilters && (
            <span className="text-sm text-gray-400 ml-auto">
              找到 {filteredPets.length} 条结果
            </span>
          )}
        </div>

        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-4 shadow-sm animate-fadeIn">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">宠物种类</p>
              <div className="flex gap-2 flex-wrap">
                {speciesOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilterSpecies(option.value as PetSpecies | 'all')}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                      filterSpecies === option.value
                        ? "bg-orange-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">体型</p>
              <div className="flex gap-2 flex-wrap">
                {sizeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilterSize(option.value as PetSize | 'all')}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                      filterSize === option.value
                        ? "bg-orange-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {groups.map((group) => (
          <div key={group} className="relative flex-shrink-0">
            <GroupBadge
              group={group}
              active={currentGroup === group}
              onClick={() => setCurrentGroup(group)}
            />
            {displayCounts[group] > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {displayCounts[group]}
              </span>
            )}
          </div>
        ))}
      </div>

      {filteredPets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-4xl">
              {hasActiveFilters ? '🔍' : '🐾'}
            </span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {hasActiveFilters
              ? '没有找到匹配的宠物'
              : emptyStateText[currentGroup].title}
          </h3>
          <p className="text-gray-500 mb-4">
            {hasActiveFilters
              ? '试试调整搜索关键词或筛选条件'
              : emptyStateText[currentGroup].description}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors text-sm font-medium"
            >
              清除筛选条件
            </button>
          )}
        </div>
      )}

      <Link
        to="/publish"
        className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-full shadow-lg shadow-orange-200 flex items-center justify-center hover:shadow-xl hover:scale-110 transition-all duration-300 z-40"
      >
        <Plus className="w-7 h-7" />
      </Link>
    </div>
  );
}
