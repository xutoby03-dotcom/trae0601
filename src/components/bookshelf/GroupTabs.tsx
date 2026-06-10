import type { BookGroup } from '@/types';
import { Sparkles, Flame, Clock, Ban as BanIcon, Library } from 'lucide-react';

interface GroupTabsProps {
  active: BookGroup;
  onChange: (g: BookGroup) => void;
  counts: Record<BookGroup, number>;
}

const tabs: { key: BookGroup; label: string; icon: typeof Sparkles; hint: string }[] = [
  { key: 'new', label: '新放入', icon: Sparkles, hint: '7天内登记' },
  { key: 'hot', label: '热门', icon: Flame, hint: '借阅+评论最多' },
  { key: 'pending-return', label: '待归还', icon: Clock, hint: '借阅中' },
  { key: 'idle', label: '长期闲置', icon: BanIcon, hint: '30天未动' },
  { key: 'all', label: '全部图书', icon: Library, hint: '书柜全景' },
];

export const GroupTabs = ({ active, onChange, counts }: GroupTabsProps) => {
  return (
    <div className="flex flex-wrap gap-2 md:gap-3 items-center justify-center md:justify-start">
      {tabs.map(({ key, label, icon: Icon, hint }) => {
        const isActive = active === key;
        const count = counts[key] || 0;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            title={hint}
            className={`group relative flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-300
              ${isActive
                ? 'bg-wood-700 text-paper-50 shadow-lg scale-[1.02]'
                : 'bg-white text-wood-700 border border-wood-200 hover:border-wood-400 hover:bg-paper-100 shadow-sm'
              }`}
          >
            <Icon
              className={`w-4 h-4 transition-transform duration-300 ${
                isActive ? 'text-accent-orange' : 'group-hover:scale-110'
              }`}
            />
            <span>{label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors duration-300
                ${isActive ? 'bg-white/20 text-paper-100' : 'bg-wood-100 text-wood-600 group-hover:bg-wood-200'}`}
            >
              {count}
            </span>
            {key === 'new' && count > 0 && !isActive && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent-brick animate-ping" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default GroupTabs;
