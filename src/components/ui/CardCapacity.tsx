import type { MemoryCard } from '../../types';
import { getCardUsageColor } from '../../utils/helpers';

interface CardCapacityProps {
  card: MemoryCard;
  showDetails?: boolean;
  showFormatButton?: boolean;
  onFormat?: () => void;
}

export function CardCapacity({ card, showDetails = true, showFormatButton = true, onFormat }: CardCapacityProps) {
  const usagePercent = Math.round((card.usedCapacity / card.totalCapacity) * 100);
  const colorClass = getCardUsageColor(card);
  const isNearFull = usagePercent >= 80;

  return (
    <div className="p-3 bg-neutral-800/50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{card.brand} {card.model}</p>
          {showDetails && card.speed && (
            <p className="text-xs text-neutral-500">{card.speed} · {card.capacity}</p>
          )}
          {!showDetails && (
            <p className="text-xs text-neutral-500">{card.capacity}</p>
          )}
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <p className={`text-lg font-bold ${colorClass}`}>
            {card.usedCapacity}/{card.totalCapacity}GB
          </p>
          <p className={`text-xs ${isNearFull ? 'text-danger' : 'text-neutral-500'}`}>
            已用 {usagePercent}%
          </p>
        </div>
      </div>
      <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isNearFull ? 'bg-danger' : usagePercent >= 50 ? 'bg-warning' : 'bg-success'
          }`}
          style={{ width: `${Math.min(usagePercent, 100)}%` }}
        />
      </div>
      {showDetails && (
        <div className="flex justify-between text-xs text-neutral-500 pt-2">
          <span>剩余: {card.totalCapacity - card.usedCapacity}GB</span>
          <span className={usagePercent < 10 ? 'text-success' : 'text-neutral-500'}>
            {usagePercent < 10 ? '已格式化' : '未格式化'}
          </span>
        </div>
      )}
      {showFormatButton && usagePercent > 10 && onFormat && (
        <button
          onClick={onFormat}
          className="w-full mt-2 text-xs py-1.5 bg-warning/20 text-warning rounded hover:bg-warning/30 transition-colors"
        >
          格式化存储卡
        </button>
      )}
    </div>
  );
}
