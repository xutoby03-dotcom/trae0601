import { useMemo } from 'react';
import { TrendingDown, TrendingUp, Wallet, Calendar, PiggyBank, Activity } from 'lucide-react';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import {
  formatCurrency, formatMonthLabel, getMonthlyTotal, getNextMonthStr,
  getTotalAnnual, getTotalMonthly, getProjectedBillingsForMonth,
} from '@/utils/helpers';
import { cn } from '@/utils/helpers';

interface StatCard {
  label: string;
  value: string;
  subtext?: string;
  trend?: { direction: 'up' | 'down' | 'flat'; value?: string };
  icon: typeof Wallet;
  color: string;
  bg: string;
}

export default function SummaryCards() {
  const selectedMonth = useSubscriptionStore((s) => s.selectedMonth);
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);

  const monthlySum = useMemo(() => getMonthlyTotal(subscriptions, selectedMonth), [subscriptions, selectedMonth]);
  const nextMonth = useMemo(() => getNextMonthStr(selectedMonth), [selectedMonth]);
  const nextMonthSum = useMemo(() => getMonthlyTotal(subscriptions, nextMonth), [subscriptions, nextMonth]);
  const monthlyProjection = useMemo(() => getTotalMonthly(subscriptions), [subscriptions]);
  const annualProjection = useMemo(() => getTotalAnnual(subscriptions), [subscriptions]);
  const projectedBillings = useMemo(() => getProjectedBillingsForMonth(subscriptions, selectedMonth), [subscriptions, selectedMonth]);
  const billingCount = useMemo(() => projectedBillings.reduce((sum, d) => sum + d.subs.length, 0), [projectedBillings]);

  const activeCount = subscriptions.length;
  const dailyAverage = monthlyProjection / 30;

  const cards: StatCard[] = [
    {
      label: `${formatMonthLabel(selectedMonth)} 已排扣费`,
      value: formatCurrency(monthlySum),
      subtext: `已排 ${billingCount} 笔`,
      icon: Calendar,
      color: 'text-teal-400',
      bg: 'from-teal-500/20 to-transparent',
    },
    {
      label: '再下月预估',
      value: formatCurrency(nextMonthSum),
      subtext: `较${formatMonthLabel(selectedMonth)} ${nextMonthSum - monthlySum >= 0 ? '增加' : '减少'} ${formatCurrency(Math.abs(nextMonthSum - monthlySum))}`,
      trend: {
        direction: nextMonthSum - monthlySum >= 0 ? 'up' : 'down',
        value: `${nextMonthSum > 0 ? Math.round(((nextMonthSum - monthlySum) / (monthlySum || 1)) * 100) : 0}%`,
      },
      icon: Wallet,
      color: 'text-amber-400',
      bg: 'from-amber-500/20 to-transparent',
    },
    {
      label: '年度预估花费',
      value: formatCurrency(annualProjection),
      subtext: `含 ${activeCount} 项订阅（年化）`,
      icon: PiggyBank,
      color: 'text-sky-400',
      bg: 'from-sky-500/20 to-transparent',
    },
    {
      label: '日均开销',
      value: formatCurrency(dailyAverage),
      subtext: `一杯${dailyAverage > 30 ? '星巴克' : dailyAverage > 15 ? '咖啡' : '奶茶'}的钱`,
      icon: Activity,
      color: 'text-fuchsia-400',
      bg: 'from-fuchsia-500/20 to-transparent',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger">
      {cards.map((card) => (
        <div
          key={card.label}
          className="glass-card glass-card-hover p-5 relative overflow-hidden group"
        >
          <div
            className={cn(
              'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
              card.bg.replace(' to-transparent', '')
            )}
          />
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400 font-medium">{card.label}</p>
            </div>
            <div
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center',
                'bg-gradient-to-br from-white/5 to-white/0 border border-white/10',
                'group-hover:scale-110 transition-transform'
              )}
            >
              <card.icon className={cn('w-4.5 h-4.5', card.color)} />
            </div>
          </div>
          <p className="font-display font-bold text-2xl md:text-3xl tracking-tight mb-1.5">
            {card.value}
          </p>
          <div className="flex items-center gap-2 text-xs">
            {card.trend && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-medium',
                  card.trend.direction === 'up' ? 'text-red-400' : card.trend.direction === 'down' ? 'text-teal-400' : 'text-slate-400'
                )}
              >
                {card.trend.direction === 'up' && <TrendingUp className="w-3 h-3" />}
                {card.trend.direction === 'down' && <TrendingDown className="w-3 h-3" />}
                {card.trend.value}
              </span>
            )}
            <span className="text-slate-500">{card.subtext}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
