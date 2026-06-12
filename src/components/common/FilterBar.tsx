import { useMemo } from 'react';
import { Building2, PawPrint, Search, X } from 'lucide-react';
import { usePetStore, selectBuildings } from '../../store/usePetStore';
import { FilterState } from '../../../shared/types';
import { computeAllPetsWithStatus } from '../../utils/status';
import { STATUS_LABEL } from '../../utils/status';

export function FilterBar() {
  const pets = usePetStore((s) => s.pets);
  const records = usePetStore((s) => s.vaccineRecords);
  const filter = usePetStore((s) => s.filter);
  const setFilter = usePetStore((s) => s.setFilter);
  const resetFilter = usePetStore((s) => s.resetFilter);

  const buildings = useMemo(() => selectBuildings(pets), [pets]);
  const petsWithStatus = useMemo(
    () => computeAllPetsWithStatus(pets, records),
    [pets, records]
  );

  const hasAnyFilter =
    filter.building !== 'all' ||
    filter.petType !== 'all' ||
    filter.status !== 'all' ||
    !!filter.keyword;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="搜索宠物名 / 主人 / 电话 / 楼栋..."
          value={filter.keyword}
          onChange={(e) => setFilter({ keyword: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 transition focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <Select
        icon={Building2}
        value={filter.building}
        onChange={(v) => setFilter({ building: v })}
        options={[
          { value: 'all', label: '全部楼栋' },
          ...buildings.map((b) => ({ value: b, label: b })),
        ]}
      />

      <Select
        icon={PawPrint}
        value={filter.petType}
        onChange={(v) => setFilter({ petType: v as FilterState['petType'] })}
        options={[
          { value: 'all', label: '全部种类' },
          { value: 'dog', label: '🐶 狗狗' },
          { value: 'cat', label: '🐱 猫咪' },
          { value: 'other', label: '🐾 其他' },
        ]}
      />

      <Select
        icon={null}
        value={filter.status}
        onChange={(v) => setFilter({ status: v as FilterState['status'] })}
        options={[
          { value: 'all', label: '全部状态' },
          { value: 'compliant', label: `✅ ${STATUS_LABEL.compliant}` },
          { value: 'expiring', label: `⚠️ ${STATUS_LABEL.expiring}` },
          { value: 'expired', label: `❌ ${STATUS_LABEL.expired}` },
          { value: 'unvaccinated', label: `🔴 ${STATUS_LABEL.unvaccinated}` },
        ]}
      />

      {hasAnyFilter && (
        <button
          onClick={resetFilter}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
        >
          <X className="h-3.5 w-3.5" />
          清除筛选 · 共 {petsWithStatus.length}
        </button>
      )}
    </div>
  );
}

function Select({
  icon: Icon,
  value,
  onChange,
  options,
}: {
  icon: any;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-sm text-slate-800 transition focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {Icon && (
        <Icon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      )}
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}
