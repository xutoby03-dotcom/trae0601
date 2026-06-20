import { useState } from 'react';
import { Pencil, X } from 'lucide-react';
import type { MemoryCard } from '../../types';
import { getCardUsageColor } from '../../utils/helpers';

interface CardCapacityProps {
  card: MemoryCard;
  showDetails?: boolean;
  showFormatButton?: boolean;
  onFormat?: () => void;
  onUpdate?: (updates: Partial<MemoryCard>) => void;
}

export function CardCapacity({ card, showDetails = true, showFormatButton = true, onFormat, onUpdate }: CardCapacityProps) {
  const usagePercent = Math.round((card.usedCapacity / card.totalCapacity) * 100);
  const colorClass = getCardUsageColor(card);
  const isNearFull = usagePercent >= 80;

  const [showEdit, setShowEdit] = useState(false);
  const [editUsedCapacity, setEditUsedCapacity] = useState(String(card.usedCapacity));

  const handleSave = () => {
    const used = parseInt(editUsedCapacity);
    if (isNaN(used)) return;
    onUpdate?.({
      usedCapacity: Math.max(0, Math.min(card.totalCapacity, used)),
    });
    setShowEdit(false);
  };

  const handleOpenEdit = () => {
    setEditUsedCapacity(String(card.usedCapacity));
    setShowEdit(true);
  };

  return (
    <div className="p-3 bg-neutral-800/50 rounded-lg relative">
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
        <div className="text-right flex-shrink-0 ml-2 flex items-center gap-2">
          <div>
            <p className={`text-lg font-bold ${colorClass}`}>
              {card.usedCapacity}/{card.totalCapacity}GB
            </p>
            <p className={`text-xs ${isNearFull ? 'text-danger' : 'text-neutral-500'}`}>
              已用 {usagePercent}%
            </p>
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

      {showEdit && (
        <div className="absolute inset-0 bg-background-card rounded-lg p-3 z-10 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white">编辑存储卡</p>
            <button
              onClick={() => setShowEdit(false)}
              className="p-1 rounded hover:bg-neutral-700 transition-colors"
            >
              <X size={14} className="text-neutral-400" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">已用空间 (GB)</label>
              <input
                type="number"
                value={editUsedCapacity}
                onChange={(e) => setEditUsedCapacity(e.target.value)}
                className="input text-sm py-1.5"
                min="0"
                max={card.totalCapacity}
              />
              <p className="text-xs text-neutral-500 mt-1">总容量: {card.totalCapacity}GB</p>
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
