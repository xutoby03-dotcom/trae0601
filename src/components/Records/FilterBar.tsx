import { useCoffeeStore } from '@/store/coffeeStore';
import { GRINDER_OPTIONS, DRIPPER_OPTIONS, RoastLevel } from '@/types';
import { Filter, RotateCcw } from 'lucide-react';

export default function FilterBar() {
  const filters = useCoffeeStore((s) => s.filters);
  const setFilters = useCoffeeStore((s) => s.setFilters);
  const records = useCoffeeStore((s) => s.records);

  const beanNames = [...new Set(records.map((r) => r.beanName))].sort();

  const handleReset = () => {
    setFilters({
      beanName: '',
      roastLevel: 'all',
      grinder: '',
      dripper: '',
    });
  };

  const hasActiveFilters =
    filters.beanName || filters.roastLevel !== 'all' || filters.grinder || filters.dripper;

  return (
    <div className="card mb-4">
      <div className="px-5 py-3 bg-coffee-50 border-b border-coffee-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-coffee-600" />
          <span className="font-semibold text-coffee-700 text-sm">筛选条件</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-coffee-500 hover:text-coffee-700 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            重置
          </button>
        )}
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="label">豆名</label>
            <select
              className="select"
              value={filters.beanName}
              onChange={(e) => setFilters({ beanName: e.target.value })}
            >
              <option value="">全部豆子</option>
              {beanNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">烘焙度</label>
            <select
              className="select"
              value={filters.roastLevel}
              onChange={(e) => setFilters({ roastLevel: e.target.value as RoastLevel | 'all' })}
            >
              <option value="all">全部烘焙度</option>
              <option value="light">浅烘</option>
              <option value="medium">中烘</option>
              <option value="dark">深烘</option>
            </select>
          </div>
          <div>
            <label className="label">磨豆机</label>
            <select
              className="select"
              value={filters.grinder}
              onChange={(e) => setFilters({ grinder: e.target.value })}
            >
              <option value="">全部磨豆机</option>
              {GRINDER_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">滤杯</label>
            <select
              className="select"
              value={filters.dripper}
              onChange={(e) => setFilters({ dripper: e.target.value })}
            >
              <option value="">全部滤杯</option>
              {DRIPPER_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
