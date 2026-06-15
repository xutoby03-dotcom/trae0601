import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import type { FoodItem } from '@/types';
import StatusBadge from './StatusBadge';
import { formatDate, daysBetween } from '@/utils/dateUtils';
import { getThawProgress, getThawMethodLabel } from '@/utils/thawTime';
import { assessRisk, getRiskLevelColor } from '@/utils/riskAssessment';
import { MEAT_CATEGORIES, DRAWERS } from '@/data/drawers';
import { cn } from '@/lib/utils';

interface FoodCardProps {
  food: FoodItem;
  variant?: 'default' | 'compact';
}

export default function FoodCard({ food, variant = 'default' }: FoodCardProps) {
  const navigate = useNavigate();
  const risk = assessRisk(food);
  const meatCategory = MEAT_CATEGORIES.find((m) => m.id === food.category);
  const drawer = DRAWERS.find((d) => d.id === food.drawer);

  const thawProgress =
    food.status === 'thawing' && food.thawStartTime && food.thawMethod
      ? getThawProgress(food.thawStartTime, food.weight, food.thawMethod)
      : 0;

  const frozenDays = daysBetween(food.frozenDate, new Date());

  return (
    <div
      onClick={() => navigate(`/inventory/${food.id}`)}
      className={cn(
        'bg-white rounded-2xl shadow-soft overflow-hidden cursor-pointer',
        'transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1',
        'border border-warm-100',
        variant === 'compact' ? 'p-3' : 'p-4'
      )}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            'flex-shrink-0 rounded-xl bg-gradient-to-br from-cream-100 to-cream-200',
            'flex items-center justify-center',
            variant === 'compact' ? 'w-16 h-16 text-2xl' : 'w-20 h-20 text-3xl'
          )}
        >
          {meatCategory?.emoji || '🍖'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                'font-bold text-warm-900 truncate',
                variant === 'compact' ? 'text-sm' : 'text-base'
              )}
            >
              {food.name}
            </h3>
            {risk.level !== 'none' && (
              <span
                className={cn(
                  'flex-shrink-0 w-2 h-2 rounded-full',
                  risk.level === 'high' && 'bg-red-500 animate-pulse',
                  risk.level === 'medium' && 'bg-orange-500',
                  risk.level === 'low' && 'bg-yellow-500'
                )}
              />
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 text-warm-500">
            <span className={variant === 'compact' ? 'text-xs' : 'text-sm'}>
              {food.weight}g
            </span>
            <span className="text-warm-300">·</span>
            <span className={variant === 'compact' ? 'text-xs' : 'text-sm'}>
              {drawer?.icon} {drawer?.name}
            </span>
          </div>

          {variant === 'default' && (
            <div className="mt-2">
              <StatusBadge status={food.status} size="sm" />
            </div>
          )}

          {food.status === 'thawing' && food.thawMethod && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-warm-500 mb-1">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {getThawMethodLabel(food.thawMethod)}
                </span>
                <span>{Math.round(thawProgress)}%</span>
              </div>
              <div className="h-1.5 bg-warm-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-full transition-all duration-500"
                  style={{ width: `${thawProgress}%` }}
                />
              </div>
            </div>
          )}

          {variant === 'default' && food.status === 'frozen' && (
            <div className="mt-2 text-xs text-warm-400">
              冷冻 {frozenDays} 天 · {formatDate(food.frozenDate)}
            </div>
          )}
        </div>
      </div>

      {variant === 'default' && food.suitableDishes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {food.suitableDishes.slice(0, 3).map((dish) => (
            <span
              key={dish}
              className="text-xs px-2 py-0.5 bg-cream-50 text-warm-600 rounded-full"
            >
              {dish}
            </span>
          ))}
        </div>
      )}

      {food.thawCount > 1 && variant === 'default' && (
        <div className="mt-3 text-xs text-orange-500 bg-orange-50 px-2 py-1.5 rounded-lg">
          ⚠️ 已反复解冻 {food.thawCount} 次，不建议再次冷冻
        </div>
      )}
    </div>
  );
}
