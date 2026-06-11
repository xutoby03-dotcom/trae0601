import type { TastingItem, Feedback, TastingStats, TastingStatus } from '@/types';

export function calculateAverageRating(feedbacks: Feedback[]): number {
  if (feedbacks.length === 0) return 0;
  const sum = feedbacks.reduce((acc, f) => acc + f.overallRating, 0);
  return Math.round((sum / feedbacks.length) * 10) / 10;
}

export function calculateRatingStdDev(feedbacks: Feedback[]): number {
  if (feedbacks.length < 2) return 0;
  const avg = calculateAverageRating(feedbacks);
  const squaredDiffs = feedbacks.map(f => Math.pow(f.overallRating - avg, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / feedbacks.length;
  return Math.sqrt(variance);
}

export function calculatePurchaseRates(feedbacks: Feedback[]) {
  if (feedbacks.length === 0) {
    return { yes: 0, maybe: 0, no: 0 };
  }
  const yes = feedbacks.filter(f => f.purchaseIntent === 'yes').length;
  const maybe = feedbacks.filter(f => f.purchaseIntent === 'maybe').length;
  const no = feedbacks.filter(f => f.purchaseIntent === 'no').length;
  const total = feedbacks.length;
  return {
    yes: Math.round((yes / total) * 100),
    maybe: Math.round((maybe / total) * 100),
    no: Math.round((no / total) * 100),
  };
}

export function calculateDimensionAverages(feedbacks: Feedback[]) {
  if (feedbacks.length === 0) {
    return { sweetness: 0, saltiness: 0, spiciness: 0, portion: 0, packaging: 0 };
  }
  const total = feedbacks.length;
  return {
    sweetness: Math.round((feedbacks.reduce((a, f) => a + f.sweetness, 0) / total) * 10) / 10,
    saltiness: Math.round((feedbacks.reduce((a, f) => a + f.saltiness, 0) / total) * 10) / 10,
    spiciness: Math.round((feedbacks.reduce((a, f) => a + f.spiciness, 0) / total) * 10) / 10,
    portion: Math.round((feedbacks.reduce((a, f) => a + f.portion, 0) / total) * 10) / 10,
    packaging: Math.round((feedbacks.reduce((a, f) => a + f.packaging, 0) / total) * 10) / 10,
  };
}

export function determineStatus(item: TastingItem, feedbacks: Feedback[]): TastingStatus {
  if (item.status === 'ready') return 'ready';

  const feedbackCount = feedbacks.length;
  const avgRating = calculateAverageRating(feedbacks);
  const stdDev = calculateRatingStdDev(feedbacks);

  if (feedbackCount >= 10) {
    if (avgRating >= 4.2) return 'popular';
    if (stdDev >= 1.2) return 'controversial';
  }

  return 'collecting';
}

export function calculateOverallStats(
  items: TastingItem[],
  feedbacks: Feedback[]
): TastingStats {
  const totalItems = items.length;
  const totalFeedbacks = feedbacks.length;
  const avgRating = calculateAverageRating(feedbacks);
  const purchaseRates = calculatePurchaseRates(feedbacks);

  const topFlavors = items.map(item => {
    const itemFeedbacks = feedbacks.filter(f => f.tastingItemId === item.id);
    const avg = calculateAverageRating(itemFeedbacks);
    const rates = calculatePurchaseRates(itemFeedbacks);
    return {
      item,
      avgRating: avg,
      feedbackCount: itemFeedbacks.length,
      purchaseYesRate: rates.yes,
    };
  })
    .filter(f => f.feedbackCount >= 5)
    .sort((a, b) => b.avgRating - a.avgRating);

  return {
    totalItems,
    totalFeedbacks,
    avgRating,
    purchaseYesRate: purchaseRates.yes,
    purchaseMaybeRate: purchaseRates.maybe,
    purchaseNoRate: purchaseRates.no,
    topFlavors,
  };
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return '已截止';
  if (days === 0) return '今天截止';
  if (days === 1) return '明天截止';
  if (days <= 7) return `${days}天后截止`;

  return `${date.getMonth() + 1}月${date.getDate()}日截止`;
}

export function daysLeft(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
