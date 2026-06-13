import { AlertTriangle } from 'lucide-react';
import { formatWeight } from '@/utils/calculations';
import type { LoadStatus } from '@/utils/calculations';

interface Props {
  ratioPercent: number;
  status: LoadStatus;
  actualGrams: number;
  recommendedKg: number;
  orientation?: 'horizontal' | 'vertical';
  showLabel?: boolean;
}

const colorMap = {
  normal: 'bg-forest-500',
  warning: 'bg-warn-500',
  overload: 'bg-firstaid-500',
};

const textColorMap = {
  normal: 'text-forest-700',
  warning: 'text-warn-600',
  overload: 'text-firstaid-600',
};

export default function LoadProgressBar({
  ratioPercent,
  status,
  actualGrams,
  recommendedKg,
  orientation = 'horizontal',
  showLabel = true,
}: Props) {
  if (orientation === 'vertical') {
    return (
      <div className="flex flex-col items-center gap-2 h-full">
        <div className="relative w-3 flex-1 min-h-[120px] rounded-full bg-parchment-200 overflow-hidden">
          <div
            className={`absolute bottom-0 left-0 right-0 ${colorMap[status]} transition-all duration-500 ease-out ${
              status === 'overload' ? 'animate-pulse-warn rounded-full' : 'rounded-t-full'
            }`}
            style={{ height: `${Math.min(ratioPercent, 100)}%` }}
          />
        </div>
        {showLabel && (
          <div className="text-center">
            <div className={`text-sm font-bold ${textColorMap[status]}`}>
              {formatWeight(actualGrams)}
            </div>
            <div className="text-[10px] text-forest-500">
              /{recommendedKg.toFixed(1)}kg
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {status === 'overload' && (
            <AlertTriangle size={14} className="text-firstaid-500" />
          )}
          <span className={`text-sm font-semibold ${textColorMap[status]}`}>
            {formatWeight(actualGrams)}
          </span>
          <span className="text-xs text-forest-500">
            / 建议 {recommendedKg.toFixed(1)}kg
          </span>
        </div>
        <span className={`text-xs font-semibold ${textColorMap[status]}`}>
          {ratioPercent.toFixed(0)}%
        </span>
      </div>
      <div className="progress-bar-track">
        <div
          className={`progress-bar-fill ${colorMap[status]} ${
            status === 'overload' ? 'animate-pulse-warn' : ''
          }`}
          style={{ width: `${Math.min(ratioPercent, 100)}%` }}
        />
      </div>
      {status === 'overload' && (
        <p className="mt-1.5 text-xs text-firstaid-600 font-medium">
          ⚠ 超重！请减少负重或分配给其他队员
        </p>
      )}
    </div>
  );
}
