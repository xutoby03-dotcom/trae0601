import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useCleaningStore } from '@/store/cleaningStore';
import { CATEGORY_LABELS, type ItemCategory, type ItemStatusGroup, GROUP_LABELS } from '@/types';
import { getDaysUntilNextClean } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

const Items = () => {
  const { items, getItemStatusGroup } = useCleaningStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const filterCategory = searchParams.get('category') as ItemCategory | null;
  const filterStatus = searchParams.get('status') as ItemStatusGroup | null;

  const filteredItems = items.filter((item) => {
    if (searchText && !item.name.includes(searchText) && !item.room.includes(searchText)) {
      return false;
    }
    if (filterCategory && item.category !== filterCategory) {
      return false;
    }
    if (filterStatus) {
      const group = getItemStatusGroup(item);
      if (group !== filterStatus) {
        return false;
      }
    }
    return true;
  });

  const setFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const categories: ItemCategory[] = ['curtain', 'carpet', 'sofaCover', 'acFilter', 'other'];
  const statuses: ItemStatusGroup[] = ['needClean', 'scheduled', 'drying', 'completed'];

  const statusColor: Record<ItemStatusGroup, string> = {
    needClean: 'bg-red-100 text-red-600',
    scheduled: 'bg-blue-100 text-blue-600',
    drying: 'bg-yellow-100 text-yellow-600',
    completed: 'bg-green-100 text-green-600',
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">物品管理</h1>
        <Link
          to="/items/new"
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          添加
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="搜索物品名称或房间..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md',
            showFilter || filterCategory || filterStatus ? 'text-blue-600 bg-blue-50' : 'text-gray-400'
          )}
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {showFilter && (
        <div className="bg-white rounded-xl p-4 mb-4 border border-gray-100 shadow-sm">
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">物品类型</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('category', null)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm',
                  !filterCategory
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                全部
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter('category', cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm',
                    filterCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">状态</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('status', null)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm',
                  !filterStatus
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                全部
              </button>
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter('status', status)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm',
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {GROUP_LABELS[status]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">暂无物品</p>
            <Link
              to="/items/new"
              className="inline-block mt-3 text-blue-600 text-sm font-medium"
            >
              点击添加第一件物品
            </Link>
          </div>
        ) : (
          filteredItems.map((item) => {
            const group = getItemStatusGroup(item);
            const daysUntil = getDaysUntilNextClean(item.lastCleanDate, item.suggestedCycleDays);
            
            return (
              <Link
                key={item.id}
                to={`/items/${item.id}`}
                className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        statusColor[group]
                      )}>
                        {GROUP_LABELS[group]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                      <span>{item.room}</span>
                      <span>·</span>
                      <span>{CATEGORY_LABELS[item.category]}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {group === 'needClean'
                        ? daysUntil < 0
                          ? `已逾期 ${Math.abs(daysUntil)} 天`
                          : `还有 ${daysUntil} 天该清洗`
                        : group === 'scheduled'
                          ? '已预约清洗'
                          : group === 'drying'
                            ? '晾晒中'
                            : `建议每 ${item.suggestedCycleDays} 天清洗一次`}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Items;
