import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronRight, Clock, AlertTriangle } from 'lucide-react';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import {
  cn, formatCurrency, formatShortDate, getDaysUntil, isInDoubtZone,
  getCategoryInfo, getChannelInfo, getUpcomingSubscriptions, generateSmartSuggestions,
} from '@/utils/helpers';

export default function UpcomingList() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const upcoming = useMemo(() => getUpcomingSubscriptions(subscriptions, 14), [subscriptions]);
  const suggestions = useMemo(() => generateSmartSuggestions(subscriptions), [subscriptions]);
  const unconfirmed = suggestions.find((s) => s.type === 'unconfirmed');
  const openEdit = useSubscriptionStore((s) => s.openEditModal);

  return (
    <div className="glass-card p-5 md:p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <Bell className="w-4 h-4 text-amber-400" />
          </div>
          <h2 className="font-display font-bold text-lg">即将扣费</h2>
        </div>
        <Link
          to="/subscriptions"
          className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-0.5 transition-colors"
        >
          查看全部 <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {unconfirmed && (
        <Link to="/subscriptions" className="mb-4 block">
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-red-500/10 border border-amber-500/25 hover:border-amber-500/40 transition-colors cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 pulse-glow">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-amber-200">犹豫区提醒</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {unconfirmed.subscriptionIds.length} 项订阅已 3 个月未确认
                  {unconfirmed.potentialSaving && (
                    <span className="text-amber-400 ml-1">
                      · 可省约 ¥{unconfirmed.potentialSaving}/年
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </Link>
      )}

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 -mr-1 stagger">
        {upcoming.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-sm text-slate-400">未来两周没有扣费安排</p>
            <p className="text-xs text-slate-500 mt-1">省心！</p>
          </div>
        ) : (
          upcoming.map((sub) => {
            const daysUntil = getDaysUntil(sub.nextBillingDate);
            const cat = getCategoryInfo(sub.category);
            const ch = getChannelInfo(sub.channel);
            const doubt = isInDoubtZone(sub);

            return (
              <div
                key={sub.id}
                onClick={() => openEdit(sub.id)}
                className={cn(
                  'p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/15',
                  'cursor-pointer transition-all duration-200 group',
                  doubt && 'opacity-70'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: `${cat.color}18` }}
                  >
                    {sub.logoEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{sub.name}</p>
                      {sub.isTrial && (
                        <span className="tag bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                          试用
                        </span>
                      )}
                      {doubt && (
                        <span className="tag bg-amber-500/15 text-amber-400 border border-amber-500/25">
                          待复核
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        {ch.emoji} {ch.label}
                      </span>
                      <span>·</span>
                      <span style={{ color: cat.color }}>{cat.label}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display font-bold text-teal-300 tabular-nums">
                      {formatCurrency(sub.amount)}
                    </div>
                    <div
                      className={cn(
                        'inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium',
                        daysUntil === 0 && 'bg-teal-500/20 text-teal-300',
                        daysUntil === 1 && 'bg-amber-500/20 text-amber-300',
                        daysUntil === 2 && 'bg-orange-500/20 text-orange-300',
                        daysUntil >= 3 && 'bg-slate-500/20 text-slate-300'
                      )}
                    >
                      <Clock className="w-3 h-3" />
                      {daysUntil === 0 ? '今天' : daysUntil === 1 ? '明天' : `${daysUntil}天后`}
                      <span className="text-slate-500 ml-0.5">· {formatShortDate(sub.nextBillingDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
