import { Check, Edit2, Link, Trash2, TrendingUp, Users, X } from 'lucide-react';
import { useState } from 'react';
import type { Subscription } from '@/types';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import {
  cn, formatCurrency, formatShortDate, getAnnualAmount, getDaysSinceConfirmed,
  getDaysUntil, getMonthlyEquivalent, isInDoubtZone,
  getCategoryInfo, getChannelInfo, getCycleLabel,
} from '@/utils/helpers';

interface Props {
  subscription: Subscription;
}

export default function SubscriptionCard({ subscription: sub }: Props) {
  const confirmUsage = useSubscriptionStore((s) => s.confirmUsage);
  const openEdit = useSubscriptionStore((s) => s.openEditModal);
  const deleteSubscription = useSubscriptionStore((s) => s.deleteSubscription);
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);

  const [confirmAnim, setConfirmAnim] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const cat = getCategoryInfo(sub.category);
  const ch = getChannelInfo(sub.channel);
  const doubt = isInDoubtZone(sub);
  const daysSince = getDaysSinceConfirmed(sub);
  const daysUntil = getDaysUntil(sub.nextBillingDate);
  const duplicateOf = sub.duplicateOfId ? subscriptions.find((x) => x.id === sub.duplicateOfId) : null;
  const lastHike = sub.priceHistory[sub.priceHistory.length - 1];

  const handleConfirm = () => {
    setConfirmAnim(true);
    confirmUsage(sub.id);
    setTimeout(() => setConfirmAnim(false), 600);
  };

  return (
    <div
      className={cn(
        'glass-card glass-card-hover p-4 md:p-5 relative overflow-hidden',
        doubt && 'ring-1 ring-amber-500/20'
      )}
      style={{ animationDelay: '0s' }}
    >
      {doubt && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
      )}

      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 relative"
          style={{
            background: `linear-gradient(135deg, ${cat.color}25, ${cat.color}08)`,
            boxShadow: `inset 0 0 0 1px ${cat.color}30`,
          }}
        >
          {sub.logoEmoji}
          {doubt && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-[8px] text-white font-bold ring-2 ring-background">
              !
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-bold text-base md:text-lg truncate">{sub.name}</h3>
                {sub.isTrial && (
                  <span className="tag bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    🧪 试用期
                    {sub.trialEndDate && getDaysUntil(sub.trialEndDate) >= 0 && (
                      <span className="ml-1">· {getDaysUntil(sub.trialEndDate)}天后</span>
                    )}
                  </span>
                )}
                {sub.isPriceIncreased && (
                  <span className="tag bg-red-500/15 text-red-300 border border-red-500/30">
                    <TrendingUp className="w-3 h-3" /> 涨价
                    {lastHike && <span className="ml-1">¥{lastHike.from}→¥{lastHike.to}</span>}
                  </span>
                )}
                {sub.duplicateOfId && (
                  <span className="tag bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">
                    <Link className="w-3 h-3" /> 重复 · {duplicateOf?.name}
                  </span>
                )}
                {sub.cardFailCount > 0 && (
                  <span className="tag bg-orange-500/15 text-orange-300 border border-orange-500/30">
                    ⚠️ 换卡失败 {sub.cardFailCount}次
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-slate-400 mt-1 line-clamp-1">
                {sub.purpose || '暂无用途描述'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="font-display font-bold text-xl md:text-2xl text-teal-300 tabular-nums leading-none">
                {formatCurrency(sub.amount)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
                月均 {formatCurrency(getMonthlyEquivalent(sub))} · 年 {formatCurrency(getAnnualAmount(sub))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cat.color }} />
              <span>{cat.label}</span>
            </div>
            <div className="inline-flex items-center gap-1 text-xs text-slate-400">
              {ch.emoji} <span>{ch.label}{sub.channelCustom && ` (${sub.channelCustom})`}</span>
            </div>
            <div className="inline-flex items-center gap-1 text-xs text-slate-400">
              <span className="font-medium">{getCycleLabel(sub.billingCycle)}</span>
              {sub.billingCycle === 'custom' && sub.cycleDays && ` (${sub.cycleDays}天)`}
            </div>
            <div
              className={cn(
                'inline-flex items-center gap-1 text-xs',
                daysUntil < 3 && 'text-amber-400 font-medium',
                daysUntil >= 3 && 'text-slate-400'
              )}
            >
              下次扣费：
              <span className="font-medium">
                {formatShortDate(sub.nextBillingDate)}
                {daysUntil >= 0 && ` · ${daysUntil === 0 ? '今天' : `${daysUntil}天后`}`}
              </span>
            </div>
            {sub.familyMembers.length > 0 && (
              <div className="inline-flex items-center gap-1 text-xs text-slate-400">
                <Users className="w-3 h-3" />
                <span>{sub.familyMembers.length}人共享</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-white/5">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              {doubt ? (
                <span className="text-amber-400 font-medium">
                  ⚠️ 上次确认 {daysSince} 天前 · 建议复核
                </span>
              ) : (
                <span>
                  <Check className="w-3 h-3 text-teal-500 inline" /> {daysSince === 0 ? '今天刚确认' : `${daysSince} 天前已确认`}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {showDelete ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">确定删除？</span>
                  <button
                    onClick={() => {
                      deleteSubscription(sub.id);
                      setShowDelete(false);
                    }}
                    className="btn-danger !px-3 !py-1.5 text-xs"
                  >
                    <Check className="w-3 h-3" /> 是
                  </button>
                  <button
                    onClick={() => setShowDelete(false)}
                    className="btn-secondary !px-3 !py-1.5 text-xs"
                  >
                    <X className="w-3 h-3" /> 否
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleConfirm}
                    className={cn(
                      'btn-secondary !px-3.5 !py-1.5 text-xs gap-1.5 relative overflow-hidden',
                      confirmAnim && '!bg-teal-500/25 !border-teal-500/40 !text-teal-300',
                      doubt && '!bg-amber-500/15 !border-amber-500/30 !text-amber-300 hover:!bg-amber-500/25'
                    )}
                  >
                    <Check className={cn('w-3.5 h-3.5 transition-transform', confirmAnim && 'scale-125')} />
                    <span className="font-medium">还在用吗？</span>
                  </button>
                  <button
                    onClick={() => openEdit(sub.id)}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDelete(true)}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
