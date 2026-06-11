import { FilterType } from '@/types';
import { useAppStore } from '@/store';
import { Calendar, CalendarDays, Building2, Trees, Globe } from 'lucide-react';
import { cn } from '@/utils/helpers';

const filters: { key: FilterType; label: string; icon: typeof Globe }[] = [
  { key: 'all', label: '全部', icon: Globe },
  { key: 'today', label: '今天', icon: Calendar },
  { key: 'weekend', label: '周末', icon: CalendarDays },
  { key: 'indoor', label: '室内', icon: Building2 },
  { key: 'outdoor', label: '户外', icon: Trees },
];

export default function FilterTabs() {
  const currentFilter = useAppStore((s) => s.currentFilter);
  const setFilter = useAppStore((s) => s.setFilter);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
      {filters.map((f) => {
        const isActive = currentFilter === f.key;
        const Icon = f.icon;
        return (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 rounded-full font-medium whitespace-nowrap transition-all duration-200 shrink-0',
              isActive
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-soft scale-105'
                : 'bg-white text-ink-700 hover:bg-cream-100 border border-cream-300'
            )}
          >
            <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-primary-500')} />
            <span className="text-sm">{f.label}</span>
          </button>
        );
      })}
    </div>
  );
}
