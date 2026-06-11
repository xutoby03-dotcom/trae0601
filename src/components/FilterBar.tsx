import { Building2, MapPin, Tag } from 'lucide-react';
import { useStrollerStore } from '@/store/useStrollerStore';
import { BUILDINGS, LOCATIONS, STATUS_OPTIONS } from '@/utils/constants';
import { cn } from '@/utils/helpers';

export default function FilterBar() {
  const { filters, setFilters } = useStrollerStore();

  return (
    <div className="card p-5 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="label">
            <Building2 className="inline w-4 h-4 mr-1.5 -mt-0.5" />
            楼栋筛选
          </label>
          <select
            className="input"
            value={filters.building}
            onChange={(e) => setFilters({ building: e.target.value })}
          >
            <option value="all">全部楼栋</option>
            {BUILDINGS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">
            <MapPin className="inline w-4 h-4 mr-1.5 -mt-0.5" />
            停放位置
          </label>
          <select
            className="input"
            value={filters.location}
            onChange={(e) => setFilters({ location: e.target.value })}
          >
            <option value="all">全部位置</option>
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">
            <Tag className="inline w-4 h-4 mr-1.5 -mt-0.5" />
            车辆状态
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilters({ status: 'all' })}
              className={cn(
                'px-3 py-2 rounded-xl text-sm font-medium border transition-all',
                filters.status === 'all'
                  ? 'bg-brand-700 text-white border-brand-700 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-brand-400 hover:text-brand-700'
              )}
            >
              全部
            </button>
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => setFilters({ status: s.value })}
                className={cn(
                  'px-3 py-2 rounded-xl text-sm font-medium border transition-all',
                  filters.status === s.value
                    ? `${s.bgClass} text-white border-transparent shadow-md`
                    : `bg-white ${s.textClass} border-slate-200 hover:border-current`
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
