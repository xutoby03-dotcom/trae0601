import { useMemo } from 'react';
import { useWaxStore } from '@/store/useWaxStore';
import { STATUS_ORDER } from '@/utils/constants';
import type { WaxModel, WaxStatus } from '@/types';
import StatusColumn from './StatusColumn';

export default function KanbanBoard() {
  const { items, searchKeyword, defectFilter, rodFilter } = useWaxStore();
  const filtered = useMemo(() => {
    const kw = searchKeyword.trim().toLowerCase();
    return items.filter((it) => {
      if (kw) {
        const matched =
          it.id.toLowerCase().includes(kw) ||
          it.orderNo.toLowerCase().includes(kw) ||
          it.ringSize.toLowerCase().includes(kw) ||
          it.stoneSize.toLowerCase().includes(kw);
        if (!matched) return false;
      }
      if (defectFilter === 'has' && it.defects.length === 0) return false;
      if (defectFilter === 'none' && it.defects.length > 0) return false;
      if (rodFilter !== 'all' && it.rodPosition !== rodFilter) return false;
      return true;
    });
  }, [items, searchKeyword, defectFilter, rodFilter]);

  const grouped = useMemo(() => {
    const g: Record<WaxStatus, WaxModel[]> = {
      waxing: [],
      inspecting: [],
      treeing: [],
      casting: [],
    };
    filtered.forEach((it) => {
      g[it.status].push(it);
    });
    // 按更新时间倒序排列，最新的在上面
    (Object.keys(g) as WaxStatus[]).forEach((k) => {
      g[k].sort((a, b) => b.updatedAt - a.updatedAt);
    });
    return g;
  }, [filtered]);

  const total = filtered.length;

  return (
    <div className="relative z-10 flex-1 min-h-0 px-6 py-6">
      {total === 0 ? (
        <EmptyBoard />
      ) : (
        <div className="h-full flex gap-6 min-h-0">
          {STATUS_ORDER.map((status, idx) => (
            <div key={status} className="flex flex-col relative">
              {idx > 0 && (
                <div className="absolute left-[-12px] top-12 bottom-6 w-px bg-gradient-to-b from-transparent via-gold-600/15 to-transparent" />
              )}
              <StatusColumn status={status} items={grouped[status]} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyBoard() {
  return (
    <div className="h-full flex flex-col items-center justify-center py-24 text-center">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gold-500/20 via-gold-700/10 to-transparent border border-gold-600/30 flex items-center justify-center shadow-gold">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="w-12 h-12 text-gold-500"
          >
            <ellipse cx="24" cy="30" rx="16" ry="10" />
            <path d="M8 30c0-6 3-14 16-14s16 8 16 14" />
            <path d="M20 16l2-7 4 1 2-1" />
            <circle cx="24" cy="30" r="3" />
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-jade-600/80 animate-pulse-gold" />
      </div>

      <h2 className="font-serif text-xl font-bold text-gold-300 tracking-wide">
        开始录入您的第一件蜡模
      </h2>
      <p className="mt-3 text-sm text-ink-400 font-serif leading-relaxed max-w-sm">
        点击右上角「新增蜡模」按钮，录入客户单号、戒圈号、镶口形状等信息，
        <br className="hidden md:block" />
        即可建立完整的蜡模追踪档案。
      </p>

      <div className="mt-10 grid grid-cols-4 gap-4 max-w-2xl">
        {[
          { label: '修蜡', sub: 'Waxing', accent: 'from-gold-500/25 to-transparent border-gold-600/40' },
          { label: '检查', sub: 'Inspecting', accent: 'from-amber-500/25 to-transparent border-amber-600/40' },
          { label: '装树', sub: 'Treeing', accent: 'from-jade-500/25 to-transparent border-jade-600/40' },
          { label: '待铸', sub: 'Casting', accent: 'from-emerald-500/25 to-transparent border-emerald-600/40' },
        ].map((s, i) => (
          <div
            key={s.label}
            className={`p-4 rounded-xl bg-gradient-to-br ${s.accent} border animate-fade-in-up`}
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <p className="font-serif text-sm font-bold text-ink-100">
              {i + 1}. {s.label}
            </p>
            <p className="text-[10px] font-mono text-ink-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
