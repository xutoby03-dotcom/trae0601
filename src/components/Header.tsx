import { useState } from 'react';
import { Search, Plus, Filter, Sparkles, Navigation } from 'lucide-react';
import { useWaxStore } from '@/store/useWaxStore';
import { STATUS_ORDER, ROD_POSITION_OPTIONS } from '@/utils/constants';
import type { RodPosition } from '@/types';
import StatBadge from './StatBadge';
import WaxForm from './WaxForm';

interface HeaderProps {
  scrollToTop: () => void;
}

export default function Header({ scrollToTop }: HeaderProps) {
  const [showForm, setShowForm] = useState(false);
  const {
    getStatusCounts,
    searchKeyword,
    setSearchKeyword,
    defectFilter,
    setDefectFilter,
    rodFilter,
    setRodFilter,
    items,
  } = useWaxStore();

  const counts = getStatusCounts();
  const totalWithDefects = items.filter((i) => i.defects.length > 0).length;

  return (
    <header className="relative z-10 border-b border-gold-600/15 backdrop-blur-md bg-ink-950/70">
      <div className="max-w-[1800px] mx-auto px-6 py-5">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 via-gold-600 to-gold-800 flex items-center justify-center shadow-gold">
                <Sparkles className="w-6 h-6 text-ink-950" strokeWidth={2.5} />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-jade-500 animate-pulse-gold" />
            </div>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-black tracking-wide bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 bg-clip-text text-transparent">
                金工坊 · 蜡模编号管理
              </h1>
              <p className="text-xs text-ink-500 mt-1 font-mono tracking-wider">
                WAX MOLD TRACKING SYSTEM · 修蜡 → 检查 → 装树 → 待铸
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {STATUS_ORDER.map((s) => (
              <StatBadge key={s} status={s} count={counts[s]} />
            ))}
            {totalWithDefects > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-ruby-600/15 border border-ruby-600/40 animate-pulse-ruby">
                <span className="w-2 h-2 rounded-full bg-ruby-500" />
                <span className="text-xs font-serif text-ruby-400">问题待处理</span>
                <span className="text-xs font-mono font-bold text-ruby-300 bg-ruby-600/30 px-1.5 py-0.5 rounded">
                  {totalWithDefects}
                </span>
              </div>
            )}
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span className="font-serif">新增蜡模</span>
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
            <input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索客户单号 / 戒圈号 / 主石尺寸 / 蜡模编号..."
              className="input-field pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gold-500" />
            <select
              value={defectFilter}
              onChange={(e) => setDefectFilter(e.target.value as 'all' | 'has' | 'none')}
              className="select-field w-[160px]"
            >
              <option value="all">全部蜡模</option>
              <option value="has">仅问题蜡模</option>
              <option value="none">无缺陷蜡模</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-gold-500 rotate-45" />
            <select
              value={rodFilter}
              onChange={(e) => setRodFilter(e.target.value as RodPosition | 'all')}
              className="select-field w-[140px]"
            >
              <option value="all">全部方位</option>
              {ROD_POSITION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {(searchKeyword || defectFilter !== 'all' || rodFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchKeyword('');
                setDefectFilter('all');
                setRodFilter('all');
              }}
              className="btn-ghost text-xs"
            >
              清除全部筛选
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <WaxForm
          onClose={() => {
            setShowForm(false);
            scrollToTop();
          }}
        />
      )}
    </header>
  );
}
