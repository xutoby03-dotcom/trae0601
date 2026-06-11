import { cn } from '@/lib/utils';
import type { SeasoningStatusFilter } from '@/types';

interface StatusFilterProps {
  current: SeasoningStatusFilter;
  onChange: (status: SeasoningStatusFilter) => void;
}

const filters: { key: SeasoningStatusFilter; label: string; icon: string }[] = [
  { key: 'all', label: '全部', icon: '📋' },
  { key: 'fresh', label: '正常', icon: '✅' },
  { key: 'soon', label: '快到期', icon: '⏰' },
  { key: 'expired', label: '已过期', icon: '⚠️' },
  { key: 'restock', label: '补货', icon: '🛒' },
];

export default function StatusFilter({ current, onChange }: StatusFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
            current === f.key
              ? 'bg-primary-500 text-white shadow-md scale-105'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          <span>{f.icon}</span>
          <span>{f.label}</span>
        </button>
      ))}
    </div>
  );
}
