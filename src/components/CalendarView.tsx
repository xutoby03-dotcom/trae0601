import { useMemo, useState } from 'react';
import {
  ChevronLeft, ChevronRight, X, Edit2, Users, AlertTriangle,
  Clock, Sparkles, CalendarOff,
} from 'lucide-react';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import {
  cn, formatCurrency, formatMonthLabel, formatShortDate, getDaysUntil, isToday,
  getCategoryInfo, getChannelInfo, getCycleLabel, getSubscriptionsForMonth,
} from '@/utils/helpers';
import type { Subscription } from '@/types';
import { format } from 'date-fns';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function CalendarView() {
  const selectedMonth = useSubscriptionStore((s) => s.selectedMonth);
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const goToPrev = useSubscriptionStore((s) => s.goToPrevMonth);
  const goToNext = useSubscriptionStore((s) => s.goToNextMonth);
  const goToCurrent = useSubscriptionStore((s) => s.goToCurrentMonth);
  const openEdit = useSubscriptionStore((s) => s.openEditModal);

  const calendarData = useMemo(
    () => getSubscriptionsForMonth(subscriptions, selectedMonth),
    [subscriptions, selectedMonth]
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [year, month] = selectedMonth.split('-').map(Number);
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const currentMonthStr = format(new Date(), 'yyyy-MM');

  const gridCells: (string | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) gridCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    gridCells.push(format(new Date(year, month - 1, d), 'yyyy-MM-dd'));
  }

  const getDayHeatClass = (subs: Subscription[]) => {
    if (!subs.length) return '';
    const total = subs.reduce((s, x) => s + x.amount, 0);
    if (total >= 200) return 'bg-gradient-to-br from-red-500/30 to-red-600/15';
    if (total >= 100) return 'bg-gradient-to-br from-amber-500/30 to-amber-600/15';
    if (total >= 50) return 'bg-gradient-to-br from-teal-500/30 to-teal-600/15';
    return 'bg-gradient-to-br from-sky-500/25 to-sky-600/10';
  };

  const selectedDayData = selectedDate
    ? calendarData.find((d) => d.date === selectedDate)
    : null;
  const selectedSubs = selectedDayData?.subs || [];
  const selectedTotal = selectedSubs.reduce((s, x) => s + x.amount, 0);

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

      <div className="grid grid-cols-7 gap-1.5">
        {gridCells.map((dateStr, idx) => {
          if (!dateStr) return <div key={idx} className="aspect-square" />;
          const dayData = calendarData.find((d) => d.date === dateStr);
          const subs = dayData?.subs || [];
          const total = subs.reduce((s, x) => s + x.amount, 0);
          const dayNum = new Date(dateStr).getDate();
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedDate(dateStr)}
              className={cn(
                'aspect-square rounded-xl p-1.5 text-left relative transition-all duration-200',
                'border hover:border-white/20',
                getDayHeatClass(subs),
                isToday(dateStr) && 'ring-2 ring-teal-500/60 ring-offset-1 ring-offset-background',
                isSelected
                  ? 'border-teal-400/60 scale-[1.04] z-10 shadow-xl shadow-teal-500/10'
                  : 'border-transparent'
              )}
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
            </button>
          );
        })}
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

      {selectedDate && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedDate(null)}
        >
          <div
            className="bg-surface border border-white/10 w-full md:max-w-lg md:rounded-2xl rounded-t-2xl shadow-2xl animate-fade-in-up overflow-hidden max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl">
                    {formatShortDate(selectedDate)}
                  </h3>
                  {selectedSubs.length > 0 ? (
                    <p className="text-sm text-slate-400 mt-0.5">
                      {selectedSubs.length} 笔扣费 · 合计{' '}
                      <span className="text-amber-400 font-semibold">
                        {formatCurrency(selectedTotal)}
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 mt-0.5">这天没有安排自动扣费 ✨</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4 overflow-y-auto flex-1">
              {selectedSubs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <CalendarOff className="w-7 h-7 text-slate-500" />
                  </div>
                  <p className="text-slate-300 font-medium">当天没有扣费</p>
                  <p className="text-slate-500 text-sm mt-1">
                    可以在日历里查看其他日期，或者去添加一个新订阅
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedSubs.map((s) => {
                    const cat = getCategoryInfo(s.category);
                    const ch = getChannelInfo(s.channel);
                    const daysUntil = getDaysUntil(selectedDate);
                    return (
                      <div
                        key={s.id + Math.random()}
                        className="p-4 rounded-xl bg-black/25 border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
                              style={{ background: cat.color + '22' }}
                            >
                              {s.logoEmoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-base truncate">{s.name}</p>
                                {s.isTrial && (
                                  <span className="tag tag-trial">🧪 试用期</span>
                                )}
                                {s.isPriceIncreased && (
                                  <span className="tag tag-warning">💰 已涨价</span>
                                )}
                                {s.duplicateOfId && (
                                  <span className="tag tag-error">🔗 重复订阅</span>
                                )}
                                {s.cardFailCount > 0 && (
                                  <span className="tag tag-error">
                                    ❌ 换卡失败×{s.cardFailCount}
                                  </span>
                                )}
                              </div>
                              {s.purpose && (
                                <p className="text-xs text-slate-400 mt-0.5 truncate">
                                  {s.purpose}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-display font-bold text-xl text-teal-300 tabular-nums">
                              {formatCurrency(s.amount)}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {daysUntil === 0 ? '今天扣' : daysUntil > 0 ? `${daysUntil}天后扣` : `${Math.abs(daysUntil)}天前扣过`}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs mb-3 pt-3 border-t border-white/5">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <span className="w-1 h-1 rounded-full bg-slate-500" />
                            <span>渠道</span>
                            <span className="text-slate-200 ml-1">
                              {ch.emoji} {ch.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <span className="w-1 h-1 rounded-full bg-slate-500" />
                            <span>周期</span>
                            <span className="text-slate-200 ml-1">
                              {getCycleLabel(s.billingCycle)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <span className="w-1 h-1 rounded-full bg-slate-500" />
                            <span>分类</span>
                            <span style={{ color: cat.color }} className="ml-1 font-medium">
                              {cat.emoji} {cat.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <span className="w-1 h-1 rounded-full bg-slate-500" />
                            <span>下次</span>
                            <span className="text-slate-200 ml-1">
                              {formatShortDate(selectedDate)}
                            </span>
                          </div>
                        </div>

                        {s.familyMembers && s.familyMembers.length > 0 && (
                          <div className="flex items-start gap-2 text-xs mb-3">
                            <Users className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                            <div className="flex flex-wrap gap-1.5">
                              {s.familyMembers.map((name) => (
                                <span
                                  key={name}
                                  className="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 text-[11px] border border-sky-500/20"
                                >
                                  👤 {name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {s.notes && (
                          <div className="flex items-start gap-2 text-xs mb-3 bg-amber-500/10 border border-amber-500/15 rounded-lg p-2.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                            <p className="text-amber-200/80 leading-relaxed">{s.notes}</p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2 border-t border-white/5">
                          <button
                            onClick={() => {
                              openEdit(s.id);
                              setSelectedDate(null);
                            }}
                            className="flex-1 h-8 rounded-lg bg-teal-500/15 text-teal-300 hover:bg-teal-500/25 transition-colors flex items-center justify-center gap-1.5 text-xs font-medium"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            编辑这个订阅
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
