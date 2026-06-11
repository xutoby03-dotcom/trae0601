export type TastingStatus = 'collecting' | 'popular' | 'controversial' | 'ready';

export type PurchaseIntent = 'yes' | 'no' | 'maybe';

export interface TastingItem {
  id: string;
  name: string;
  flavor: string;
  cost: number;
  targetAudience: string;
  totalPortions: number;
  imageUrl: string;
  deadline: string;
  status: TastingStatus;
  createdAt: string;
  description?: string;
}

export interface Feedback {
  id: string;
  tastingItemId: string;
  overallRating: number;
  sweetness: number;
  saltiness: number;
  spiciness: number;
  portion: number;
  packaging: number;
  purchaseIntent: PurchaseIntent;
  comment: string;
  createdAt: string;
}

export interface KeywordCount {
  word: string;
  count: number;
}

export interface TastingStats {
  totalItems: number;
  totalFeedbacks: number;
  avgRating: number;
  purchaseYesRate: number;
  purchaseMaybeRate: number;
  purchaseNoRate: number;
  topFlavors: Array<{
    item: TastingItem;
    avgRating: number;
    feedbackCount: number;
    purchaseYesRate: number;
  }>;
}

export const STATUS_LABELS: Record<TastingStatus, string> = {
  collecting: '收集中',
  popular: '好评高',
  controversial: '争议大',
  ready: '准备上架',
};

export const STATUS_COLORS: Record<TastingStatus, string> = {
  collecting: 'bg-blue-100 text-blue-700',
  popular: 'bg-green-100 text-green-700',
  controversial: 'bg-amber-100 text-amber-700',
  ready: 'bg-primary-100 text-primary-700',
};
