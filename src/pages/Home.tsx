import { Link } from 'react-router-dom';
import { ChevronRight, Plus, Droplets, Calendar, Sun, CheckCircle } from 'lucide-react';
import { useCleaningStore } from '@/store/cleaningStore';
import { CATEGORY_LABELS, GROUP_LABELS, type ItemStatusGroup, type CleaningItem } from '@/types';
import { getDaysUntilNextClean, formatDateChinese, getNextCleanDate } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

const groupIcons: Record<ItemStatusGroup, React.ReactNode> = {
  needClean: <Droplets className="w-5 h-5" />,
  scheduled: <Calendar className="w-5 h-5" />,
  drying: <Sun className="w-5 h-5" />,
  completed: <CheckCircle className="w-5 h-5" />,
};

const groupColors: Record<ItemStatusGroup, string> = {
  needClean: 'bg-red-50 text-red-600 border-red-100',
  scheduled: 'bg-blue-50 text-blue-600 border-blue-100',
  drying: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  completed: 'bg-green-50 text-green-600 border-green-100',
};

const groupBgColors: Record<ItemStatusGroup, string> = {
  needClean: 'bg-red-500',
  scheduled: 'bg-blue-500',
  drying: 'bg-yellow-500',
  completed: 'bg-green-500',
};

const Home = () => {
  const { getGroupedItems, items } = useCleaningStore();
  const groupedItems = getGroupedItems();

  const groups: ItemStatusGroup[] = ['needClean', 'scheduled', 'drying', 'completed'];

  const renderItemCard = (item: CleaningItem, group: ItemStatusGroup) => {
    const daysUntil = getDaysUntilNextClean(item.lastCleanDate, item.suggestedCycleDays);
    
    return (
      <Link
        key={item.id}
        to={`/items/${item.id}`}
        className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:bg-gray-50"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900">{item.name}</h3>
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                {CATEGORY_LABELS[item.category]}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{item.room}</p>
            {group === 'needClean' && (
              <p className={cn(
                'text-sm mt-2 font-medium',
                daysUntil < 0 ? 'text-red-600' : 'text-orange-500'
              )}>
                {daysUntil < 0 
                  ? `已逾期 ${Math.abs(daysUntil)} 天` 
                  : daysUntil === 0 
                    ? '今天就该洗了' 
                    : `还有 ${daysUntil} 天该洗了`}
              </p>
            )}
            {group === 'completed' && (
              <p className="text-sm text-gray-500 mt-2">
                下次清洗：{formatDateChinese(getNextCleanDate(item.lastCleanDate, item.suggestedCycleDays))}
              </p>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </Link>
    );
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">清洗计划</h1>
          <p className="text-sm text-gray-500 mt-1">
            共 {items.length} 件物品
          </p>
        </div>
        <Link
          to="/items/new"
          className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加物品
        </Link>
      </div>

      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn('w-2 h-2 rounded-full', groupBgColors[group])} />
                <h2 className="font-semibold text-gray-800">
                  {GROUP_LABELS[group]}
                </h2>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full border',
                  groupColors[group]
                )}>
                  {groupedItems[group].length} 件
                </span>
              </div>
              {groupedItems[group].length > 3 && (
                <Link to="/items" className="text-sm text-blue-600 flex items-center">
                  查看全部 <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
            
            {groupedItems[group].length === 0 ? (
              <div className={cn(
                'rounded-xl p-6 text-center border',
                groupColors[group]
              )}>
                <div className="opacity-50">{groupIcons[group]}</div>
                <p className="text-sm mt-2 opacity-70">
                  暂无{GROUP_LABELS[group]}的物品
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {groupedItems[group].slice(0, 3).map((item) => renderItemCard(item, group))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
