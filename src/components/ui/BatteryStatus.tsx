import { useState } from 'react';
import { Pencil, X } from 'lucide-react';
import type { Battery } from '../../types';
import { getBatteryColor, getBatteryBgColor, formatDate } from '../../utils/helpers';

interface BatteryStatusProps {
  battery: Battery;
  showDetails?: boolean;
  showChargeButton?: boolean;
  onMarkCharged?: () => void;
  onUpdate?: (updates: Partial<Battery>) => void;
}

export function BatteryStatus({ battery, showDetails = true, showChargeButton = true, onMarkCharged, onUpdate }: BatteryStatusProps) {
  const colorClass = getBatteryColor(battery.chargeLevel);
  const bgColorClass = getBatteryBgColor(battery.chargeLevel);
  const isFullyCharged = battery.chargeLevel >= 100;

  const [showEdit, setShowEdit] = useState(false);
  const [editChargeLevel, setEditChargeLevel] = useState(String(battery.chargeLevel));
  const [editChargeCycles, setEditChargeCycles] = useState(String(battery.chargeCycles));

  const handleSave = () => {
    const level = parseInt(editChargeLevel);
    const cycles = parseInt(editChargeCycles);
    if (isNaN(level) || isNaN(cycles)) return;
    onUpdate?.({
      chargeLevel: Math.max(0, Math.min(100, level)),
      chargeCycles: Math.max(0, cycles),
      lastChargedAt: level >= 100 ? new Date().toISOString() : battery.lastChargedAt,
    });
    setShowEdit(false);
  };

  const handleOpenEdit = () => {
    setEditChargeLevel(String(battery.chargeLevel));
    setEditChargeCycles(String(battery.chargeCycles));
    setShowEdit(true);
  };

  return (
    <div className="p-3 bg-neutral-800/50 rounded-lg relative">
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
        <div className="text-right flex-shrink-0 ml-2 flex items-center gap-2">
          <div>
            <p className={`text-lg font-bold ${colorClass}`}>
              {battery.chargeLevel}%
            </p>
            {showDetails && (
              <p className={`text-xs ${isFullyCharged ? 'text-success' : 'text-danger'}`}>
                {isFullyCharged ? '已充满' : '待充电'}
              </p>
            )}
          </div>
          {onUpdate && (
            <button
              onClick={handleOpenEdit}
              className="p-1 rounded hover:bg-neutral-700 transition-colors"
              title="编辑"
            >
              <Pencil size={14} className="text-neutral-500 hover:text-primary" />
            </button>
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

      {showEdit && (
        <div className="absolute inset-0 bg-background-card rounded-lg p-3 z-10 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white">编辑电池</p>
            <button
              onClick={() => setShowEdit(false)}
              className="p-1 rounded hover:bg-neutral-700 transition-colors"
            >
              <X size={14} className="text-neutral-400" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">当前电量 (%)</label>
              <input
                type="number"
                value={editChargeLevel}
                onChange={(e) => setEditChargeLevel(e.target.value)}
                className="input text-sm py-1.5"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">循环次数</label>
              <input
                type="number"
                value={editChargeCycles}
                onChange={(e) => setEditChargeCycles(e.target.value)}
                className="input text-sm py-1.5"
                min="0"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowEdit(false)}
              className="flex-1 text-xs py-1.5 bg-neutral-700 text-neutral-300 rounded hover:bg-neutral-600 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 text-xs py-1.5 bg-primary text-white rounded hover:bg-primary-hover transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
