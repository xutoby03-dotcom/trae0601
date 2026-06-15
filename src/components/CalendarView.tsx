import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import {
  cn, formatCurrency, formatMonthLabel, formatShortDate, getDaysUntil, isToday,
  getCategoryInfo, getChannelInfo, getSubscriptionsForMonth,
} from '@/utils/helpers';
import { format } from 'date-fns';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function CalendarView() {
  const selectedMonth = useSubscriptionStore((s) => s.selectedMonth);
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const goToPrev = useSubscriptionStore((s) => s.goToPrevMonth);
  const goToNext = useSubscriptionStore((s) => s.goToNextMonth);
  const goToCurrent = useSubscriptionStore((s) => s.goToCurrentMonth);
  const calendarData = useMemo(() => getSubscriptionsForMonth(subscriptions, selectedMonth), [subscriptions, selectedMonth]);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);

  const [year, month] = selectedMonth.split('-').map(Number);
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const currentMonthStr = format(new Date(), 'yyyy-MM');

  const gridCells: (string | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) gridCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    gridCells.push(format(new Date(year, month - 1, d), 'yyyy-MM-dd'));
  }

  const getDayHeatClass = (subs: any[]) => {
    if (!subs.length) return '';
    const total = subs.reduce((s, x) => s + x.amount, 0);
    if (total >= 200) return 'bg-gradient-to-br from-red-500/30 to-red-600/15';
    if (total >= 100) return 'bg-gradient-to-br from-amber-500/30 to-amber-600/15';
    if (total >= 50) return 'bg-gradient-to-br from-teal-500/30 to-teal-600/15';
    return 'bg-gradient-to-br from-sky-500/25 to-sky-600/10';
  };

  return (
    <div className="glass-card p-5 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h2 className="font-display font-bold text-lg">扣费日历</h2>
          <button
            onClick={goToCurrent}
            className={cn(
              'text-[11px] px-2 py-1 rounded-full border transition-colors',
              currentMonthStr === selectedMonth
                ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200 hover:border-white/20'
            )}
          >
            本月
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={goToPrev}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-display font-semibold px-3 min-w-[110px] text-center">
            {formatMonthLabel(selectedMonth)}
          </span>
          <button
            onClick={goToNext}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="text-[11px] text-slate-500 font-medium text-center py-1.5"
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5 relative">
        {gridCells.map((dateStr, idx) => {
          if (!dateStr) return <div key={idx} className="aspect-square" />;
          const dayData = calendarData.find((d) => d.date === dateStr);
          const subs = dayData?.subs || [];
          const total = subs.reduce((s, x) => s + x.amount, 0);
          const dayNum = new Date(dateStr).getDate();
          const isHover = hoveredDate === dateStr;

          return (
            <div
              key={idx}
              className={cn(
                'aspect-square rounded-xl p-1.5 cursor-pointer relative transition-all duration-200',
                'border border-transparent hover:border-white/15',
                getDayHeatClass(subs),
                isToday(dateStr) && 'ring-2 ring-teal-500/50 ring-offset-1 ring-offset-background',
                isHover && subs.length > 0 && 'scale-[1.06] z-10 shadow-xl'
              )}
              onMouseEnter={(e) => {
                setHoveredDate(dateStr);
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const parent = (e.currentTarget as HTMLElement).offsetParent?.getBoundingClientRect();
                if (parent) {
                  setPopoverPos({
                    x: Math.min(rect.left - parent.left, (parent?.width || 400) - 260),
                    y: rect.bottom - parent.top + 8,
                  });
                }
              }}
              onMouseLeave={() => {
                setHoveredDate(null);
                setPopoverPos(null);
              }}
            >
              <div className="flex flex-col h-full">
                <div
                  className={cn(
                    'text-xs font-semibold leading-none',
                    isToday(dateStr) ? 'text-teal-300' : 'text-slate-300'
                  )}
                >
                  {dayNum}
                </div>
                <div className="flex-1 flex flex-col justify-end gap-0.5 overflow-hidden">
                  {subs.slice(0, 2).map((s) => (
                    <div
                      key={s.id}
                      className="text-[9px] leading-tight truncate rounded px-1 bg-black/30 backdrop-blur-sm"
                      style={{ color: getCategoryInfo(s.category).color }}
                    >
                      <span className="mr-0.5">{s.logoEmoji}</span>
                      {s.name}
                    </div>
                  ))}
                  {subs.length > 2 && (
                    <div className="text-[9px] text-slate-400 leading-tight px-1">
                      +{subs.length - 2} 更多
                    </div>
                  )}
                </div>
                {total > 0 && (
                  <div className="font-display text-[10px] font-bold text-right text-slate-100 mt-0.5 tabular-nums">
                    ¥{total}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {hoveredDate && popoverPos && (() => {
          const dayData = calendarData.find((d) => d.date === hoveredDate);
          const subs = dayData?.subs || [];
          if (!subs.length) return null;
          return (
            <div
              className="absolute z-20 w-64 glass-card p-3 pointer-events-none animate-fade-in"
              style={{ left: popoverPos.x, top: popoverPos.y }}
            >
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                <p className="font-display font-semibold text-sm">{formatShortDate(hoveredDate)}</p>
                <span className="text-xs text-slate-400">{subs.length} 笔</span>
              </div>
              <div className="space-y-2">
                {subs.map((s) => {
                  const cat = getCategoryInfo(s.category);
                  const ch = getChannelInfo(s.channel);
                  const daysUntil = getDaysUntil(s.nextBillingDate);
                  return (
                    <div key={s.id} className="flex items-start gap-2">
                      <div className="text-lg leading-none">{s.logoEmoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium truncate">{s.name}</p>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {ch.emoji} {ch.label} · {cat.label}
                          {daysUntil === 0 && ' · 今天'}
                          {daysUntil > 0 && ` · ${daysUntil}天后`}
                        </p>
                      </div>
                      <div className="font-display font-bold text-sm text-teal-300 tabular-nums">
                        ¥{s.amount}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400">当日合计</span>
                <span className="font-display font-bold text-amber-400">
                  {formatCurrency(subs.reduce((s, x) => s + x.amount, 0))}
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      <div className="flex items-center justify-end gap-4 mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="w-3 h-3 rounded bg-sky-500/30" />
          <span>&lt; ¥50</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="w-3 h-3 rounded bg-teal-500/30" />
          <span>¥50+</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="w-3 h-3 rounded bg-amber-500/30" />
          <span>¥100+</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="w-3 h-3 rounded bg-red-500/30" />
          <span>¥200+</span>
        </div>
      </div>
    </div>
  );
}
