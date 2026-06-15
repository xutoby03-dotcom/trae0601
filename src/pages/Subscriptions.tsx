import { useMemo, useState } from 'react';
import { Plus, Search, Filter, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { CATEGORY_OPTIONS } from '@/utils/constants';
import { cn, formatCurrency, isInDoubtZone } from '@/utils/helpers';
import SubscriptionCard from '@/components/SubscriptionCard';

export default function Subscriptions() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const filters = useSubscriptionStore((s) => s.filters);
  const setFilters = useSubscriptionStore((s) => s.setFilters);
  const openAddModal = useSubscriptionStore((s) => s.openAddModal);

  const allFiltered = useMemo(() => {
    let result = subscriptions;
    if (filters.category !== 'all') {
      result = result.filter((s) => s.category === filters.category);
    }
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.purpose.toLowerCase().includes(q)
      );
    }
    if (filters.onlyTrial) {
      result = result.filter((s) => s.isTrial);
    }
    return result.sort(
      (a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime()
    );
  }, [subscriptions, filters]);

  const doubtSubs = useMemo(() => allFiltered.filter(isInDoubtZone), [allFiltered]);
  const activeSubs = useMemo(() => allFiltered.filter((s) => !isInDoubtZone(s)), [allFiltered]);
  const [showDoubtOnly, setShowDoubtOnly] = useState(false);

  const displayList = showDoubtOnly ? doubtSubs : allFiltered;
  const unconfirmedCount = useMemo(() => subscriptions.filter(isInDoubtZone).length, [subscriptions]);

  const categoryList = [{ value: 'all' as const, label: '全部', emoji: '📋' }, ...CATEGORY_OPTIONS];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">
            订阅管理
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            共 <span className="text-slate-200 font-medium">{subscriptions.length}</span> 项订阅，
            其中 <span className="text-amber-400 font-medium">{unconfirmedCount}</span> 项超过3个月未复核
          </p>
        </div>
        <button onClick={openAddModal} className="btn-primary sm:w-auto w-full sm:shrink-0">
          <Plus className="w-4 h-4" />
          <span>添加新订阅</span>
        </button>
      </div>

      <div className="glass-card p-4 md:p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="input-base !pl-10"
              placeholder="搜索服务名称或用途..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-500 shrink-0 md:ml-2" />
            {categoryList.map((c) => (
              <button
                key={c.value}
                onClick={() => setFilters({ category: c.value })}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap',
                  filters.category === c.value
                    ? 'bg-teal-500/25 text-teal-300 border border-teal-500/40'
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-slate-200'
                )}
              >
                <span className="mr-1">{c.emoji}</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-white/5">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!filters.onlyTrial}
              onChange={(e) => setFilters({ onlyTrial: e.target.checked })}
              className="w-4 h-4 rounded accent-teal-500"
            />
            <span className="text-xs text-slate-400">🧪 只看试用期</span>
          </label>
          {unconfirmedCount > 0 && (
            <button
              onClick={() => setShowDoubtOnly(!showDoubtOnly)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ml-auto',
                showDoubtOnly
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
              )}
            >
              {showDoubtOnly ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {showDoubtOnly ? '显示全部' : `仅显示犹豫区 (${doubtSubs.length})`}
            </button>
          )}
        </div>
      </div>

      {showDoubtOnly && doubtSubs.length > 0 && (
        <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-red-500/10 border border-amber-500/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/25 flex items-center justify-center shrink-0 pulse-glow">
              <AlertTriangle className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-amber-200">⚠️ 犹豫区提醒</h3>
              <p className="text-sm text-amber-300/80 mt-1">
                以下 <span className="font-bold">{doubtSubs.length}</span> 项订阅已超过 90 天未确认，可能是无意识扣费。
                点击「还在用吗？」更新状态，或考虑取消。
                潜在可节省：<span className="font-bold text-amber-200">{formatCurrency(
                  doubtSubs.reduce((s, x) => s + x.amount * 12, 0)
                )}</span>/年
              </p>
            </div>
          </div>
        </div>
      )}

      {displayList.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="font-display font-bold text-xl mb-2">没有符合条件的订阅</h3>
          <p className="text-sm text-slate-400 mb-6">
            {filters.search || filters.category !== 'all' || filters.onlyTrial
              ? '试试调整搜索条件或分类筛选'
              : '还没有添加任何订阅，开始记录你的第一个自动扣费吧'}
          </p>
          <button onClick={openAddModal} className="btn-primary">
            <Plus className="w-4 h-4" />
            <span>添加第一个订阅</span>
          </button>
        </div>
      ) : (
        <>
          {!showDoubtOnly && doubtSubs.length > 0 && activeSubs.length > 0 && (
            <div className="flex items-center gap-2 pt-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-amber-500/30" />
              <span className="text-xs text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 inline-flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {doubtSubs.length} 项在犹豫区 · 建议优先复核
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-500/30 to-amber-500/30" />
            </div>
          )}
          <div className="space-y-3 stagger">
            {displayList.map((sub) => (
              <SubscriptionCard key={sub.id} subscription={sub} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
