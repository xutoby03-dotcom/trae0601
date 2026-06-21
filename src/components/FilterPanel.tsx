import { useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import type { FilterCriteria, Season } from '@/types';
import { SEASON_LABELS } from '@/types';
import { useFilterStore } from '@/store/filterStore';

interface RangeFilterProps {
  label: string;
  minKey: keyof FilterCriteria;
  maxKey: keyof FilterCriteria;
  unit?: string;
  min?: number;
  max?: number;
}

function RangeFilter({ label, minKey, maxKey, unit = '', min = 0, max = 100 }: RangeFilterProps) {
  const criteria = useFilterStore((s) => s.criteria);
  const setCriteria = useFilterStore((s) => s.setCriteria);

  const currentMin = (criteria[minKey] as number) ?? min;
  const currentMax = (criteria[maxKey] as number) ?? max;

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-[#8B5A3C]">{label}</label>
        <span className="text-xs text-[#8B5A3C]/60">
          {currentMin}{unit} - {currentMax}{unit}
        </span>
      </div>
      <div className="flex gap-3 items-center">
        <input
          type="range"
          min={min}
          max={max}
          value={currentMin}
          onChange={(e) => setCriteria({ [minKey]: Number(e.target.value) })}
          className="flex-1 h-1.5 bg-[#8B5A3C]/10 rounded-full appearance-none cursor-pointer accent-[#8B5A3C]"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={currentMax}
          onChange={(e) => setCriteria({ [maxKey]: Number(e.target.value) })}
          className="flex-1 h-1.5 bg-[#8B5A3C]/10 rounded-full appearance-none cursor-pointer accent-[#3D5A45]"
        />
      </div>
    </div>
  );
}

export function FilterPanel() {
  const [isExpanded, setIsExpanded] = useState(true);
  const criteria = useFilterStore((s) => s.criteria);
  const setCriteria = useFilterStore((s) => s.setCriteria);
  const resetCriteria = useFilterStore((s) => s.resetCriteria);
  const search = criteria.search ?? '';

  const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter', 'all'];
  const selectedSeasons = criteria.season ?? [];

  const toggleSeason = (season: Season) => {
    const newSeasons = selectedSeasons.includes(season)
      ? selectedSeasons.filter((s) => s !== season)
      : [...selectedSeasons, season];
    setCriteria({ season: newSeasons.length > 0 ? newSeasons : undefined });
  };

  const hasActiveFilters = Object.keys(criteria).length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#8B5A3C]/10 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#8B5A3C]/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <SlidersHorizontal size={20} className="text-[#8B5A3C]" />
          <span className="font-serif text-lg text-[#8B5A3C]">筛选条件</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-[#8B5A3C]/10 rounded-full text-xs font-medium text-[#8B5A3C]">
              已启用
            </span>
          )}
        </div>
        <span className="text-[#8B5A3C]/50 text-sm">
          {isExpanded ? '收起' : '展开'}
        </span>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 border-t border-[#8B5A3C]/10 pt-4">
          <div className="relative mb-5">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B5A3C]/40" />
            <input
              type="text"
              placeholder="搜索面料名称、成分..."
              value={search}
              onChange={(e) => setCriteria({ search: e.target.value || undefined })}
              className="w-full pl-10 pr-10 py-2.5 bg-[#F8F4ED] border-0 rounded-lg text-sm text-[#8B5A3C] placeholder:text-[#8B5A3C]/40 focus:outline-none focus:ring-2 focus:ring-[#8B5A3C]/20"
            />
            {search && (
              <button
                onClick={() => setCriteria({ search: undefined })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B5A3C]/40 hover:text-[#8B5A3C]"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="mb-5">
            <label className="text-sm font-medium text-[#8B5A3C] block mb-3">适合季节</label>
            <div className="flex flex-wrap gap-2">
              {seasons.map((season) => (
                <button
                  key={season}
                  onClick={() => toggleSeason(season)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedSeasons.includes(season)
                      ? 'bg-[#8B5A3C] text-white'
                      : 'bg-[#F8F4ED] text-[#8B5A3C]/70 hover:bg-[#8B5A3C]/10'
                  }`}
                >
                  {SEASON_LABELS[season]}
                </button>
              ))}
            </div>
          </div>

          <RangeFilter label="克重范围" minKey="weightMin" maxKey="weightMax" unit="g" min={50} max={500} />
          <RangeFilter label="弹力" minKey="elasticityMin" maxKey="elasticityMax" unit="%" />
          <RangeFilter label="垂感" minKey="drapeMin" maxKey="drapeMax" unit="%" />
          <RangeFilter label="厚薄" minKey="thicknessMin" maxKey="thicknessMax" unit="%" />
          <RangeFilter label="透光性" minKey="translucencyMin" maxKey="translucencyMax" unit="%" />
          <RangeFilter label="柔软度" minKey="softnessMin" maxKey="softnessMax" unit="%" />
          <RangeFilter label="挺括度" minKey="stiffnessMin" maxKey="stiffnessMax" unit="%" />
          <RangeFilter label="粗糙度" minKey="roughnessMin" maxKey="roughnessMax" unit="%" />
          <RangeFilter label="凉感" minKey="coolnessMin" maxKey="coolnessMax" unit="%" />

          {hasActiveFilters && (
            <button
              onClick={resetCriteria}
              className="w-full mt-2 py-2 text-sm text-[#8B5A3C]/70 hover:text-[#8B5A3C] hover:bg-[#8B5A3C]/5 rounded-lg transition-colors"
            >
              清除所有筛选条件
            </button>
          )}
        </div>
      )}
    </div>
  );
}
