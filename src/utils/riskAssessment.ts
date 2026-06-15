import type { FoodItem, RiskAssessment, RiskLevel } from '@/types';
import { daysBetween, hoursBetween, addDays } from './dateUtils';

const riskPriority: Record<RiskLevel, number> = {
  high: 3,
  medium: 2,
  low: 1,
  none: 0,
};

function upgradeLevel(current: RiskLevel, target: RiskLevel): RiskLevel {
  return riskPriority[target] > riskPriority[current] ? target : current;
}

export function assessRisk(food: FoodItem): RiskAssessment {
  const reasons: string[] = [];
  let level: RiskLevel = 'none';

  const frozenDays = daysBetween(food.frozenDate, new Date());
  const expiryDate = addDays(food.frozenDate, food.shelfLifeDays);
  const daysUntilExpiry = daysBetween(new Date(), expiryDate);
  const isExpired = new Date() > expiryDate;

  if (isExpired) {
    reasons.push('已过保质期');
    level = upgradeLevel(level, 'high');
  } else if (daysUntilExpiry <= 3) {
    reasons.push(`还有 ${daysUntilExpiry} 天过期`);
    level = upgradeLevel(level, 'medium');
  } else if (daysUntilExpiry <= 7) {
    reasons.push(`还有 ${daysUntilExpiry} 天过期`);
    level = upgradeLevel(level, 'low');
  }

  if (food.status === 'thawing' && food.thawStartTime) {
    const thawHours = hoursBetween(food.thawStartTime, new Date());
    if (thawHours > 24) {
      reasons.push('解冻超过24小时');
      level = upgradeLevel(level, 'high');
    } else if (thawHours > 12) {
      reasons.push('解冻超过12小时');
      level = upgradeLevel(level, 'medium');
    } else if (thawHours > 6) {
      reasons.push('解冻超过6小时');
      level = upgradeLevel(level, 'low');
    }
  }

  if (food.status === 'frozen' || food.status === 'returned') {
    if (frozenDays > 180) {
      reasons.push(`冷冻 ${frozenDays} 天，超过半年`);
      level = upgradeLevel(level, 'high');
    } else if (frozenDays > 90) {
      reasons.push(`冷冻 ${frozenDays} 天，超过3个月`);
      level = upgradeLevel(level, 'medium');
    } else if (frozenDays > 60) {
      reasons.push(`冷冻 ${frozenDays} 天，超过2个月`);
      level = upgradeLevel(level, 'low');
    }
  }

  if (food.thawCount > 1) {
    reasons.push(`反复解冻 ${food.thawCount} 次`);
    level = upgradeLevel(level, 'low');
  }

  let suggestion = '';
  switch (level) {
    case 'high':
      suggestion = '建议立即丢弃，不要再食用';
      break;
    case 'medium':
      suggestion = '建议尽快食用，不要继续存放';
      break;
    case 'low':
      suggestion = '建议近期食用，注意观察状态';
      break;
    default:
      suggestion = '状态良好，正常保存即可';
  }

  return { level, reasons, suggestion };
}

export function getRiskLevelColor(level: RiskLevel): string {
  switch (level) {
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'medium':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'low':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    default:
      return 'text-secondary-600 bg-secondary-50 border-secondary-200';
  }
}

export function getRiskLevelLabel(level: RiskLevel): string {
  switch (level) {
    case 'high':
      return '高风险';
    case 'medium':
      return '中风险';
    case 'low':
      return '低风险';
    default:
      return '正常';
  }
}

export function sortByRisk(foods: FoodItem[]): FoodItem[] {
  const riskOrder: Record<RiskLevel, number> = {
    high: 0,
    medium: 1,
    low: 2,
    none: 3,
  };

  return [...foods].sort((a, b) => {
    const riskA = assessRisk(a);
    const riskB = assessRisk(b);
    return riskOrder[riskA.level] - riskOrder[riskB.level];
  });
}
