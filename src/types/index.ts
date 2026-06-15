export type Category = 'entertainment' | 'education' | 'office' | 'family' | 'other';
export type Channel = 'alipay' | 'appstore' | 'wechat' | 'credit_card' | 'paypal' | 'bank' | 'other';
export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export interface PriceHistory {
  date: string;
  from: number;
  to: number;
}

export interface Subscription {
  id: string;
  name: string;
  purpose: string;
  category: Category;
  channel: Channel;
  channelCustom?: string;
  billingCycle: BillingCycle;
  cycleDays?: number;
  amount: number;
  currency: string;
  nextBillingDate: string;
  lastBillingDate?: string;
  logoEmoji: string;
  screenshot?: string;
  familyMembers: string[];
  isTrial: boolean;
  trialEndDate?: string;
  trialReminderDays?: number;
  isPriceIncreased: boolean;
  priceHistory: PriceHistory[];
  cardFailCount: number;
  duplicateOfId?: string;
  lastConfirmedAt?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface SubscriptionFilters {
  category: Category | 'all';
  search: string;
  onlyUnconfirmed: boolean;
  onlyTrial: boolean;
}

export interface CategoryStat {
  category: Category;
  label: string;
  emoji: string;
  monthlyTotal: number;
  annualTotal: number;
  count: number;
  color: string;
}

export interface SmartSuggestion {
  id: string;
  type: 'unconfirmed' | 'duplicate' | 'price_hike' | 'trial_ending' | 'high_cost';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  subscriptionIds: string[];
  potentialSaving?: number;
}
