import { cn } from '@/lib/utils';
import type { TastingStatus } from '@/types';
import { STATUS_LABELS, STATUS_COLORS } from '@/types';
import { useTastingStore } from '@/store/useTastingStore';

interface StatusTabsProps {
  activeTab: TastingStatus | 'all';
  onTabChange: (tab: TastingStatus | 'all') => void;
}

export function StatusTabs({ activeTab, onTabChange }: StatusTabsProps) {
  const items = useTastingStore(state => state.items);

  const tabs: Array<{ key: TastingStatus | 'all'; label: string }> = [
    { key: 'all', label: '全部' },
    { key: 'collecting', label: '收集中' },
    { key: 'popular', label: '好评高' },
    { key: 'controversial', label: '争议大' },
    { key: 'ready', label: '准备上架' },
  ];

  const getCount = (key: TastingStatus | 'all') => {
    if (key === 'all') return items.length;
    return items.filter(i => i.status === key).length;
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              'flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
              'whitespace-nowrap flex items-center gap-2',
              isActive
                ? 'bg-primary-500 text-white shadow-warm'
                : 'bg-white text-brown-600 hover:bg-brown-50 border border-brown-200'
            )}
          >
            {tab.label}
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs',
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-brown-100 text-brown-600'
              )}
            >
              {getCount(tab.key)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
