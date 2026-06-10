import type { RouteCategory } from '@/types';
import { CATEGORY_LABELS } from '@/utils/constants';
import { useStore } from '@/store/useStore';

type TabValue = RouteCategory | 'all';

const tabs: { value: TabValue; label: string; emoji: string }[] = [
  { value: 'all', label: '全部路线', emoji: '📍' },
  ...(Object.entries(CATEGORY_LABELS) as [RouteCategory, typeof CATEGORY_LABELS[RouteCategory]][]).map(
    ([key, v]) => ({
      value: key,
      label: v.label,
      emoji: v.emoji,
    })
  ),
];

export default function CategoryTabs() {
  const { activeCategory, setActiveCategory } = useStore();

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = activeCategory === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => setActiveCategory(tab.value)}
            className={`group relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-900/40 scale-105'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
            }`}
          >
            <span className="text-base">{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
