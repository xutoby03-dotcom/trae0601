import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInDays,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
} from 'date-fns';
import type { BillingCycle, CategoryStat, SmartSuggestion, Subscription } from '@/types';
import { CATEGORY_OPTIONS, CHANNEL_OPTIONS, CYCLE_OPTIONS, THREE_MONTHS_MS } from './constants';

export const cn = (...inputs: (string | undefined | null | false)[]): string => {
  return inputs.filter(Boolean).join(' ');
};

export const formatCurrency = (amount: number, currency = 'CNY'): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
};

export const formatShortDate = (date: string | Date): string => {
  return format(new Date(date), 'M月d日');
};

export const formatFullDate = (date: string | Date): string => {
  return format(new Date(date), 'yyyy年M月d日');
};

export const getDaysUntil = (dateStr: string): number => {
  return differenceInDays(startOfDay(new Date(dateStr)), startOfDay(new Date()));
};

export const getAnnualAmount = (sub: Subscription): number => {
  const cycle = CYCLE_OPTIONS.find((c) => c.value === sub.billingCycle);
  if (sub.billingCycle === 'custom' && sub.cycleDays) {
    return sub.amount * (365 / sub.cycleDays);
  }
  return sub.amount * (cycle?.multiplier || 12);
};

export const getMonthlyEquivalent = (sub: Subscription): number => {
  return getAnnualAmount(sub) / 12;
};

export const calculateNextBillingDate = (
  cycle: BillingCycle,
  lastDate: string | Date,
  cycleDays?: number
): Date => {
  const base = new Date(lastDate);
  switch (cycle) {
    case 'weekly':
      return addWeeks(base, 1);
    case 'monthly':
      return addMonths(base, 1);
    case 'quarterly':
      return addMonths(base, 3);
    case 'yearly':
      return addYears(base, 1);
    case 'custom':
      return addDays(base, cycleDays || 30);
  }
};

export const isInDoubtZone = (sub: Subscription): boolean => {
  const now = Date.now();
  const lastCheck = sub.lastConfirmedAt
    ? new Date(sub.lastConfirmedAt).getTime()
    : new Date(sub.createdAt).getTime();
  return now - lastCheck > THREE_MONTHS_MS;
};

export const getDaysSinceConfirmed = (sub: Subscription): number => {
  const lastCheck = sub.lastConfirmedAt
    ? new Date(sub.lastConfirmedAt).getTime()
    : new Date(sub.createdAt).getTime();
  return Math.floor((Date.now() - lastCheck) / (24 * 60 * 60 * 1000));
};

export const getCategoryLabel = (cat: string): string => {
  return CATEGORY_OPTIONS.find((c) => c.value === cat)?.label || cat;
};

export const getCategoryInfo = (cat: string) => {
  return CATEGORY_OPTIONS.find((c) => c.value === cat) || CATEGORY_OPTIONS[4];
};

export const getChannelLabel = (ch: string, custom?: string): string => {
  if (custom) return custom;
  return CHANNEL_OPTIONS.find((c) => c.value === ch)?.label || ch;
};

export const getChannelInfo = (ch: string) => {
  return CHANNEL_OPTIONS.find((c) => c.value === ch) || CHANNEL_OPTIONS[6];
};

export const getCycleLabel = (cycle: string): string => {
  return CYCLE_OPTIONS.find((c) => c.value === cycle)?.label || cycle;
};

export const getSubscriptionsForMonth = (
  subs: Subscription[],
  monthStr: string
): { date: string; subs: Subscription[] }[] => {
  const [year, month] = monthStr.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const result: { date: string; subs: Subscription[] }[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dayDate = new Date(year, month - 1, d);
    const dayStr = format(dayDate, 'yyyy-MM-dd');
    const daySubs = subs.filter((s) => isSameDay(new Date(s.nextBillingDate), dayDate));
    result.push({ date: dayStr, subs: daySubs });
  }

  return result;
};

export const getMonthlyTotal = (subs: Subscription[], monthStr: string): number => {
  const [year, month] = monthStr.split('-').map(Number);
  return subs.reduce((total, sub) => {
    const billingDate = new Date(sub.nextBillingDate);
    if (billingDate.getFullYear() === year && billingDate.getMonth() === month - 1) {
      return total + sub.amount;
    }
    return total;
  }, 0);
};

export const getUpcomingSubscriptions = (subs: Subscription[], days = 7): Subscription[] => {
  const now = startOfDay(new Date());
  const end = addDays(now, days);
  return subs
    .filter((s) => {
      const d = new Date(s.nextBillingDate);
      return !isBefore(d, now) && !isAfter(d, end);
    })
    .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());
};

export const getCategoryStats = (subs: Subscription[]): CategoryStat[] => {
  return CATEGORY_OPTIONS.map((cat) => {
    const catSubs = subs.filter((s) => s.category === cat.value);
    const monthlyTotal = catSubs.reduce((sum, s) => sum + getMonthlyEquivalent(s), 0);
    return {
      category: cat.value,
      label: cat.label,
      emoji: cat.emoji,
      color: cat.color,
      monthlyTotal,
      annualTotal: monthlyTotal * 12,
      count: catSubs.length,
    };
  }).filter((s) => s.count > 0);
};

export const getTotalAnnual = (subs: Subscription[]): number => {
  return subs.reduce((sum, s) => sum + getAnnualAmount(s), 0);
};

export const getTotalMonthly = (subs: Subscription[]): number => {
  return subs.reduce((sum, s) => sum + getMonthlyEquivalent(s), 0);
};

export const generateSmartSuggestions = (subs: Subscription[]): SmartSuggestion[] => {
  const suggestions: SmartSuggestion[] = [];

  const unconfirmed = subs.filter(isInDoubtZone);
  if (unconfirmed.length > 0) {
    suggestions.push({
      id: 'unconfirmed-1',
      type: 'unconfirmed',
      severity: 'high',
      title: `${unconfirmed.length} 项订阅超过 3 个月未确认`,
      description: '建议复核这些订阅是否仍在使用，可能是无意识扣费。',
      subscriptionIds: unconfirmed.map((s) => s.id),
      potentialSaving: Math.round(unconfirmed.reduce((sum, s) => sum + getAnnualAmount(s), 0)),
    });
  }

  subs.forEach((sub) => {
    if (sub.isTrial && sub.trialEndDate) {
      const daysLeft = getDaysUntil(sub.trialEndDate);
      if (daysLeft >= 0 && daysLeft <= (sub.trialReminderDays || 3)) {
        suggestions.push({
          id: `trial-${sub.id}`,
          type: 'trial_ending',
          severity: 'high',
          title: `「${sub.name}」试用期即将结束`,
          description: `还剩 ${daysLeft} 天，请在 ${sub.trialReminderDays || 3} 天内决定是否取消，否则将自动扣费 ¥${sub.amount}。`,
          subscriptionIds: [sub.id],
          potentialSaving: Math.round(getAnnualAmount(sub)),
        });
      }
    }
  });

  if (subs.filter((s) => s.isPriceIncreased).length > 0) {
    const hiked = subs.filter((s) => s.isPriceIncreased);
    suggestions.push({
      id: 'price-hike-1',
      type: 'price_hike',
      severity: 'medium',
      title: `${hiked.length} 项订阅发生过涨价`,
      description: '可以考虑是否有更划算的替代方案。',
      subscriptionIds: hiked.map((s) => s.id),
    });
  }

  const duplicates = subs.filter((s) => s.duplicateOfId);
  if (duplicates.length > 0) {
    suggestions.push({
      id: 'duplicate-1',
      type: 'duplicate',
      severity: 'high',
      title: `检测到 ${duplicates.length} 项重复订阅`,
      description: '这些订阅标记为重复，建议合并或取消其中之一。',
      subscriptionIds: duplicates.map((s) => s.id),
      potentialSaving: Math.round(duplicates.reduce((sum, s) => sum + getAnnualAmount(s), 0)),
    });
  }

  const byCategory: Record<string, Subscription[]> = {};
  subs.forEach((s) => {
    byCategory[s.category] = byCategory[s.category] || [];
    byCategory[s.category].push(s);
  });
  Object.values(byCategory).forEach((list) => {
    if (list.length >= 3) {
      const total = list.reduce((sum, s) => sum + getMonthlyEquivalent(s), 0);
      if (total > 200) {
        suggestions.push({
          id: `high-${list[0].category}`,
          type: 'high_cost',
          severity: 'low',
          title: `「${getCategoryLabel(list[0].category)}」类月开销较高`,
          description: `共 ${list.length} 项，月均 ${formatCurrency(total)}，可评估是否全部必要。`,
          subscriptionIds: list.map((s) => s.id),
        });
      }
    }
  });

  return suggestions.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });
};

export const getPreviousMonthStr = (monthStr: string): string => {
  const [y, m] = monthStr.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return format(d, 'yyyy-MM');
};

export const getNextMonthStr = (monthStr: string): string => {
  const [y, m] = monthStr.split('-').map(Number);
  const d = new Date(y, m, 1);
  return format(d, 'yyyy-MM');
};

export const formatMonthLabel = (monthStr: string): string => {
  const [y, m] = monthStr.split('-').map(Number);
  return `${y}年${m}月`;
};

export const isToday = (dateStr: string): boolean => {
  return isSameDay(new Date(dateStr), new Date());
};

export const isCurrentMonth = (dateStr: string, monthStr: string): boolean => {
  return isSameMonth(new Date(dateStr), new Date(monthStr + '-01'));
};
