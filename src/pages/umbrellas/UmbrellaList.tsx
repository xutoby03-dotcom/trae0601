import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Umbrella as UmbrellaIcon,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  X,
} from 'lucide-react';
import { useUmbrellaStore } from '@/store/umbrellaStore';
import type { Umbrella, UmbrellaStatus } from '@/types';
import UmbrellaCard from '@/components/common/UmbrellaCard';
import StatusBadge from '@/components/common/StatusBadge';
import UmbrellaDetail from './UmbrellaDetail';
import clsx from 'clsx';

const STATUS_FILTERS: Array<{ label: string; value: UmbrellaStatus | 'all' }> = [
  { label: '全部', value: 'all' },
  { label: '可借', value: 'available' },
  { label: '借出中', value: 'lent' },
  { label: '破损', value: 'damaged' },
];

const sizeLabel = { small: '单人', medium: '双人', large: '加大' };

export default function UmbrellaList() {
  const navigate = useNavigate();
  const stores = useUmbrellaStore((s) => s.stores);
  const umbrellas = useUmbrellaStore((s) => s.umbrellas);
  const getStoreName = useUmbrellaStore((s) => s.getStoreName);

  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<UmbrellaStatus | 'all'>('all');
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selected, setSelected] = useState<Umbrella | null>(null);

  const colors = useMemo(() => {
    const set = new Set(umbrellas.map((u) => u.color));
    return Array.from(set);
  }, [umbrellas]);

  const filtered = useMemo(() => {
    return umbrellas.filter((u) => {
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      if (storeFilter !== 'all' && u.storeId !== storeFilter) return false;
      if (colorFilter !== 'all' && u.color !== colorFilter) return false;
      if (keyword.trim()) {
        const kw = keyword.trim().toLowerCase();
        if (!u.code.toLowerCase().includes(kw) && !u.color.toLowerCase().includes(kw)) {
          return false;
        }
      }
      return true;
    });
  }, [umbrellas, statusFilter, storeFilter, colorFilter, keyword]);

  const counts = useMemo(() => {
    const total = umbrellas.length;
    return {
      total,
      available: umbrellas.filter((u) => u.status === 'available').length,
      lent: umbrellas.filter((u) => u.status === 'lent').length,
      damaged: umbrellas.filter((u) => u.status === 'damaged').length,
    };
  }, [umbrellas]);

  const hasAnyFilter = keyword || statusFilter !== 'all' || storeFilter !== 'all' || colorFilter !== 'all';

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <UmbrellaIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-serif-sc text-2xl font-bold text-slate-900">雨伞档案</h1>
              <p className="mt-0.5 text-sm text-slate-500">
                共 {counts.total} 把 · 可借 {counts.available} · 借出中 {counts.lent} · 破损 {counts.damaged}
              </p>
            </div>
          </div>
        </div>
        <Link to="/umbrellas/new" className="btn-primary">
          <Plus className="h-4 w-4" /> 新增雨伞
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索编号或颜色..."
              className="input-base pl-9"
            />
            {keyword && (
              <button
                onClick={() => setKeyword('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 p-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={clsx(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                  statusFilter === f.value
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                value={storeFilter}
                onChange={(e) => setStoreFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="all">全部门店</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <select
                value={colorFilter}
                onChange={(e) => setColorFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="all">全部颜色</option>
                {colors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={clsx(
                  'p-1.5 rounded-md transition-colors',
                  viewMode === 'grid' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'
                )}
                title="网格视图"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  'p-1.5 rounded-md transition-colors',
                  viewMode === 'list' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'
                )}
                title="列表视图"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {hasAnyFilter && (
          <div className="flex items-center gap-2 pt-1 text-xs">
            <span className="text-slate-500">当前筛选：</span>
            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-teal-700">
              共 {filtered.length} 条结果
            </span>
            <button
              onClick={() => {
                setKeyword('');
                setStatusFilter('all');
                setStoreFilter('all');
                setColorFilter('all');
              }}
              className="text-slate-500 hover:text-slate-700 underline-offset-2 hover:underline"
            >
              清除筛选
            </button>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <UmbrellaIcon className="h-8 w-8" />
          </div>
          <p className="mt-4 text-slate-600">没有找到符合条件的雨伞</p>
          <Link to="/umbrellas/new" className="btn-primary mt-4">
            <Plus className="h-4 w-4" /> 新增一把雨伞
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((u) => (
            <UmbrellaCard key={u.id} umbrella={u} onView={setSelected} />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  雨伞
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  编号
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  规格
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  押金
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  所在门店
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  状态
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="whitespace-nowrap px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.photoUrl}
                        alt=""
                        className="h-11 w-11 rounded-lg object-cover ring-1 ring-slate-200"
                      />
                      <span className="text-sm font-medium text-slate-700">{u.color}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 font-mono text-sm font-semibold text-slate-900">
                    {u.code}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                    {sizeLabel[u.size]}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-teal-700">
                    ¥{u.deposit}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                    {getStoreName(u.storeId)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => setSelected(u)}
                        className="rounded-md px-2.5 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50"
                      >
                        详情
                      </button>
                      <button
                        onClick={() => navigate(`/umbrellas/${u.id}/edit`)}
                        className="rounded-md px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                      >
                        编辑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UmbrellaDetail umbrella={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
