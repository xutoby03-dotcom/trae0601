import { cn } from '@/utils/helpers';
import {
  SUPPLY_TYPE_LABELS,
  SUPPLY_TYPE_COLORS,
  LOW_STOCK_THRESHOLDS,
} from '@/utils/constants';
import type { SupplyItem } from '@/types';
import { AlertTriangle } from 'lucide-react';

interface SupplyCardProps {
  supply: SupplyItem;
  onClick?: () => void;
}

export default function SupplyCard({ supply, onClick }: SupplyCardProps) {
  const isLowStock =
    supply.type === 'cleaner'
      ? (supply.remainingPercent ?? 0) <= LOW_STOCK_THRESHOLDS.cleaner
      : supply.quantity <= LOW_STOCK_THRESHOLDS[supply.type];

  return (
    <div
      onClick={onClick}
      className={cn(
        'card p-4 cursor-pointer transition-all duration-200 animate-slide-up',
        isLowStock && 'border-accent-300 bg-accent-50/30'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              SUPPLY_TYPE_COLORS[supply.type]
            )}
          >
            <span className="text-white text-xs font-bold">
              {supply.type === 'blackPen' ? '黑' : supply.type === 'redPen' ? '红' : supply.type === 'bluePen' ? '蓝' : supply.type === 'eraser' ? '擦' : supply.type === 'cleaner' ? '液' : '钉'}
            </span>
          </div>
          <span className="font-medium text-slate-700">{SUPPLY_TYPE_LABELS[supply.type]}</span>
        </div>
        {isLowStock && (
          <div className="flex items-center gap-1 text-accent-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-medium">低库存</span>
          </div>
        )}
      </div>
      <div className="space-y-2">
        {supply.type === 'cleaner' ? (
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-800 font-mono">
                {supply.remainingPercent ?? 0}
              </span>
              <span className="text-sm text-slate-500">%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  isLowStock ? 'bg-accent-500' : 'bg-primary-500'
                )}
                style={{ width: `${supply.remainingPercent ?? 0}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-800 font-mono">{supply.quantity}</span>
            <span className="text-sm text-slate-500">
              {supply.type === 'magnet' ? '个' : supply.type === 'eraser' ? '块' : '支'}
            </span>
          </div>
        )}
        <div className="text-xs text-slate-400 pt-1 border-t border-slate-50">
          <p>存放位置: {supply.location}</p>
          {supply.openDate && (
            <p className="mt-0.5">
              开封日期: {new Date(supply.openDate).toLocaleDateString('zh-CN')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
