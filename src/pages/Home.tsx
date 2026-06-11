import { useState, useEffect } from 'react';
import { Search, AlertTriangle, Snowflake, Wine, Clock, X, Filter } from 'lucide-react';
import { usePackageStore } from '@/store/usePackageStore';
import PackageCard from '@/components/PackageCard';
import type { PackageStatus, PackageFilters } from '@/types';
import { STATUS_LABELS, DEPARTMENTS, COURIER_COMPANIES } from '@/types';

const tabs: { key: PackageStatus; color: string; dotColor: string }[] = [
  { key: 'new', color: 'text-indigo-700', dotColor: 'bg-indigo-500' },
  { key: 'pending', color: 'text-amber-700', dotColor: 'bg-amber-500' },
  { key: 'picked_up', color: 'text-emerald-700', dotColor: 'bg-emerald-500' },
  { key: 'abnormal', color: 'text-coral-700', dotColor: 'bg-coral-500' },
  { key: 'resolved', color: 'text-slate-700', dotColor: 'bg-slate-500' },
];

export default function Home() {
  const { packages, checkOverdue, getFilteredPackages, getStatusCounts, getOverduePackages } = usePackageStore();
  const [activeTab, setActiveTab] = useState<PackageStatus>('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PackageFilters>({});
  const counts = getStatusCounts();
  const overduePkgs = getOverduePackages();

  useEffect(() => {
    checkOverdue();
    const timer = setInterval(checkOverdue, 60000);
    return () => clearInterval(timer);
  }, [checkOverdue]);

  const filteredPkgs = getFilteredPackages(searchQuery, {
    ...filters,
    status: activeTab,
  });

  const toggleFilter = (key: keyof PackageFilters) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] ? undefined : true,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const hasActiveFilters =
    filters.isColdChain || filters.isFragile || filters.isOverdue || filters.department || filters.courierCompany;

  const activeChips: { label: string; onRemove: () => void }[] = [];
  if (filters.department) activeChips.push({ label: `部门：${filters.department}`, onRemove: () => setFilters((p) => ({ ...p, department: undefined })) });
  if (filters.courierCompany) activeChips.push({ label: `快递：${filters.courierCompany}`, onRemove: () => setFilters((p) => ({ ...p, courierCompany: undefined })) });
  if (filters.isColdChain) activeChips.push({ label: '冷藏件', onRemove: () => toggleFilter('isColdChain') });
  if (filters.isFragile) activeChips.push({ label: '易碎件', onRemove: () => toggleFilter('isFragile') });
  if (filters.isOverdue) activeChips.push({ label: '超时件', onRemove: () => toggleFilter('isOverdue') });

  return (
    <div className="p-6 max-w-5xl">
      {overduePkgs.length > 0 && (
        <div className="mb-6 bg-coral-500 text-white rounded-xl px-5 py-3.5 flex items-center gap-3 animate-slide-in shadow-lg shadow-coral-200/50">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse-slow">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <span className="font-semibold text-sm">{overduePkgs.length} 个包裹超时未取</span>
            <span className="text-coral-100 text-xs ml-2">请尽快处理</span>
          </div>
          <button
            onClick={() => { setActiveTab('abnormal'); setFilters({}); setSearchQuery(''); }}
            className="text-xs px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors font-medium"
          >
            查看详情
          </button>
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-primary-800">包裹管理</h2>
        <span className="text-xs text-warm-500">共 {packages.length} 件</span>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索收件人、取件码、快递公司、货架位置..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-warm-300/60 rounded-xl text-sm placeholder:text-warm-400 focus:border-primary-400 transition-colors"
        />
      </div>

      {activeChips.length > 0 && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {activeChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={chip.onRemove}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-200 font-medium hover:bg-primary-100 transition-colors"
            >
              {chip.label}
              <X className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warm-400" />
          <select
            value={filters.department || ''}
            onChange={(e) =>
              setFilters((p) => ({ ...p, department: e.target.value || undefined }))
            }
            className="pl-8 pr-7 py-2 bg-white border border-warm-300/60 rounded-lg text-xs text-warm-600 focus:border-primary-400 transition-colors appearance-none cursor-pointer hover:border-primary-300"
          >
            <option value="">全部部门</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warm-400" />
          <select
            value={filters.courierCompany || ''}
            onChange={(e) =>
              setFilters((p) => ({ ...p, courierCompany: e.target.value || undefined }))
            }
            className="pl-8 pr-7 py-2 bg-white border border-warm-300/60 rounded-lg text-xs text-warm-600 focus:border-primary-400 transition-colors appearance-none cursor-pointer hover:border-primary-300"
          >
            <option value="">全部快递</option>
            {COURIER_COMPANIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => toggleFilter('isColdChain')}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
            filters.isColdChain
              ? 'bg-ice-50 border-ice-300 text-ice-700 font-semibold'
              : 'bg-white border-warm-300/60 text-warm-500 hover:border-ice-200'
          }`}
        >
          <Snowflake className="w-3 h-3" />
          冷藏件
        </button>
        <button
          onClick={() => toggleFilter('isFragile')}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
            filters.isFragile
              ? 'bg-orange-50 border-orange-300 text-orange-700 font-semibold'
              : 'bg-white border-warm-300/60 text-warm-500 hover:border-orange-200'
          }`}
        >
          <Wine className="w-3 h-3" />
          易碎件
        </button>
        <button
          onClick={() => toggleFilter('isOverdue')}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
            filters.isOverdue
              ? 'bg-coral-50 border-coral-300 text-coral-700 font-semibold'
              : 'bg-white border-warm-300/60 text-warm-500 hover:border-coral-200'
          }`}
        >
          <Clock className="w-3 h-3" />
          超时件
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-warm-300/60 text-warm-500 bg-white hover:border-coral-300 hover:text-coral-600 hover:bg-coral-50 transition-all ml-auto"
          >
            <X className="w-3 h-3" />
            清空筛选
          </button>
        )}
      </div>

      <div className="flex gap-1 mb-5 bg-white rounded-xl p-1 border border-warm-200">
        {tabs.map(({ key, dotColor }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === key
                ? 'bg-primary-500 text-white shadow-md shadow-primary-200/50'
                : 'text-warm-500 hover:bg-warm-100'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeTab === key ? 'bg-white' : dotColor}`} />
            {STATUS_LABELS[key]}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === key ? 'bg-white/20 text-white' : 'bg-warm-200 text-warm-600'
              }`}
            >
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredPkgs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-warm-200 flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-warm-400" />
            </div>
            <p className="text-warm-500 text-sm">暂无{STATUS_LABELS[activeTab]}包裹</p>
          </div>
        ) : (
          filteredPkgs.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)
        )}
      </div>
    </div>
  );
}
