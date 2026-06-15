import { useState, useMemo } from 'react';
import { Search, Filter, Apple, Cookie, Coffee, Sparkles } from 'lucide-react';
import { useFoodStore } from '../store/useFoodStore';
import { FoodCard } from '../components/FoodCard';
import { FoodCategory, AllergenType, ALLERGEN_LABELS } from '../types';
import { useAutoExpire } from '../hooks/useAutoExpire';

type CategoryFilter = FoodCategory | 'all';
type SortOption = 'time' | 'quantity' | 'expiry';

export default function Home() {
  useAutoExpire();
  
  const { getAvailableFoods, getStats } = useFoodStore();
  const foods = getAvailableFoods();
  const stats = getStats();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('time');
  const [excludeAllergens, setExcludeAllergens] = useState<AllergenType[]>([]);

  const filteredFoods = useMemo(() => {
    let result = [...foods];

    if (searchQuery) {
      result = result.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter((f) => f.category === categoryFilter);
    }

    if (excludeAllergens.length > 0) {
      result = result.filter((f) =>
        !f.allergens.some((a) => excludeAllergens.includes(a))
      );
    }

    switch (sortBy) {
      case 'time':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'quantity':
        result.sort((a, b) => b.remaining - a.remaining);
        break;
      case 'expiry':
        result.sort((a, b) => {
          const aExpiry = new Date(a.endTime).getTime() + a.edibleHours * 3600000;
          const bExpiry = new Date(b.endTime).getTime() + b.edibleHours * 3600000;
          return aExpiry - bExpiry;
        });
        break;
    }

    return result;
  }, [foods, searchQuery, categoryFilter, sortBy, excludeAllergens]);

  const toggleAllergen = (allergen: AllergenType) => {
    setExcludeAllergens((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen]
    );
  };

  const categories: { key: CategoryFilter; label: string; icon: typeof Apple }[] = [
    { key: 'all', label: '全部', icon: Sparkles },
    { key: 'fruit', label: '水果', icon: Apple },
    { key: 'snack', label: '点心', icon: Cookie },
    { key: 'beverage', label: '饮料', icon: Coffee },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 to-white">
      <div className="bg-gradient-to-r from-primary-500 via-primary-400 to-warm-400 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold mb-3">
              今日茶歇，别让美味浪费 🍰
            </h1>
            <p className="text-white/90 text-lg mb-6">
              会议结束的水果、点心和饮料，等你来认领。每一份都是心意，别让它们孤单。
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3">
                <div className="text-2xl font-bold">{stats.totalAvailable}</div>
                <div className="text-white/80 text-sm">可认领份数</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3">
                <div className="text-2xl font-bold">{stats.safeToTakeToday}</div>
                <div className="text-white/80 text-sm">今日安全可取</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3">
                <div className="text-2xl font-bold">{stats.todayClaimed}</div>
                <div className="text-white/80 text-sm">今日已认领</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 -mt-4 relative z-10">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-coffee-400" />
              <input
                type="text"
                placeholder="搜索食品名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-warm-50 border border-warm-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                  text-coffee-800 placeholder-coffee-400 transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-coffee-500" />
              <span className="text-sm text-coffee-600 font-medium">品类：</span>
              <div className="flex gap-1">
                {categories.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setCategoryFilter(key)}
                    className={`
                      flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${categoryFilter === key
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-warm-100 text-coffee-600 hover:bg-warm-200'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-warm-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-coffee-600 font-medium">排除过敏原：</span>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(ALLERGEN_LABELS) as AllergenType[]).map((allergen) => (
                  <button
                    key={allergen}
                    onClick={() => toggleAllergen(allergen)}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-medium transition-all
                      ${excludeAllergens.includes(allergen)
                        ? 'bg-red-500 text-white'
                        : 'bg-warm-100 text-coffee-500 hover:bg-warm-200'
                      }
                    `}
                  >
                    {ALLERGEN_LABELS[allergen]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-coffee-600 font-medium">排序：</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-1.5 bg-warm-50 border border-warm-200 rounded-lg text-sm
                  text-coffee-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="time">最新发布</option>
                <option value="quantity">剩余最多</option>
                <option value="expiry">即将过期</option>
              </select>
            </div>
          </div>
        </div>

        {filteredFoods.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFoods.map((food, index) => (
              <FoodCard key={food.id} food={food} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-warm-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Cookie className="w-12 h-12 text-coffee-300" />
            </div>
            <h3 className="text-xl font-bold text-coffee-700 mb-2">暂无可认领的食品</h3>
            <p className="text-coffee-500">试试调整筛选条件，或者稍后再来看看吧～</p>
          </div>
        )}
      </div>
    </div>
  );
}
