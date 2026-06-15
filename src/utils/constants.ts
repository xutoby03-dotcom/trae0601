import type { Category, Channel, BillingCycle } from '@/types';

export const CATEGORY_OPTIONS: { value: Category; label: string; emoji: string; color: string }[] = [
  { value: 'entertainment', label: '娱乐', emoji: '🎬', color: '#F43F5E' },
  { value: 'education', label: '学习', emoji: '📚', color: '#8B5CF6' },
  { value: 'office', label: '办公', emoji: '💼', color: '#3B82F6' },
  { value: 'family', label: '家庭', emoji: '👨‍👩‍👧', color: '#10B981' },
  { value: 'other', label: '其他', emoji: '📦', color: '#6B7280' },
];

export const CHANNEL_OPTIONS: { value: Channel; label: string; emoji: string }[] = [
  { value: 'alipay', label: '支付宝', emoji: '💙' },
  { value: 'appstore', label: 'App Store', emoji: '🍎' },
  { value: 'wechat', label: '微信支付', emoji: '💚' },
  { value: 'credit_card', label: '信用卡', emoji: '💳' },
  { value: 'paypal', label: 'PayPal', emoji: '🅿️' },
  { value: 'bank', label: '银行卡', emoji: '🏦' },
  { value: 'other', label: '其他', emoji: '🔗' },
];

export const CYCLE_OPTIONS: { value: BillingCycle; label: string; multiplier: number }[] = [
  { value: 'weekly', label: '每周', multiplier: 52 },
  { value: 'monthly', label: '每月', multiplier: 12 },
  { value: 'quarterly', label: '每季', multiplier: 4 },
  { value: 'yearly', label: '每年', multiplier: 1 },
  { value: 'custom', label: '自定义', multiplier: 0 },
];

export const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;
