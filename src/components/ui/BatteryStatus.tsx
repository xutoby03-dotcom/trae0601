import type { Battery } from '../../types';
import { getBatteryColor, getBatteryBgColor, formatDate } from '../../utils/helpers';

interface BatteryStatusProps {
  battery: Battery;
  showDetails?: boolean;
  showChargeButton?: boolean;
  onMarkCharged?: () => void;
}

export function BatteryStatus({ battery, showDetails = true, showChargeButton = true, onMarkCharged }: BatteryStatusProps) {
  const colorClass = getBatteryColor(battery.chargeLevel);
  const bgColorClass = getBatteryBgColor(battery.chargeLevel);
  const isFullyCharged = battery.chargeLevel >= 100;

  return (
    <div className="p-3 bg-neutral-800/50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="relative w-6 h-8 border-2 border-neutral-600 rounded-sm flex items-end p-0.5 flex-shrink-0">
            <div
              className={`w-full ${bgColorClass} rounded-sm transition-all duration-500`}
              style={{ height: `${Math.min(battery.chargeLevel, 100)}%` }}
            />
            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-1 bg-neutral-600 rounded-t-sm" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{battery.brand || ''} {battery.model}</p>
            {showDetails && (
              <p className="text-xs text-neutral-500">{battery.capacity}mAh</p>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <p className={`text-lg font-bold ${colorClass}`}>
            {battery.chargeLevel}%
          </p>
          {showDetails && (
            <p className={`text-xs ${isFullyCharged ? 'text-success' : 'text-danger'}`}>
              {isFullyCharged ? '已充满' : '待充电'}
            </p>
          )}
        </div>
      </div>
      {showDetails && (
        <div className="flex justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-700/50">
          <span>循环: {battery.chargeCycles}次</span>
          {battery.lastChargedAt && (
            <span>上次: {formatDate(battery.lastChargedAt)}</span>
          )}
        </div>
      )}
      {showChargeButton && !isFullyCharged && onMarkCharged && (
        <button
          onClick={onMarkCharged}
          className="w-full mt-2 text-xs py-1.5 bg-success/20 text-success rounded hover:bg-success/30 transition-colors"
        >
          标记为已充满
        </button>
      )}
    </div>
  );
}
