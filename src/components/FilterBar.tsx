import { X } from 'lucide-react';
import { useFilterStore } from '@/stores';
import { cn } from '@/lib/utils';
import type { FilterState, EnergyLevel, Scene } from '@/types';

interface FilterOption {
  key: keyof FilterState;
  value: FilterState[keyof FilterState];
  label: string;
}

const WEATHER_OPTIONS: FilterOption[] = [
  { key: 'weather', value: 'sunny', label: '☀️晴天' },
  { key: 'weather', value: 'rainy', label: '🌧️下雨天' },
];

const DURATION_OPTIONS: FilterOption[] = [
  { key: 'maxDuration', value: 30, label: '⏱️<30分钟' },
  { key: 'maxDuration', value: 60, label: '⏱️30-60分钟' },
  { key: 'maxDuration', value: 999, label: '⏱️1小时+' },
];

const BUDGET_OPTIONS: FilterOption[] = [
  { key: 'maxBudget', value: 0, label: '💰免费' },
  { key: 'maxBudget', value: 50, label: '💰50以内' },
  { key: 'maxBudget', value: 9999, label: '💰不限' },
];

const ENERGY_OPTIONS: FilterOption[] = [
  { key: 'energyLevel', value: 'low' as EnergyLevel, label: '🐢轻松' },
  { key: 'energyLevel', value: 'medium' as EnergyLevel, label: '🏃适中' },
  { key: 'energyLevel', value: 'high' as EnergyLevel, label: '🔥旺盛' },
];

const SCENE_OPTIONS: FilterOption[] = [
  { key: 'scene', value: 'indoor' as Scene, label: '🏠室内' },
  { key: 'scene', value: 'outdoor' as Scene, label: '🌳室外' },
];

const ALL_GROUPS = [WEATHER_OPTIONS, DURATION_OPTIONS, BUDGET_OPTIONS, ENERGY_OPTIONS, SCENE_OPTIONS];

export default function FilterBar() {
  const { filter, setFilter, clearFilter } = useFilterStore();

  const isActive = (opt: FilterOption) => filter[opt.key] === opt.value;

  const handleToggle = (opt: FilterOption) => {
    if (isActive(opt)) {
      setFilter({ [opt.key]: undefined });
    } else {
      setFilter({ [opt.key]: opt.value });
    }
  };

  const hasAnyFilter = Object.values(filter).some((v) => v !== undefined);

  return (
    <div className="w-full overflow-x-auto scrollbar-hide py-2">
      <div className="flex items-center gap-2 min-w-max px-1">
        {ALL_GROUPS.flatMap((group, gi) =>
          [
            ...group.map((opt) => (
              <button
                key={`${opt.key}-${String(opt.value)}`}
                onClick={() => handleToggle(opt)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap',
                  'transition-all duration-200 border-2',
                  isActive(opt)
                    ? 'bg-[#4ECDC4] text-white border-[#4ECDC4] shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#4ECDC4]/50'
                )}
              >
                {opt.label}
              </button>
            )),
            ...(gi < ALL_GROUPS.length - 1
              ? [<div key={`sep-${gi}`} className="w-px h-5 bg-gray-200 mx-1" />]
              : []),
          ]
        )}

        {hasAnyFilter && (
          <button
            onClick={clearFilter}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium text-gray-400 hover:text-gray-600 whitespace-nowrap transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            清除
          </button>
        )}
      </div>
    </div>
  );
}
